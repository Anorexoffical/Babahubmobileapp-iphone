const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const env = require('../config/env');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('Auth middleware: missing or malformed Authorization header', authHeader);
      return res.status(401).json({ message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || env.JWT_SECRET || 'secretkey';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.warn('Auth middleware: token verification failed', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.isDeleted) {
      console.warn('Auth middleware: user not found or deleted', { userId: decoded?.id, found: !!user, isDeleted: user?.isDeleted });
      return res.status(401).json({ message: "This account doesn't exist." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = authMiddleware;
