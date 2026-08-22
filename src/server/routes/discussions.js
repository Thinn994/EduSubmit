const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');

// GET /api/discussions?courseId=123
router.get('/', async (req, res) => {
    try {
        const { courseId } = req.query;
        if (!courseId) return res.status(400).json({ error: 'courseId required' });
        
        const discussions = await Discussion.find({ courseId }).sort({ createdAt: -1 });
        res.status(200).json(discussions);
    } catch (error) {
        console.error("GET discussions error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/discussions/:id
router.get('/:id', async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ error: 'Not found' });
        res.status(200).json(discussion);
    } catch (error) {
        console.error("GET discussion error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/discussions
router.post('/', async (req, res) => {
    try {
        const { courseId, authorId, authorName, title, content } = req.body;
        if (!courseId || !title || !content) return res.status(400).json({ error: 'Missing fields' });

        const discussion = new Discussion({
            courseId,
            authorId,
            authorName,
            title,
            content
        });
        await discussion.save();
        res.status(201).json(discussion);
    } catch (error) {
        console.error("POST discussion error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/discussions/:id/reply
router.post('/:id/reply', async (req, res) => {
    try {
        const { authorId, authorName, content } = req.body;
        if (!content) return res.status(400).json({ error: 'Content required' });

        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ error: 'Not found' });

        discussion.replies.push({
            authorId,
            authorName,
            content
        });
        await discussion.save();
        res.status(201).json(discussion);
    } catch (error) {
        console.error("POST reply error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
