const express = require('express');
const { verifyToken, isTeacher, isStudent } = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const router = express.Router();

// Get assignments for a course
router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
});

// Create an assignment (Teacher only)
router.post('/', verifyToken, isTeacher, async (req, res) => {
  try {
    const { title, description, dueDate, courseId } = req.body;
    const assignment = new Assignment({
      title,
      description,
      dueDate,
      course: courseId
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Assignment creation failed', error: error.message });
  }
});

// Submit an assignment (Student only)
router.post('/:id/submit', verifyToken, isStudent, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Check if enrolled
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    const isEnrolled = await Enrollment.findOne({ student: req.user.id, course: assignment.course });
    if (!isEnrolled) return res.status(403).json({ message: 'You must be enrolled in the course to submit assignments' });

    const submission = new Submission({
      assignment: req.params.id,
      student: req.user.id,
      content
    });
    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Assignment already submitted' });
    res.status(400).json({ message: 'Submission failed', error: error.message });
  }
});

// Get all submissions for a course (Teacher only)
router.get('/course/:courseId/submissions', verifyToken, isTeacher, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId });
    const assignmentIds = assignments.map(a => a._id);
    
    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate('student', 'name email')
      .populate('assignment', 'title');
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
});

// Grade a submission (Teacher only) - Part of Platinum but useful to have here
router.post('/submission/:id/grade', verifyToken, isTeacher, async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { grade, feedback },
      { new: true }
    );
    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: 'Grading failed', error: error.message });
  }
});

// Get student's submission for an assignment
router.get('/:id/my-submission', verifyToken, isStudent, async (req, res) => {
  try {
    const submission = await Submission.findOne({ 
      assignment: req.params.id, 
      student: req.user.id 
    });
    res.json(submission || null);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submission' });
  }
});

module.exports = router;
