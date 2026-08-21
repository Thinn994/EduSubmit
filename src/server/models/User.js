const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firebaseUid: { type: String, unique: true, sparse: true }, // Optional for MERN auth users
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Hashed password
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
