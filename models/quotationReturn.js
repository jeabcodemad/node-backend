const mongoose = require('mongoose');

const quotationReturnSchema = new mongoose.Schema({
    quotationReturnId: { type: Number, default: 0 },
    quotationReturnName: { type: String },
});

module.exports = mongoose.model('quotationreturn', quotationReturnSchema);