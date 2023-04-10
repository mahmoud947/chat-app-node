const jwt = require('jsonwebtoken')
const User = require('../models/userModel.js')
const asyncHandler = require('express-async-handler')

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    res.status(401).json({
      error: 'Not authorized, no token',
    })
  }
})

const protectSocketIo = asyncHandler(async (socket, next) => {
  let token

  if (
    socket.handshake.headers.authorization &&
    socket.handshake.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = socket.handshake.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      socket.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      console.log('ecxxx')
    }
  }
})

module.exports = { protect, protectSocketIo }
