const express = require('express');
const router = express.Router();

const labController = require('../controllers/lab');
// list
router.get('/', labController.labs);
router.get('/:id', labController.lab);
router.post('/', labController.addLab);
router.put('/:id', labController.updateLab);
router.delete('/:id', labController.deleteLab);
router.post('/updateuser', labController.updateUserLab);

module.exports = router;