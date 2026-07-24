// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const runtimeUsers = require('../services/runtimeUserStore');
const runtimeDb = require('../services/runtimeDb');

const runtimeStore = () => runtimeDb.enabled() ? runtimeDb : runtimeUsers;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 32 || /fallback|change|replace|example/i.test(secret)) {
    throw new Error('JWT_SECRET must be a unique value of at least 32 characters');
  }
  return secret;
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '8h',
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const companyName = req.body.companyName || req.body.name || req.body.fullName || req.body.full_name;

    // Validate input
    if (typeof email !== 'string' || !email.includes('@') ||
        typeof password !== 'string' || password.length < 12 ||
        typeof companyName !== 'string' || !companyName.trim()) {
      return res.status(400).json({ message: 'Valid email, company name, and a password of at least 12 characters are required' });
    }

    // Check if user exists
    const existingUser = runtimeStore().enabled()
      ? await runtimeStore().findByEmail(email)
      : await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const savedUser = runtimeStore().enabled()
      ? await runtimeStore().create({ email, password, companyName: companyName.trim() })
      : await new User({
          email: email.toLowerCase(),
          password,
          companyName,
          role: 'user',
          isActive: true
        }).save();

    // Generate token
    const token = generateToken(savedUser._id);

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        companyName: savedUser.companyName
      }
    });
  } catch (error) {
    console.error('Registration failed:', error.message);
    
    res.status(500).json({ 
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = runtimeStore().enabled()
      ? await runtimeStore().findByEmail(email)
      : await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = runtimeStore().enabled()
      ? await runtimeStore().findById(req.user.id)
      : await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user (optional - mainly for client-side token removal)
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // You could implement token blacklisting here if needed
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
