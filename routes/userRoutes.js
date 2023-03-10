const express = require('express')
const { registerUser, authUser, allUsers, fetchUserByPhoneNumber } = require('../controllers/userControllers')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.route("/").get(protect, allUsers)
router.route("/").post(registerUser)
router.post("/login", authUser)
router.post("/forgetPassword", fetchUserByPhoneNumber)

module.exports = router