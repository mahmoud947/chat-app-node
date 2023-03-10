const asyncHandler = require("express-async-handler");

const Message = require('../models/messageModel')
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body

    if (!content || !chatId) {
        return res.status(400).json({
            error: "Invalid data passed into request"
        })
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }


    try {
        var message = await Message.create(newMessage)

        message = await message.populate("sender", "name pic")
        message = await message.populate("chat")
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email'
        })

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        })
        res.json(message)
    } catch (error) {
        res.status(400).json(error)
    }

})


const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic ,email, phone")
            .populate("chat")
        res.json(messages)
    } catch (error) {
        res.status(400).json(error)
    }
})

module.exports = { sendMessage, allMessages }