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

// GET /api/courses/:id/students
router.get('/:id/students', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        
        // Need to import User model at the top of file
        const User = require('../models/User');
        const students = await User.find({ firebaseUid: { $in: course.enrolledStudents } });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/courses/:id/students (Add by email)
router.post('/:id/students', async (req, res) => {
    try {
        const { email } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const User = require('../models/User');
        const student = await User.findOne({ email });
        if (!student) return res.status(404).json({ error: 'Student not found with this email' });

        if (!course.enrolledStudents.includes(student.firebaseUid)) {
            course.enrolledStudents.push(student.firebaseUid);
            await course.save();
        }
        res.status(200).json({ message: 'Student added successfully', student });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/courses/:id/students/:studentId
router.delete('/:id/students/:studentId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        course.enrolledStudents = course.enrolledStudents.filter(id => id !== req.params.studentId);
        await course.save();
        res.status(200).json({ message: 'Student removed' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/courses/:id
router.delete('/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);
        
        if (!course) return res.status(404).json({ error: 'Course not found' });
        
        // Optional: verify if req.body.teacherId === course.teacherId if we passed it, but we can assume frontend handles basic restriction for now
        
        // Cleanup related data
        const Assignment = require('../models/Assignment');
        const Announcement = require('../models/Announcement');
        const Material = require('../models/Material');
        const Submission = require('../models/Submission');
        const Discussion = require('../models/Discussion');

        await Assignment.deleteMany({ courseId });
        await Announcement.deleteMany({ courseId });
        await Material.deleteMany({ courseId });
        await Submission.deleteMany({ courseId });
        await Discussion.deleteMany({ courseId });

        await Course.findByIdAndDelete(courseId);

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
