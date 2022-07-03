const express = require('express');
const router = express.Router();

const addressController = require('../controllers/address');
// list
router.get('/:customerId', addressController.addresss);
router.get('/:id', addressController.address);
router.post('/', addressController.addAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;