const express = require('express');
const { verifyToken, isTeacher } = require('../middleware/auth');
const Material = require('../models/Material');
const router = express.Router();

// Get materials for a course
router.get('/:courseId', verifyToken, async (req, res) => {
  try {
    const materials = await Material.find({ course: req.params.courseId });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching materials' });
  }
});

// Upload material (Teacher only)
router.post('/:courseId', verifyToken, isTeacher, async (req, res) => {
  try {
    const { title, url, type } = req.body;
    const material = new Material({
      title,
      url,
      type,
      course: req.params.courseId
    });
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ message: 'Failed to upload material' });
  }
});

module.exports = router;
