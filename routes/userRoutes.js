const express = require('express')
const { registerUser, authUser, allUsers, fetchUserByPhoneNumber, updateUser, addContact, fetchContacts } = require('../controllers/userControllers')
const { protect } = require('../middleware/authMiddleware')
const multer = require("multer")
const path = require("path")
const User = require('../models/userModel')

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads')
    },

    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname))
    }

})


const upload = multer({ storage: storage })
const router = express.Router()

router.route("/").get(protect, allUsers)
router.route("/").post(registerUser)
router.post("/login", authUser)
router.post("/forgetPassword", fetchUserByPhoneNumber)
router.route("/edit").put(protect, updateUser)
router.route("/addContact").post(protect, addContact)
router.route("/contacts").get(protect, fetchContacts)
router.route("/avatar").post(protect, upload.single('avatar'), async (req, res) => {
    const updatedUserAvatar = await User.findByIdAndUpdate(req.user._id, { pic: req.file.filename })
    if (updatedUserAvatar) {
        res.status(200).json({ "message": "avatar updated successfully" })
    }
})




module.exports = router