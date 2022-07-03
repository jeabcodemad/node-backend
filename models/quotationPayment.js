const mongoose = require('mongoose');

const quotationPaymentSchema = new mongoose.Schema({
    quotationPaymentId: { type: Number, default: 0 },
    quotationPaymentName: { type: String },
});

module.exports = mongoose.model('quotationpayment', quotationPaymentSchema);