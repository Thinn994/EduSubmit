const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({ 
                error: "Email này đã được đăng ký" 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        // Set firebaseUid to match _id so older code using .uid still works
        newUser.firebaseUid = newUser._id.toString();

        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: { uid: newUser.firebaseUid, name: newUser.name, email: newUser.email, role: newUser.role } });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Email hoặc mật khẩu không đúng!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Email hoặc mật khẩu không đúng!" });
        }

        res.status(200).json({ 
            message: "Login successful", 
            user: { 
                uid: user.firebaseUid || user._id.toString(), 
                _id: user._id,
                name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
