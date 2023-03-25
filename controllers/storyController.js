const asyncHandler = require('express-async-handler')
const Story = require('../models/storyModel')

const addStory = asyncHandler(async (req, res) => {

    const story = {
        author: req.user._id,
        content: req.body.content,
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