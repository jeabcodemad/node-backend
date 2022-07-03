const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');
// list
router.get('/', userController.users);

router.get('/:id', userController.user);

// router.post('/register', userController.register);
// router.post('/login', userController.login);

router.post('/addUser', userController.addUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);


module.exports = router;