const express = require("express")
const dotenv = require("dotenv")
const { chats } = require("./data/data")
const connectDb = require("./config/db")
const userRoutes = require("./routes/userRoutes")
const chatRoutes = require("./routes/chatRoutes")
const messageRoutes = require('./routes/messageRoute')
const { Server } = require("socket.io")
const WebSocket = require('ws')
const { protect, protectSocketIo } = require("./middleware/authMiddleware")
const Chat = require("./models/chatModel")
const cors = require("cors")

const app = express()

app.use("/uploads", express.static("uploads"));


const path = require("path")


app.use(cors())
app.use(express.urlencoded({ extended: true }));



app.use(express.json())

dotenv.config()
connectDb()


app.get('/', (req, res) => {
    res.json({ message: path.dirname })
})



// app.get('/api/chat', (req, res) => {
//     res.send(chats)
// })

app.get('/api/chat/:id', (req, res) => {
    const singleChat = chats.find(c => c._id == req.params.id)
    res.send(singleChat)

})

app.use('/api/user', userRoutes)

app.use('/api/chat', chatRoutes)

app.use('/api/message', messageRoutes)


const PORT = process.env.PORT || 5000
const server = app.listen(PORT, console.log(`Server Started on Port ${PORT}`))





const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
        // credentials: true,
    },
})

io.use(protectSocketIo)



io.on("connection", (socket) => {
    console.log("Connected to socket.io")
    socket.on("setup", (userData) => {

        socket.join(userData._id)
        console.log(userData._id)
        socket.emit("connected")
    })

    socket.on("join chat", (room) => {
        socket.join(room)
        console.log("User Joined Room: " + room)
    })
    socket.on("typing", (room) => socket.in(room).emit("typing"))
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat

        if (!chat.users) return console.log("chat.users not defined")

        chat.users.forEach((user) => {
            // if (user._id == newMessageRecieved.sender._id) return

            socket.in(user._id).emit("message recieved", newMessageRecieved)
        })
    })


    socket.off("setup", () => {
        console.log("USER DISCONNECTED")
        socket.leave(userData._id)
    })
})

