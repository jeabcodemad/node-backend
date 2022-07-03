const mongoose = require('mongoose');

const quotationStatusSchema = new mongoose.Schema({
    quotationStatusId: { type: Number, default: 0 },
    quotationStatusCode: { type: String },
    quotationStatusName: { type: String },
});

module.exports = mongoose.model('quotationstatus', quotationStatusSchema);