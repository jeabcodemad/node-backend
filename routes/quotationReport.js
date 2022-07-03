const express = require('express');
const router = express.Router();

const quotationReportController = require('../controllers/quotationReport');

router.get('/:quotationnumberid', quotationReportController.getQuotationVersions);
router.get('/step1/:quotationnumberid/:quotationid', quotationReportController.getQuotationStep1);
router.get('/step2/:quotationnumberid/:quotationid', quotationReportController.getQuotationStep2);
router.get('/step3/:quotationnumberid/:quotationid', quotationReportController.getQuotationStep3);
router.get('/reporttypes/:customertypeid', quotationReportController.getReportType);


router.post('/export', quotationReportController.exportFile);
router.put('/', quotationReportController.updateValue);

module.exports = router;