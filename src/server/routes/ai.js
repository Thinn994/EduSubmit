const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Quiz = require('../models/Quiz');
const Material = require('../models/Material');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// POST /api/ai/generate-quiz
router.post('/generate-quiz', async (req, res) => {
    try {
        const { text, numQuestions = 5, difficulty = 'medium', courseId } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text material is required' });
        }

        const prompt = `Generate a multiple-choice quiz based on the following text. 
Create ${numQuestions} questions of ${difficulty} difficulty.
Return the result strictly in valid JSON format as an array of objects.
Each object must have:
"text" (the question string),
"options" (an array of exactly 4 strings),
"correctAnswer" (the string that is the correct option).

Text:
${text}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const generatedData = JSON.parse(response.choices[0].message.content);
        
        // Extract the array from whatever root key OpenAI used (e.g., 'questions' or directly)
        let questionsArray = [];
        if (Array.isArray(generatedData)) {
            questionsArray = generatedData;
        } else if (generatedData.questions && Array.isArray(generatedData.questions)) {
            questionsArray = generatedData.questions;
        } else {
             // Fallback if structure is weird
             questionsArray = Object.values(generatedData).find(val => Array.isArray(val)) || [];
        }

        const newQuiz = new Quiz({
            courseId,
            title: `AI Generated Quiz - ${new Date().toLocaleDateString()}`,
            difficulty,
            questions: questionsArray
        });
        
        await newQuiz.save();

        res.status(200).json(newQuiz);
    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// POST /api/ai/recommend-material
router.post('/recommend-material', async (req, res) => {
    try {
        const { highlightedText, courseId } = req.body;
        
        // Use OpenAI to extract core concepts
        const prompt = `Extract 3 core academic keywords from this text for searching related course materials. Return only the keywords separated by commas. Text: "${highlightedText}"`;
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 30
        });
        
        const keywords = response.choices[0].message.content.split(',').map(k => k.trim());
        
        // Search materials in DB using regex for these keywords
        const regexKeywords = keywords.map(kw => new RegExp(kw, 'i'));
        
        const materials = await Material.find({
            courseId,
            $or: [
                { title: { $in: regexKeywords } },
                { textContent: { $in: regexKeywords } }
            ]
        }).limit(3);
        
        res.status(200).json({ keywords, recommendedMaterials: materials });
    } catch (error) {
        res.status(500).json({ error: 'Failed to recommend materials' });
    }
});

module.exports = router;
