const express = require('express');
const router = express.Router();

const quotationController = require('../controllers/quotation');

const { upload } = require('../utils/uploadUtils');

router.get('/:quotationnumberid', quotationController.quotation);
router.get('/', quotationController.quotationNumbers);
router.get('/step1/:quotationnumberid', quotationController.getQuotationStep1);
router.get('/step2/:quotationnumberid', quotationController.getQuotationStep2);
router.get('/step3/:quotationnumberid', quotationController.getQuotationStep3);
router.get('/customer/options', quotationController.customers);

router.post('/sampleparameters', quotationController.sampleParameters);

router.post('/step1/', quotationController.addStep1);
router.put('/step1/', quotationController.updateStep1);

router.post('/step2/', upload, quotationController.step2);
router.post('/step3/', quotationController.step3);

router.put('/status', quotationController.updateQuotationStatus);

router.put('/sampleparameters/send', quotationController.sendParameters);

router.post('/export', quotationController.exportFile);

router.delete('/:quotationnumberid', quotationController.deleteQuotation);

module.exports = router;