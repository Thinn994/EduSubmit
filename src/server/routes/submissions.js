const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// GET /api/submissions?assignmentId=123&studentId=456
router.get('/', async (req, res) => {
    try {
        const { assignmentId, studentId } = req.query;
        let query = {};
        if (assignmentId) query.assignmentId = assignmentId;
        if (studentId) query.studentId = studentId;
        
        const submissions = await Submission.find(query);
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/submissions
router.post('/', async (req, res) => {
    try {
        const { assignmentId, studentId, fileUrl, fileName, courseId, studentName } = req.body;
        
        // Upsert logic (allow resubmission)
        let submission = await Submission.findOne({ assignmentId, studentId });
        
        if (submission) {
            submission.fileUrl = fileUrl;
            submission.fileName = fileName;
            await submission.save();
        } else {
            submission = new Submission({ assignmentId, studentId, fileUrl, fileName, courseId, studentName });
            await submission.save();
        }
        
        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/submissions/:id
router.get('/:id', async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/submissions/:id/grade
router.put('/:id/grade', async (req, res) => {
    try {
        const { score, feedback } = req.body;
        const submission = await Submission.findById(req.params.id);
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        submission.grade = score;
        submission.feedback = feedback;
        
        await submission.save();
        res.status(200).json(submission);
    } catch (error) {
        console.error("Grading error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/submissions/:id
router.delete('/:id', async (req, res) => {
    try {
        await Submission.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
