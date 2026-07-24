// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const runtimeUsers = require('../services/runtimeUserStore');
const runtimeDb = require('../services/runtimeDb');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const secret = process.env.JWT_SECRET || '';
    if (secret.length < 32) {
      return res.status(503).json({ message: 'Authentication is not configured' });
    }
    const decoded = jwt.verify(token, secret);
    const runtimeStore = runtimeDb.enabled() ? runtimeDb : runtimeUsers;
    const user = runtimeStore.enabled()
      ? await runtimeStore.findById(decoded.id)
      : await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user; // This sets req.user.id
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
