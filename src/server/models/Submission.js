const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    studentId: { type: String, required: true }, // Firebase UID
    studentName: { type: String },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    grade: { type: Number },
    feedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
