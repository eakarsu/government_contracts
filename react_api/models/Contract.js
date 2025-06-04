const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  // SAM.gov fields
  noticeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  solicitationNumber: String,
  department: String,
  subTier: String,
  office: String,
  postedDate: Date,
  responseDeadline: Date,
  archiveDate: Date,
  type: String,
  baseType: String,
  archiveType: String,
  
  // Contract details
  description: String,
  naicsCode: String,
  classificationCode: String,
  setAside: String,
  contractValue: String,
  placeOfPerformance: {
    city: String,
    state: String,
    country: String,
    zip: String
  },
  
  // Contact information
  primaryContact: {
    name: String,
    email: String,
    phone: String,
    title: String
  },
  secondaryContact: {
    name: String,
    email: String,
    phone: String,
    title: String
  },
  
  // Attached documents
  attachments: [{
    name: String,
    url: String,
    size: String,
    type: String,
    postedDate: Date,
    processed: {
      type: Boolean,
      default: false
    },
    extractedText: String,
    vectorId: String
  }],
  
  // AI Analysis
  aiAnalysis: {
    analyzed: {
      type: Boolean,
      default: false
    },
    analyzedAt: Date,
    keyRequirements: [String],
    requiredCertifications: [String],
    estimatedEffort: String,
    suggestedTeamSize: Number,
    matchScore: Number,
    matchReason: String,
    challenges: [String],
    opportunities: [String],
    recommendation: String
  },
  
  // Vector search
  vectorEmbedding: {
    id: String,
    indexed: {
      type: Boolean,
      default: false
    },
    indexedAt: Date
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastChecked: Date
});

// Indexes for search optimization
contractSchema.index({ title: 'text', description: 'text' });
contractSchema.index({ postedDate: -1 });
contractSchema.index({ responseDeadline: 1 });
contractSchema.index({ 'placeOfPerformance.state': 1 });
contractSchema.index({ naicsCode: 1 });
contractSchema.index({ setAside: 1 });

module.exports = mongoose.model('Contract', contractSchema);