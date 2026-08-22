const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true }
}, { timestamps: true });

const DiscussionSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    replies: [ReplySchema]
}, { timestamps: true });

module.exports = mongoose.model('Discussion', DiscussionSchema);
