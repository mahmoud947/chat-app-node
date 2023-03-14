const express = require('express')
const { registerUser, authUser, allUsers, fetchUserByPhoneNumber, updateUser, addContact, fetchContacts } = require('../controllers/userControllers')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.route("/").get(protect, allUsers)
router.route("/").post(registerUser)
router.post("/login", authUser)
router.post("/forgetPassword", fetchUserByPhoneNumber)
router.route("/edit").put(protect, updateUser)
router.route("/addContact").post(protect, addContact)
router.route("/contacts").get(protect, fetchContacts)

module.exports = router