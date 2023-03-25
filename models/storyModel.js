const mongoose = require('mongoose')

const storyModel = mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, trim: true },
        image: { type: String },
    },
    {
        timestamps: true,
    },
)
storyModel.index({ createdAt: 1 }, { expireAfterSeconds: 10, unique: true });
const Story = mongoose.model('Story', storyModel)

module.exports = Story
