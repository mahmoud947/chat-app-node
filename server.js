const express = require("express")
const dotenv = require("dotenv")
const { chats } = require("./data/data")
const connectDb = require("./config/db")
const app = express()

dotenv.config()
connectDb()





app.get('/', (req, res) => {
    res.json({ message: "hello" })
})


app.get('/api/chat', (req, res) => {
    res.send(chats)
})

app.get('/api/chat/:id', (req, res) => {
    const singleChat = chats.find(c => c._id == req.params.id)
    res.send(singleChat)

})











const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server Started on Port ${PORT}`))
