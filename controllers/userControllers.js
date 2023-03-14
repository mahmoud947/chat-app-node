const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const generateToken = require("../config/generateToken")
const { find } = require("../models/userModel")


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic, phone } = req.body

    if (!name || !email || !password) {
        resizeBy.status(400).json({
            message: "please Enter all the Fields",
            status:400
        })

    }
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400).json({
            message: "User already exists",
            status:400
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
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            phone: user.phone,
            token: generateToken(user._id),
            message: "Successfully",
            status:201
        })
    } else {
        res.status(400).json({
            message: "Failed to Create User",
            status:400
        })
    }
})

const authUser = asyncHandler(async (req, res) => {
    const { phone, password } = req.body

    const user = await User.findOne({ phone })
    if (user && (await user.matchPassword(password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            phone: user.phone,
            token: generateToken(user._id),
            message: "Successfully",
            status:200
        })
    } else {
        res.status(401).json({
            message: "Invalid Email or Password",
            status:400
        })

    }
})

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
                { phone: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select('-password')
    res.status(200).json(
        {
            users:users,
            message: "Successfully",
            status:200
        }
    );
});


const fetchUserByPhoneNumber = asyncHandler(async (req, res) => {

    const keyword = req.body
        ? {
            $or: [
                { name: req.body.name },
                { email: req.body.email },
                { phone: req.body.phone },
            ],
        }
        : {};

    const user = await User.findOne(keyword).select('-password')

    if (user) {
        res.status(200).json({
            found:true,
            status:200,
            message: "Successfully",
        });
    } else {
        res.status(404).json({
            found:false,
            message: "user not found",
            status:404
        })
    }

})

const updateUser = asyncHandler(async(req,res)=>{
    const updatedUser =await User.findOneAndUpdate({phone:req.body.phone},req.body)
    if(updatedUser){
        res.status(200).json({
            status:200,
            message:"User updated Successfully"
        })
    }else{
        res.status(400).json({
            status:400,
            message:"User updated Field"
        })
    }
})

module.exports = { registerUser, authUser, allUsers, fetchUserByPhoneNumber,updateUser }