const express = require('express');
const router = express.Router();

const trackSample = require('../controllers/trackSample');

router.get('/parameters', trackSample.getSampleParameters);

router.get('/transactions/:sampleparameterid', trackSample.getSampleParameterTransactions)

module.exports = router;