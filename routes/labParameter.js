const express = require('express');
const router = express.Router();

const labParameter = require('../controllers/labParameter');

router.get('/', labParameter.parameters);

router.put('/status/', labParameter.updateParameterStatus);
router.put('/', labParameter.updateParameterValue);

module.exports = router;