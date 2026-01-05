const express = require('express');
const router = express.Router();
const controller = require('../controllers/companyController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

router.get('/', controller.getAll);
// Authenticated company dashboard stats
router.get('/me/dashboard-stats', authenticate, controller.getMyDashboardStats);
// Authenticated company quick analytics
router.get('/me/quick-analytics', authenticate, controller.getMyQuickAnalytics);
// Authenticated company profile
router.get('/me', authenticate, controller.getMyProfile);
router.put('/me', authenticate, controller.updateMyProfile);
router.get('/:id', controller.getById);
router.post('/', authenticate, controller.create);
// Only authenticated admins can update arbitrary company records
router.put('/:id', authenticate, authorizeRoles('admin'), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
