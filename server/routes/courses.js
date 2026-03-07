const express = require('express');
const { verifyToken, isTeacher } = require('../middleware/auth');
const Course = require('../models/Course');
const router = express.Router();

// Get all courses (Public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('teacher', 'name email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});

// Create a course (Teacher only)
router.post('/', verifyToken, isTeacher, async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    const course = new Course({
      title,
      description,
      duration,
      teacher: req.user.id
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: 'Course creation failed', error: error.message });
  }
});

// Get single course details
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course details', error: error.message });
  }
});

module.exports = router;
