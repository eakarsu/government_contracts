const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  contractTitle: String,
  contractNumber: String,
  agency: String,
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'awarded', 'rejected', 'withdrawn'],
    default: 'draft'
  },
  
  // Form data
  formStructure: {
    title: String,
    sections: [{
      title: String,
      description: String,
      fields: [{
        name: String,
        label: String,
        type: String,
        required: Boolean,
        value: mongoose.Schema.Types.Mixed,
        options: [mongoose.Schema.Types.Mixed]
      }]
    }]
  },
  
  formValues: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Documents
  documents: [{
    name: String,
    type: String,
    size: String,
    url: String,
    uploadedAt: Date
  }],
  
  // Submission details
  submittedAt: Date,
  submissionConfirmation: String,
  deadline: Date,
  
  // Tracking
  lastModified: {
    type: Date,
    default: Date.now
  },
  notes: String,
  
  // Notifications
  notifications: [{
    type: String,
    message: String,
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ contractId: 1 });
applicationSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);