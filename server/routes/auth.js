const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // DEMO MODE CHECK
    if (mongoose.connection.readyState !== 1) {
      const demoUser = { id: 'demo_' + Date.now(), name, email, role: role || 'Student' };
      const demoToken = jwt.sign(demoUser, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
      return res.status(201).json({ user: demoUser, token: demoToken });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ 
      user: { id: user._id, name: user.name, email: user.email, role: user.role }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // DEMO MODE CHECK
    if (mongoose.connection.readyState !== 1) {
      const demoUser = { id: 'demo_' + Date.now(), name: 'Demo User', email, role: 'Student' };
      const demoToken = jwt.sign(demoUser, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
      return res.json({ user: demoUser, token: demoToken });
    }

    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      user: { id: user._id, name: user.name, email: user.email, role: user.role }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user (Verify token)
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (mongoose.connection.readyState !== 1) {
      return res.json({ id: decoded.id, name: decoded.name || 'Demo User', email: decoded.email, role: decoded.role });
    }

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
});

module.exports = router;
