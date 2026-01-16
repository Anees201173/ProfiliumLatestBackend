const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

// Public endpoint for frontend site
router.get('/plans', pricingController.listPublicPlans);

// Admin endpoints for dashboard
router.get('/admin/plans', authenticate, authorizeRoles('admin'), pricingController.listAllPlans);
router.post('/admin/plans', authenticate, authorizeRoles('admin'), pricingController.createPlan);
router.put('/admin/plans/:id', authenticate, authorizeRoles('admin'), pricingController.updatePlan);
router.delete('/admin/plans/:id', authenticate, authorizeRoles('admin'), pricingController.deletePlan);

module.exports = router;
