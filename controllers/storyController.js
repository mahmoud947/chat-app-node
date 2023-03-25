const asyncHandler = require('express-async-handler')
const Story = require('../models/storyModel')


const addStory = asyncHandler(async (req, res) => {

    const story = {
        author: req.user._id,
        content: req.body.content,
        image: req.file.filename,
        expireAfterSeconds: 10
    }
    const save = await Story.create(story)
    if (save) {
        res.json({
            message: "story created successfully"
        })
    } else {
        res.json({
            message: "an error"
        })
    }
})

module.exports = {
    addStory
}

// post(protect, upload.single('avatar'), async (req, res) => {
//     const updatedUserAvatar = await User.findByIdAndUpdate(req.user._id, {
//       pic: req.file.filename,
//     })