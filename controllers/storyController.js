const asyncHandler = require('express-async-handler')
const Story = require('../models/storyModel')


const addStory = asyncHandler(async (req, res) => {
    var story = {}
    if (req.file == null) {
        story = {
            author: req.user._id,
            content: req.body.content,
            expireAfterSeconds: 3600,
            type: 1
        }
    } else {
        story = {
            author: req.user._id,
            content: req.body.content,
            image: req.file.filename,
            expireAfterSeconds: 3600,
            type: 2
        }
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


const getStories = asyncHandler(async (req, res) => {

    const myStory = await Story.find({ author: req.user._id }).populate('author','name pic email phone')
    const stories = await Story.find({ author: req.user.contacts }).populate('author','name pic email phone')
    res.status(200).json({
        myStories: myStory,
        stories: stories
    })
})

module.exports = {
    addStory,
    getStories
}

