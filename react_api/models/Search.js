const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  query: {
    keywords: String,
    naicsCode: String,
    setAside: String,
    agency: String,
    state: String,
    postedAfter: Date,
    deadlineBefore: Date,
    contractValue: {
      min: Number,
      max: Number
    }
  },
  filters: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  alertEnabled: {
    type: Boolean,
    default: false
  },
  alertFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'immediate'],
    default: 'daily'
  },
  lastRun: {
    type: Date,
    default: Date.now
  },
  lastResults: [{
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract'
    },
    noticeId: String,
    title: String,
    agency: String,
    postedDate: Date,
    responseDeadline: Date,
    matchScore: Number
  }],
  resultCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
searchSchema.index({ userId: 1, isActive: 1 });
searchSchema.index({ alertEnabled: 1, lastRun: 1 });
searchSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
searchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Search', searchSchema);

