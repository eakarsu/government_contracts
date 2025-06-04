const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const formController = require('../controllers/formController');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Form generation and submission
router.post('/generate/:contractId', auth, formController.generateForm);
router.post('/submit', auth, upload.array('documents'), formController.submitForm);
router.post('/draft', auth, formController.saveDraft);

// Applications management
router.get('/applications', auth, formController.getApplications);
router.get('/applications/:id', auth, formController.getApplicationDetails);
router.delete('/applications/:id', auth, formController.deleteApplication);

// Templates
router.get('/templates', auth, formController.getFormTemplates);

module.exports = router;