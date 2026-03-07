const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const isTeacher = (req, res, next) => {
  if (req.user.role !== 'Teacher') {
    return res.status(403).json({ message: 'Access denied. Teachers only.' });
  }
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== 'Student') {
    return res.status(403).json({ message: 'Access denied. Students only.' });
  }
  next();
};

module.exports = { verifyToken, isTeacher, isStudent };
