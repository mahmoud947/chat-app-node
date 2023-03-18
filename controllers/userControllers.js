const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const generateToken = require('../config/generateToken')
const { find } = require('../models/userModel')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads')
  },

  filename: function (req, file, callback) {
    callback(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic, phone } = req.body

  if (!name || !email || !password) {
    resizeBy.status(400).json({
      message: 'please Enter all the Fields',
      status: 400,
    })
  }
  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400).json({
      message: 'User already exists',
      status: 400,
    })
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    pic,
  }).catch(error => {
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
      message: 'Successfully',
      status: 201,
    })
  } else {
    res.status(400).json({
      message: 'Failed to Create User',
      status: 400,
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
      message: 'Successfully',
      status: 200,
    })
  } else {
    res.status(401).json({
      message: 'Invalid Email or Password',
      status: 400,
    })
  }
})

const deleteAccount = asyncHandler(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.user._id)
  if (deletedUser) {
    res.status(200).json({
      message: 'user deleted successfully',
      status: 200,
    })
  } else {
    res.status(400).json({
      message: 'unkowen error',
      status: 400,
    })
  }
})

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
  // ? {
  //   $or: [
  //     { name: { $regex: req.query.search, $options: "i" } },
  //     { email: { $regex: req.query.search, $options: "i" } },
  //     { phone: { $regex: req.query.search, $options: "i" } },
  //   ],
  // }
  // : {};

  const users = await User.findOne({ phone: keyword }).select('-password')
  if (users) {
    res.status(200).json({
      users: users,
      message: 'Successfully',
      status: 200,
    })
  } else {
    res.status(404).json({
      found: false,
      message: 'user not found',
      status: 404,
    })
  }
})

const fetchUserByPhoneNumber = asyncHandler(async (req, res) => {
  const keyword = req.body
    ? {
        $or: [
          { name: req.body.name },
          { email: req.body.email },
          { phone: req.body.phone },
        ],
      }
    : {}

  const user = await User.findOne(keyword).select('-password')

  if (user) {
    res.status(200).json({
      found: true,
      status: 200,
      message: 'Successfully',
    })
  } else {
    res.status(404).json({
      found: false,
      message: 'user not found',
      status: 404,
    })
  }
})

// {
//     "_id": "6412c2229addff76c03ad823",
//     "name": "Alaa",
//     "email": "alaa@gmail.com",
//     "pic": "https://cdn-icons-png.flaticon.com/512/2202/2202112.png",
//     "phone": "0123456789000",
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MTJjMjIyOWFkZGZmNzZjMDNhZDgyMyIsImlhdCI6MTY3ODk1MjMwOSwiZXhwIjoxNjgxNTQ0MzA5fQ.lK7CUVr0phWk6BtSbwAsjKpDfYTYZYR7sA38LJs1Szg",
//     "message": "Successfully",
//     "status": 200
// }

const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await User.findOneAndUpdate(
    { phone: req.body.phone },
    req.body,
  ).select('-contacts')
  if (updatedUser) {
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      pic: updatedUser.pic,
      phone: updatedUser.phone,
      token: req.headers.authorization.split(' ')[1],
      message: 'Successfully',

      status: 200,
      message: 'User updated Successfully',
    })
  } else {
    res.status(400).json({
      status: 400,
      message: 'User updated Field',
    })
  }
})

const addContact = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.user._id, {
    $push: { contacts: req.body.userId },
  })

  if (updatedUser) {
    res.status(201).json({
      status: 201,
      message: 'Contact added successfully',
    })
  } else {
    res.status(400).json({
      status: 400,
      message: 'User updated Field',
    })
  }
})

const fetchContacts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'contacts',
    '-password -contacts',
  )

  if (user) {
    res.status(201).send(user)
  } else {
    res.status(400).json({
      status: 400,
      message: 'unknown error',
    })
  }
})

module.exports = {
  registerUser,
  authUser,
  allUsers,
  fetchUserByPhoneNumber,
  updateUser,
  addContact,
  fetchContacts,
  deleteAccount,
}
