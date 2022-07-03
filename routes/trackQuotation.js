const express = require('express');
const router = express.Router();

const trackQuotation = require('../controllers/trackQuotation');

router.get('/quotations', trackQuotation.quotations);

router.get('/transactions/:quotationnumberid', trackQuotation.getQuotationTransactions)

module.exports = router;