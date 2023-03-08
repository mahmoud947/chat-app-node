const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const generateToken = require("../config/generateToken")


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic, phone } = req.body

    if (!name || !email || !password) {
        resizeBy.status(400).json({
            error: "please Enter all the Fields"
        })

    }
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400).json({
            error: "User already exists"
        })

    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
        pic,
    }).catch((error) => {
        res.json({ message: error.message })
    })

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            phone: user.phone,
            token: generateToken(user._id)
        })
    } else {
        res.status(400).json({
            message: "Failed to Create User"
        })
    }
})

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (user && (await user.matchPassword(password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            phone: user.phone,
            token: generateToken(user._id)
        })
    } else {
        res.status(401).json({
            message: "Invalid Email or Password"
        })

    }
})

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    res.send(users);
});

module.exports = { registerUser, authUser, allUsers }