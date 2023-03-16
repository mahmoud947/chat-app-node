const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const { use } = require("../routes/chatRoutes");

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        console.log("UserId parm not sent with request");
        return res.sendStatus(400)
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("users", "-password").populate("latestMessage")

    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: "name pic email"
    })

    if (isChat.length > 0) {
        res.send(isChat[0])
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
            contact: [req.user._id, userId]
        }

        try {
            const createdChat = await Chat.create(chatData)
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password").populate("contact", "-password")
            res.status(200).send(FullChat)
        } catch (error) {

        }
    }
})

const fetchChats = asyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password -contacts")
            .populate("groupAdmin", "-password -contacts")
            .populate("latestMessage")
            .populate("contact", "-password -contacts", { _id: { $ne: req.user._id } })
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: "name pic email"
                })
                res.status(200).send(results)
            })
    } catch (error) {
        res.status(400).json(error)
    }
})




const createGroupChat = asyncHandler(async (req, res) => {
    const { users, name } = req.body

    if (!users || !name) {
        return res.status(400).json({
            error: "Please fill all felids"
        })
    }

    console.log(users);
    var _users = users
    if (_users.length < 2) {
        return res.status(400)
            .json({
                error: "group chat required more than 2 users"
            })
    }

    _users.push(req.user)

    try {
        const groupChat = await Chat.create({
            chatName: name,
            users: _users,
            isGroupChat: true,
            groupAdmin: req.user,
        })

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        res.status(200).json(fullGroupChat)
    } catch (error) {
        res.status(400).json(error)
    }

})

const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body

    const updatedChat = await Chat.findByIdAndUpdate(chatId, {
        chatName: chatName
    }, {
        new: true
    }).populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!updatedChat) {
        res.status(400).json({
            error: "Chat Not Found"
        })
    } else {
        res.json(updatedChat)
    }
})

const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    const added = await Chat.findByIdAndUpdate(chatId, {
        $push: { users: userId }
    }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
    if (!added) {
        res.status(400).json({
            error: "Chat Not Found"
        })
    } else {
        res.json(added)
    }

})


const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    const removed = await Chat.findByIdAndUpdate(chatId, {
        $pull: { users: userId }
    }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
    if (!removed) {
        res.status(400).json({
            error: "Chat Not Found"
        })
    } else {
        res.json(removed)
    }

})



const searchChatsR = asyncHandler(async (req, res) => {

    const keyword = req.query.phone


    try {
        const userSearched = await User.findOne({ phone: keyword })


        console.log(userSearched._id);

        Chat.find({
            isGroupChat: false,
            $and: [
                { contact: { $elemMatch: { $eq: req.user._id.contacts } } },
                { contact: { $elemMatch: { $ne: { _id: req.user._id } } } },
            ]
        })
            .populate("users", "-password -contacts")
            .populate("groupAdmin", "-password -contacts")
            .populate("latestMessage")
            .populate("contact", "-password -contacts", { _id: { $ne: req.user._id } })

            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: "name pic email"
                })
                res.status(200).send(results)
            })
    } catch (error) {
        res.status(400).json(error)
    }
})

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup, searchChatsR }