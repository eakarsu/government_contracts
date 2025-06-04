// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '30d',
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    console.log('=== REGISTRATION DEBUG ===');
    console.log('Request body:', req.body);
    
    const { email, password, companyName } = req.body;

    // Validate input
    if (!email || !password || !companyName) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    console.log('Checking if user exists...');
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    console.log('Existing user found:', !!existingUser);
    
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    console.log('Creating new user...');
    const user = new User({
      email: email.toLowerCase(),
      password,
      companyName,
      role: 'user',
      isActive: true
    });

    console.log('User object before save:', {
      email: user.email,
      companyName: user.companyName,
      hasPassword: !!user.password
    });

    console.log('Attempting to save user...');
    const savedUser = await user.save();
    console.log('User saved successfully!');
    console.log('Saved user ID:', savedUser._id);

    // Generate token
    console.log('Generating token...');
    const token = generateToken(savedUser._id);
    console.log('Token generated successfully');

    // Verify the save worked
    const verifyUser = await User.findById(savedUser._id);
    console.log('Verification - user found in DB:', !!verifyUser);

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        companyName: savedUser.companyName
      }
    });
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('=== LOGIN DEBUG ===');
    console.log('Login attempt for:', req.body.email);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    console.log('Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch');
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
    const user = await User.findById(req.user.id).select('-password');
    
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
