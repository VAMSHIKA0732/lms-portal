const express = require('express');
const mongoose = require('mongoose');
const { verifyToken, isTeacher } = require('../middleware/auth');
const Course = require('../models/Course');
const router = express.Router();

// In-memory demo data for when MongoDB is not connected
let demoCourses = [
  { _id: 'demo_course_1', title: 'Complete Web Development Bootcamp', description: 'Learn HTML, CSS, JavaScript, React, and Node.js from scratch.', duration: '12 Weeks', teacher: { _id: 'demo_123', name: 'Demo Instructor' }, studentCount: 15 },
  { _id: 'demo_course_2', title: 'Advanced React Patterns', description: 'Master hooks, context, state management, and performance optimization.', duration: '6 Weeks', teacher: { _id: 'demo_123', name: 'Demo Instructor' }, studentCount: 8 }
];

// Get all courses (Public)
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(demoCourses);
    }
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
    
    if (mongoose.connection.readyState !== 1) {
      const newCourse = {
        _id: 'demo_course_' + Date.now(),
        title,
        description,
        duration,
        teacher: { _id: req.user.id, name: req.user.name || 'Demo Teacher' },
        studentCount: 0
      };
      demoCourses.push(newCourse);
      return res.status(201).json(newCourse);
    }

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
    if (mongoose.connection.readyState !== 1) {
      const course = demoCourses.find(c => c._id === req.params.id);
      if (!course) return res.status(404).json({ message: 'Course not found' });
      return res.json(course);
    }

    const course = await Course.findById(req.params.id).populate('teacher', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course details', error: error.message });
  }
});

module.exports = router;
