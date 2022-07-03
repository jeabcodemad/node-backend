const express = require('express');
const router = express.Router();

const checkLabParameter = require('../controllers/checkLabParameter');

router.get('/', checkLabParameter.parameters);
router.put('/status/', checkLabParameter.updateParameterStatus);

module.exports = router;