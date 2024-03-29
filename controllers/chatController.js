const asyncHandler = require('express-async-handler')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')
const { HttpStatus } = require('../assets/HttpCodes')
const ErrorMessages = require('../assets/strings')
const { use } = require('../routes/chatRoutes')

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        console.log('UserId parm not sent with request')
        return res.sendStatus(400)
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate('users', '-password')
        .populate('latestMessage')

    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name pic email',
    })

    if (isChat.length > 0) {
        res.send(isChat[0])
    } else {
        var chatData = {
            chatName: 'sender',
            isGroupChat: false,
            users: [req.user._id, userId],
            contact: [req.user._id, userId],
        }

        try {
            const createdChat = await Chat.create(chatData)
            const FullChat = await Chat.findOne({ _id: createdChat._id })
                .populate('users', '-password')
                .populate('contact', '-password')
            res.status(200).send(FullChat)
        } catch (error) { }
    }
})

const fetchChats = asyncHandler(async (req, res, next) => {
    try {
        return Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate('users', '-password -contacts')
            .populate('groupAdmin', '-password -contacts')
            .populate('latestMessage')
            .populate('contact', '-password -contacts', {
                _id: { $ne: req.user._id },
            })
            .sort({ updatedAt: -1 })
            .lean() // Don't hydrate
            .exec()
            .then(async results => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: 'name pic email',
                }, { lean: true })
                return res.status(200).send(results.map(item => {
                    if (item?.contact?.length === 1){
                        item.contact = item.contact[0]
                    } else{
                     item.contact = {
                            _id: item._id,
                            name: item.chatName,
                            pic: "group.png",
                     }
                    }
                    return item
                }))
            })
    } catch (error) {
        next(error)
    }
})

const createGroupChat = asyncHandler(async (req, res) => {
    const { users, name } = req.body

    if (!users || !name) {
        return res.status(400).json({
            error: 'Please fill all felids',
        })
    }

    console.log(users)
    var _users = users
    if (_users.length < 2) {
        return res.status(400).json({
            error: 'group chat required more than 2 users',
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
            .populate('users', '-password')
            .populate('groupAdmin', '-password')

        res.status(200).json(fullGroupChat)
    } catch (error) {
        res.status(400).json(error)
    }
})

const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName,
        },
        {
            new: true,
        },
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password')
        .lean()

    if (!updatedChat) {
        res.status(400).json({
            error: 'Chat Not Found',
        })
    } else {
        res.json(updatedChat)
    }
})

const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        { new: true },
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password')
        .lean()
    if (!added) {
        res.status(400).json({
            error: 'Chat Not Found',
        })
    } else {
        res.json(added)
    }
})

const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        { new: true },
    )
        .populate('users', '-password')
        .populate('groupAdmin', '-password')
        .lean()
        .exec()
    if (!removed) {
        res.status(400).json({
            error: 'Chat Not Found',
        })
    } else {
        res.json(removed)
    }
})

const searchChatsR = asyncHandler(async (req, res, next) => {
    const keyword = req.query.phone

    if (!keyword)
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: ErrorMessages.ErrorMessage.MISSING_QUERY,
            error: ErrorMessages.ErrorCode.MISSING_QUERY,
            status: HttpStatus.BAD_REQUEST
        })

    try {
        const userSearched = await User.find({ phone: keyword });

        return Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { contact: { $elemMatch: { $in: userSearched } } },
            ]
        })
            .populate("users", "-password -contacts")
            .populate("groupAdmin", "-password -contacts")
            .populate("latestMessage")
            .populate("contact", {
                password: 0,
                contacts: 0
            }, { _id: { $ne: req.user._id } })
            .sort({ updatedAt: -1 })
            .lean()
            .exec()
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: "name pic email"
                }, { lean: true })
                return res.status(200).send(
                    results.map(item => {
                        if (item?.contact?.length === 1) item.contact = item.contact[0]
                        return item
                    })
                )
            })
    } catch (error) {
        next(error);
    }
})

module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    searchChatsR,
}
