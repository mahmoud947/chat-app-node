const express = require('express')
const { addStory } = require('../controllers/storyController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

router.route('/').post(protect, addStory)

module.exports = router
