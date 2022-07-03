const express = require('express');
const router = express.Router();

const sendParameter = require('../controllers/sendParameter');

router.get('/quotations', sendParameter.quotations);

router.put('/', sendParameter.updateStatus);



module.exports = router;