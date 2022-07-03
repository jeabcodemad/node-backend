const express = require('express');
const router = express.Router();

const quotationHistoryController = require('../controllers/quotationHistory');

router.get('/:quotationnumberid', quotationHistoryController.getQuotationVersions);
router.get('/step1/:quotationnumberid/:quotationid', quotationHistoryController.getQuotationStep1);
router.get('/step2/:quotationnumberid/:quotationid', quotationHistoryController.getQuotationStep2);
router.get('/step3/:quotationnumberid/:quotationid', quotationHistoryController.getQuotationStep3);

module.exports = router;