const express = require('express');
const router = express.Router();

const loginController = require('../controllers/login');

// router.post('/register', userController.register);
router.post('/', loginController.login);
router.post('/verifyToken', loginController.verityUser);

module.exports = router;