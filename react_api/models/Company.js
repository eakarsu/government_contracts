const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  basicInfo: {
    companyName: String,
    legalName: String,
    dunsNumber: String,
    cageCode: String,
    taxId: String,
    yearEstablished: Number
  },
  contactInfo: {
    email: String,
    phone: String,
    website: String,
    fax: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  classifications: [String],
  naicsCodes: [String],
  pastPerformance: [{
    projectName: String,
    agency: String,
    contractValue: String,
    period: String,
    contactName: String,
    contactPhone: String,
    description: String
  }],
  capabilities: {
    statement: String,
    keyPersonnel: [{
      name: String,
      title: String,
      experience: String
    }]
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', companySchema);