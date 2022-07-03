const express = require('express');
const router = express.Router();

const testParameterController = require('../controllers/testParameter');
// list
router.get('/', testParameterController.testParameters);
router.get('/:id', testParameterController.testParameter);
router.post('/', testParameterController.addTestParameter);
router.put('/:id', testParameterController.updateTestParameter);
router.delete('/:id/:version', testParameterController.deleteTestParameter);

module.exports = router;