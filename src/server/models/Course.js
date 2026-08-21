const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    classCode: { type: String, unique: true }, // The 6-char random code
    section: { type: String },
    teacherId: { type: String, required: true }, // Firebase UID of the teacher
    teacher: { type: String, required: true },
    enrolledStudents: [{ type: String }], // Array of Firebase UIDs
    color: { type: String, default: 'bg-blue-600' }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
