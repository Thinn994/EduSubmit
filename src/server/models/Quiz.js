const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    linkedAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    questions: [{
        text: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
