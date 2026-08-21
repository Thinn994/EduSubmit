const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// GET /api/courses
router.get('/', async (req, res) => {
    try {
        const { teacherId, studentId } = req.query;
        let query = {};
        
        if (teacherId) {
            query.teacherId = teacherId;
        } else if (studentId) {
            query.enrolledStudents = studentId;
        }
        
        const courses = await Course.find(query);
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Not found' });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/courses
router.post('/', async (req, res) => {
    try {
        const generateClassCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        const courseData = req.body;
        courseData.classCode = generateClassCode();
        
        const course = new Course(courseData);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/courses/join
router.post('/join', async (req, res) => {
    try {
        const { classCode, studentId } = req.body;
        const course = await Course.findOne({ classCode });
        
        if (!course) return res.status(404).json({ error: 'Course not found' });
        
        if (!course.enrolledStudents.includes(studentId)) {
            course.enrolledStudents.push(studentId);
            await course.save();
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
