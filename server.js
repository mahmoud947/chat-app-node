const express = require('express')
const dotenv = require('dotenv')
const { chats } = require('./data/data')
const connectDb = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoute')
const { Server } = require('socket.io')
const WebSocket = require('ws')



const app = express()



app.use(express.json())

dotenv.config()
connectDb()


app.get('/', (req, res) => {
    res.json({ message: 'hello' })
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



// wss.on('connection', (socket) => {
//     socket.send('hello')
//     socket.on('message', message => {
//         let messageParsed = JSON.parse(message)
//         console.log(messageParsed)
//         // let messageParsed = JSON.parse(data.join)
//         //socket.send(message.join)
//     })
// })








const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: '*',
        cors:"*"
        // credentials: true,
    },
})



io.on('connection', (socket) => {
    socket.send('hello')
    socket.emit('join chat', 'hello')
    socket.on('setup', (userData) => {
        socket.join(userData._id)
        socket.emit('setup',userData)

    })

    socket.on('join chat', (chat) => {
        socket.join(chat._id)
        console.log('user joined Room ' + chat._id)
    })
    console.log('new user connected')
})


io.on("connection", (socket) => {
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    console.log("Connected to socket.io");
    socket.send("hello")
    socket.emit("connected");
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
        socket.send("connected")
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        socket.emit("hello hello hello")
        var chat = newMessageReceived.chat;

        console.log(chat);

        if (!chat.users) return console.log('chat.users not defined')

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("received", newMessageReceived);
        });
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});