const mongoose = require('mongoose');

const quotationTypeSchema = new mongoose.Schema({
    quotationTypeId: { type: Number, default: 0 },
    quotationCode: { type: String },
    quotationName: { type: String },
    customerTypeId: { type: Number },
});

module.exports = mongoose.model('quotationtype', quotationTypeSchema);