const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users/sync - Sync Firebase user to MongoDB
router.post('/sync', async (req, res) => {
    try {
        const { firebaseUid, email, name, role } = req.body;
        
        let user = await User.findOne({ email });
        
        if (user) {
            // Update firebaseUid if it was created via MERN auth first
            if (!user.firebaseUid) {
                user.firebaseUid = firebaseUid;
                await user.save();
            }
        } else {
            user = new User({ firebaseUid, email, name, role });
            await user.save();
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
