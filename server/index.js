require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Detailed Startup Log
console.log('Server initializing in', process.env.NODE_ENV, 'mode');

// Database Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('CRITICAL: MONGODB_URI is missing from environment variables');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB Initial Connection Error:', err.message);
  }
};

connectDB();

// Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const assignmentRoutes = require('./routes/assignments');
const discussionRoutes = require('./routes/discussions');
const materialRoutes = require('./routes/materials');
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/materials', materialRoutes);

// Base API route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the LMS Portal API' });
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  console.log('Serving static files from:', distPath);
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'LMS Portal API is running' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
