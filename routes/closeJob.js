const express = require('express');
const router = express.Router();

const closeJob = require('../controllers/closeJob');

router.get('/quotations', closeJob.quotations);
router.post('/copy', closeJob.copyQuotation);

module.exports = router;