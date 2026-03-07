const express = require('express');
const { verifyToken, isStudent, isTeacher } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const router = express.Router();

// Enroll in a course (Student only)
router.post('/enroll', verifyToken, isStudent, async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user.id,
      course: courseId
    });
    await enrollment.save();
    
    res.status(201).json(enrollment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }
    res.status(400).json({ message: 'Enrollment failed', error: error.message });
  }
});

// Get enrolled courses for current student
router.get('/my-courses', verifyToken, isStudent, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        populate: { path: 'teacher', select: 'name email' }
      });
    res.json(enrollments.map(e => e.course));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled courses', error: error.message });
  }
});

// Get students enrolled in a specific course (Teacher only)
router.get('/course/:courseId/students', verifyToken, isTeacher, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    // Check if requester is the teacher of this course
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You are not the teacher of this course.' });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email');
    
    res.json(enrollments.map(e => e.student));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled students', error: error.message });
  }
});

// Check enrollment status (Internal/Helper)
router.get('/check/:courseId', verifyToken, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ 
      student: req.user.id, 
      course: req.params.courseId 
    });
    res.json({ enrolled: !!enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Error checking enrollment status' });
  }
});

module.exports = router;
