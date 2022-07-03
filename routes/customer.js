const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customer');
// list
router.get('/', customerController.customers);
router.get('/:id', customerController.customer);
router.post('/', customerController.addCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
router.put('/:id/address-send', customerController.updateCustomerAddressSend);
router.put('/:id/address-receipt', customerController.updateCustomerAddressReceipt);

module.exports = router;