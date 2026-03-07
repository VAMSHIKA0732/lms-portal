const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Discussion = require('../models/Discussion');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const router = express.Router();

// Get all discussions for a course
router.get('/:courseId', verifyToken, async (req, res) => {
  try {
    const discussions = await Discussion.find({ course: req.params.courseId })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discussions' });
  }
});

// Post a message in discussion
router.post('/:courseId', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Check if user is enrolled or is the teacher
    const course = await Course.findById(req.params.courseId);
    const isEnrolled = await Enrollment.findOne({ student: req.user.id, course: req.params.courseId });
    
    if (course.teacher.toString() !== req.user.id && !isEnrolled) {
      return res.status(403).json({ message: 'You must be part of this course to post' });
    }

    const message = new Discussion({
      course: req.params.courseId,
      user: req.user.id,
      content
    });
    await message.save();
    
    // Return populated message
    const populated = await Discussion.findById(message._id).populate('user', 'name role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to post message' });
  }
});

module.exports = router;
