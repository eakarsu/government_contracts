// controllers/companyController.js
const Company = require('../models/Company');

exports.getProfile = async (req, res) => {
  try {
    console.log('Getting profile for user:', req.user.id);
    
    // Find existing company profile
    let company = await Company.findOne({ userId: req.user.id });
    
    if (!company) {
      console.log('No company profile found, creating default one...');
      
      // Create a default company profile if none exists
      company = new Company({
        userId: req.user.id, // This is required!
        basicInfo: {
          companyName: req.user.companyName || '',
          legalName: '',
          dunsNumber: '',
          cageCode: '',
          taxId: '',
          yearEstablished: null
        },
        contactInfo: {
          email: req.user.email || '',
          phone: '',
          website: '',
          fax: ''
        },
        address: {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'USA'
        },
        classifications: [],
        naicsCodes: [],
        pastPerformance: [],
        capabilities: {
          statement: '',
          keyPersonnel: []
        }
      });
      
      await company.save();
      console.log('Default company profile created');
    }

    res.json(company);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching company profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('Updating profile for user:', req.user.id);
    console.log('Update data:', req.body);
    
    const company = await Company.findOneAndUpdate(
      { userId: req.user.id },
      { 
        ...req.body,
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    res.json(company);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Error updating company profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
