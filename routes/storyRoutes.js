const express = require('express')
const { addStory } = require('../controllers/storyController')
const { protect } = require('../middleware/authMiddleware')

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

const router = express.Router()

router.route('/').post(protect, upload.single('image'), addStory)

module.exports = router
