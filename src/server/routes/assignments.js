const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// GET /api/assignments?courseId=123
router.get('/', async (req, res) => {
    try {
        const { courseId } = req.query;
        let query = {};
        if (courseId) query.courseId = courseId;
        
        const assignments = await Assignment.find(query);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/assignments/:id
router.get('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ error: 'Not found' });
        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/assignments
router.post('/', async (req, res) => {
    try {
        const assignment = new Assignment(req.body);
        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/assignments/:id
router.put('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndDelete(req.params.id);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        res.status(200).json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
