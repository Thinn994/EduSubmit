const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

// GET /api/materials?courseId=123
router.get('/', async (req, res) => {
    try {
        const { courseId } = req.query;
        let query = {};
        if (courseId) query.courseId = courseId;
        
        const materials = await Material.find(query).sort({ createdAt: -1 });
        res.status(200).json(materials);
    } catch (error) {
        console.error("GET materials error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/materials
router.post('/', async (req, res) => {
    try {
        const { courseId, title, description, category, visibility, fileUrl, fileName, fileSize, type, uploadedBy } = req.body;
        
        const material = new Material({
            courseId,
            title,
            description,
            category,
            visibility,
            fileUrl,
            fileName,
            fileSize,
            type,
            uploadedBy
        });
        
        await material.save();
        res.status(201).json(material);
    } catch (error) {
        console.error("POST material error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
