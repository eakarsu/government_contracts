const Application = require('../models/Application');
const Contract = require('../models/Contract');
const Company = require('../models/Company');
const aiService = require('../services/aiService');
const fs = require('fs').promises;
const path = require('path');

exports.generateForm = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    // Get contract and company data
    const [contract, company] = await Promise.all([
      Contract.findById(contractId),
      Company.findOne({ userId: req.userId })
    ]);
    
    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contract not found' 
      });
    }

    // Generate form structure using AI
    const formStructure = await aiService.generateFormStructure(contract, company);
    
    // Pre-fill data from company profile
    const prefillData = generatePrefillData(formStructure, company);

    res.json({
      success: true,
      formStructure,
      prefillData
    });
  } catch (error) {
    console.error('Generate form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating form' 
    });
  }
};

exports.submitForm = async (req, res) => {
  try {
    const { contractId, formData, formValues } = req.body;
    
    // Get contract details
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contract not found' 
      });
    }

    // Process uploaded files
    const documents = [];
    if (req.files) {
      for (const file of req.files) {
        documents.push({
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`, // In production, upload to S3
          uploadedAt: new Date()
        });
      }
    }

    // Create or update application
    const application = await Application.findOneAndUpdate(
      {
        userId: req.userId,
        contractId: contractId
      },
      {
        contractTitle: contract.title,
        contractNumber: contract.solicitationNumber,
        agency: contract.department,
        status: 'submitted',
        formStructure: formData,
        formValues: formValues,
        documents: documents,
        submittedAt: new Date(),
        deadline: contract.responseDeadline,
        lastModified: new Date()
      },
      {
        new: true,
        upsert: true
      }
    );

    // Generate submission confirmation
    const confirmation = generateConfirmationNumber();
    application.submissionConfirmation = confirmation;
    await application.save();

    res.json({
      success: true,
      applicationId: application._id,
      confirmation: confirmation,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Submit form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting form' 
    });
  }
};

exports.saveDraft = async (req, res) => {
  try {
    const { contractId, formData, formValues } = req.body;
    
    // Get contract details
    const contract = await Contract.findById(contractId);
    
    if (!contract) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contract not found' 
      });
    }

    // Save draft
    const application = await Application.findOneAndUpdate(
      {
        userId: req.userId,
        contractId: contractId
      },
      {
        contractTitle: contract.title,
        contractNumber: contract.solicitationNumber,
        agency: contract.department,
        status: 'draft',
        formStructure: formData,
        formValues: formValues,
        deadline: contract.responseDeadline,
        lastModified: new Date()
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json({
      success: true,
      applicationId: application._id,
      message: 'Draft saved successfully'
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving draft' 
    });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    const query = { userId: req.userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .sort({ lastModified: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('contractId', 'title responseDeadline');

    const count = await Application.countDocuments(query);

    // Transform applications for frontend
    const transformedApps = applications.map(app => ({
      id: app._id,
      contractId: app.contractId._id,
      contractTitle: app.contractTitle,
      agency: app.agency,
      status: app.status,
      submittedAt: app.submittedAt,
      deadline: app.deadline,
      lastModified: app.lastModified,
      documents: app.documents,
      notes: app.notes
    }));

    res.json({
      success: true,
      applications: transformedApps,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applications' 
    });
  }
};

exports.getApplicationDetails = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('contractId');

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching application details' 
    });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    // Only allow deletion of draft applications
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      status: 'draft'
    });

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found or cannot be deleted' 
      });
    }

    // Clean up uploaded files
    if (application.documents) {
      for (const doc of application.documents) {
        try {
          await fs.unlink(path.join(__dirname, '..', doc.url));
        } catch (err) {
          console.error(`Error deleting file ${doc.url}:`, err);
        }
      }
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting application' 
    });
  }
};

exports.getFormTemplates = async (req, res) => {
  try {
    // Return common form templates
    const templates = [
      {
        id: 'sf330',
        name: 'SF 330 - Architect-Engineer Qualifications',
        description: 'Standard form for A-E services',
        fields: getSF330Fields()
      },
      {
        id: 'sf1449',
        name: 'SF 1449 - Solicitation/Contract/Order',
        description: 'Standard solicitation and contract form',
        fields: getSF1449Fields()
      },
      {
        id: 'representations',
        name: 'Representations and Certifications',
        description: 'Standard representations and certifications',
        fields: getRepresentationsFields()
      }
    ];

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching form templates' 
    });
  }
};

// Helper functions
function generatePrefillData(formStructure, company) {
  const prefillData = {};

  // Map common fields from company profile
  const fieldMapping = {
    'companyName': company?.basicInfo?.companyName,
    'legalName': company?.basicInfo?.legalName,
    'dunsNumber': company?.basicInfo?.dunsNumber,
    'cageCode': company?.basicInfo?.cageCode,
    'taxId': company?.basicInfo?.taxId,
    'email': company?.contactInfo?.email,
    'phone': company?.contactInfo?.phone,
    'address': `${company?.address?.street}, ${company?.address?.city}, ${company?.address?.state} ${company?.address?.zip}`,
    'naicsCodes': company?.naicsCodes?.join(', ')
  };

  // Apply mapping to form fields
  formStructure.sections?.forEach(section => {
    section.fields?.forEach(field => {
      if (fieldMapping[field.name]) {
        prefillData[field.name] = fieldMapping[field.name];
      }
    });
  });

  return prefillData;
}

function generateConfirmationNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `GOV-${timestamp}-${random}`.toUpperCase();
}

function getSF330Fields() {
  return [
    {
      section: 'Part I - General',
      fields: [
        { name: 'firmName', label: 'Firm Name', type: 'text', required: true },
        { name: 'address', label: 'Address', type: 'textarea', required: true },
        { name: 'yearEstablished', label: 'Year Established', type: 'number', required: true }
      ]
    },
    {
      section: 'Part II - General Qualifications',
      fields: [
        { name: 'disciplines', label: 'Disciplines', type: 'checkbox', options: [
          'Architecture', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering'
        ]}
      ]
    }
  ];
}

function getSF1449Fields() {
  return [
    {
      section: 'Offeror Information',
      fields: [
        { name: 'offerorName', label: 'Offeror Name', type: 'text', required: true },
        { name: 'offerorAddress', label: 'Address', type: 'textarea', required: true },
        { name: 'offerorPhone', label: 'Phone', type: 'tel', required: true }
      ]
    }
  ];
}

function getRepresentationsFields() {
  return [
    {
      section: 'Business Information',
      fields: [
        { name: 'smallBusiness', label: 'Small Business', type: 'checkbox' },
        { name: 'womanOwned', label: 'Woman-Owned Small Business', type: 'checkbox' },
        { name: 'veteranOwned', label: 'Veteran-Owned Small Business', type: 'checkbox' }
      ]
    }
  ];
}