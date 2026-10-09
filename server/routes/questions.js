const express = require('express');
const { generateQuestions } = require('../ai/questions');

const router = express.Router();

// POST /api/questions/generate {title, description, tags}
router.post('/generate', async (req, res) => {
  const { title, description, tags } = req.body || {};
  if (!title || !String(title).trim() || !description || !String(description).trim()) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  const result = await generateQuestions({
    title: String(title).trim(),
    description: String(description).trim(),
    tags: Array.isArray(tags) ? tags.map(String) : [],
  });
  res.json(result);
});

module.exports = router;
