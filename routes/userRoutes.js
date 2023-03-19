const express = require('express')
const {
  registerUser,
  authUser,
  allUsers,
  fetchUserByPhoneNumber,
  updateUser,
  addContact,
  fetchContacts,
  getUserInfo,
  searchInUserContent,
  deleteUser
} = require('../controllers/userControllers')
const { protect } = require('../middleware/authMiddleware')
const multer = require('multer')
const path = require('path')
const User = require('../models/userModel')

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads')
  },

  filename: function (req, file, callback) {
    callback(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })
const router = express.Router()

router.route('/').get(protect, allUsers)
router.route('/').post(registerUser)
router.route('/').delete(protect,deleteUser)
router.post('/login', authUser)
router.post('/forgetPassword', fetchUserByPhoneNumber)
router.route('/edit').put(protect, updateUser)
router.route('/addContact').post(protect, addContact)
router.route('/contacts').get(protect, fetchContacts)
router.route('/contacts/search').get(protect,searchInUserContent)
router.route('/info').get(protect, getUserInfo)
router
  .route('/avatar')
  .post(protect, upload.single('avatar'), async (req, res) => {
    const updatedUserAvatar = await User.findByIdAndUpdate(req.user._id, {
      pic: req.file.filename,
    })



    if (updatedUserAvatar) {
      const user = await User.findOne(req.user._id)
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        phone: user.phone,
        token: req.headers.authorization.split(' ')[1],
        message: 'avatar updated successfully',
        status: 200
      })
    }
  })

module.exports = router
