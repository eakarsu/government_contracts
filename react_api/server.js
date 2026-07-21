// server.js
require('dotenv').config(); // This must be first!`
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');


const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/company');
const contractRoutes = require('./routes/contracts');
const formRoutes = require('./routes/forms');

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '127.0.0.1';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be a unique value of at least 32 characters');
}

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

// Middleware
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/forms', formRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Request failed:', err.message);
  res.status(err.status || 500).json({
    message: err.status && err.status < 500 ? err.message : 'Internal server error'
  });
});

async function start() {
  const runtimeMemory = process.env.NODE_ENV === 'test' && process.env.RUNTIME_IN_MEMORY_AUTH === 'true';
  if (!runtimeMemory) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/govcontracts');
  } else {
    console.warn('Using process-local authentication storage for isolated test runtime');
  }
  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Startup failed:', error.message);
  process.exitCode = 1;
});
