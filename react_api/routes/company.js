const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const companyController = require('../controllers/companyController');

router.get('/profile', auth, companyController.getProfile);
router.put('/profile', auth, companyController.updateProfile);

module.exports = router;