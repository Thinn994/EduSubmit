const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacherId: { type: String, required: true },
    teacherName: { type: String },
    content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
