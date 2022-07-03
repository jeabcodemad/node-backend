const express = require('express');
const router = express.Router();

const registerController = require('../controllers/register');

// router.post('/register', userController.register);
router.post('/', registerController.register);

module.exports = router;