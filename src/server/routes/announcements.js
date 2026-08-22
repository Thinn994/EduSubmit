const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// GET /api/announcements?courseId=123
router.get('/', async (req, res) => {
    try {
        const { courseId } = req.query;
        if (!courseId) return res.status(400).json({ error: 'courseId required' });
        
        const announcements = await Announcement.find({ courseId }).sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (error) {
        console.error("GET announcements error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/announcements
router.post('/', async (req, res) => {
    try {
        const { courseId, teacherId, teacherName, content } = req.body;
        if (!courseId || !content) return res.status(400).json({ error: 'Missing fields' });

        const announcement = new Announcement({
            courseId,
            teacherId,
            teacherName,
            content
        });
        await announcement.save();
        res.status(201).json(announcement);
    } catch (error) {
        console.error("POST announcement error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/announcements/:id
router.put('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!announcement) return res.status(404).json({ error: 'Not found' });
        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/announcements/:id
router.delete('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).json({ error: 'Not found' });
        res.status(200).json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
