const express = require('express');
const router = express.Router();
const controller = require('../controllers/candidateTestController');

router.post('/assign', controller.assign);
router.get('/candidate/:candidateId', controller.getByCandidate);
router.get('/:id', controller.getById);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
