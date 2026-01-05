const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateUser, validateLogin } = require('../middlewares/validator');

// Signup (create user and return token)
router.post('/signup', validateUser, authController.signup);

// Signin (authenticate)
router.post('/signin', validateLogin, authController.signin);

module.exports = router;
