const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    visibility: { type: Boolean, default: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    fileSize: { type: String },
    type: { type: String }, // e.g., 'pdf', 'video', 'link'
    textContent: { type: String } // Extracted text for AI processing
}, { timestamps: true });

module.exports = mongoose.model('Material', MaterialSchema);
