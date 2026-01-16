const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

// Public endpoint for frontend site
router.get('/faqs', faqController.listPublicFaqs);

// Admin endpoints for dashboard
router.get('/admin/faqs', authenticate, authorizeRoles('admin'), faqController.listAllFaqs);
router.post('/admin/faqs', authenticate, authorizeRoles('admin'), faqController.createFaq);
router.put('/admin/faqs/:id', authenticate, authorizeRoles('admin'), faqController.updateFaq);
router.delete('/admin/faqs/:id', authenticate, authorizeRoles('admin'), faqController.deleteFaq);

module.exports = router;
