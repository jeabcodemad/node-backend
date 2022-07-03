const express = require('express');
const router = express.Router();

const approveLabParameter = require('../controllers/approveLabParameter');

router.get('/', approveLabParameter.parameters);
router.put('/status/', approveLabParameter.updateParameterStatus);

module.exports = router;