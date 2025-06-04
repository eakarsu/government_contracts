const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const contractController = require('../controllers/contractController');

// IMPORTANT: Put specific routes BEFORE parameterized routes

// Saved searches routes - MUST come before /:id
router.post('/searches/save', auth, contractController.saveSearch);
router.get('/searches', auth, contractController.getSavedSearches);
router.delete('/searches/:id', auth, contractController.deleteSearch);
router.put('/searches/:id/toggle-alert', auth, contractController.toggleSearchAlert);

// Other specific routes
router.post('/search', auth, contractController.searchContracts);
router.get('/dashboard-stats', auth, contractController.getDashboardStats);
router.post('/index', auth, contractController.indexContracts);

// List contracts (this should also come before /:id if it conflicts)
router.get('/', auth, contractController.listContracts);

// Parameterized routes - MUST come AFTER specific routes
router.get('/:id', auth, contractController.getContractDetails);
router.get('/:id/analysis', auth, contractController.getContractAnalysis);
router.post('/:id/process-documents', auth, contractController.processDocuments);

module.exports = router;
