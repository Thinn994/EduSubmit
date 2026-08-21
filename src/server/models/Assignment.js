const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: String }, // Can be updated to Date type if needed
    points: { type: Number, default: 100 },
    teacher: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
