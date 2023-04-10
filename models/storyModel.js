const mongoose = require('mongoose')

const storyModel = mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, trim: true },
        image: { type: String },
        type: { type: Number, default: 1 }
    },
    {
        timestamps: true,
    },
)
storyModel.index({ createdAt: 1 }, { expireAfterSeconds: 3600, unique: true });
const Story = mongoose.model('Story', storyModel)

module.exports = Story
