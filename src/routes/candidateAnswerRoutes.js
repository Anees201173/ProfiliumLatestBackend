const express = require('express');
const router = express.Router();
const controller = require('../controllers/candidateAnswerController');

router.post('/submit', controller.submit);
router.get('/candidateTest/:candidateTestId', controller.getByCandidateTest);

module.exports = router;
