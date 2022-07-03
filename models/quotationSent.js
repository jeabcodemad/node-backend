const mongoose = require('mongoose');

const quotationSentSchema = new mongoose.Schema({
    quotationSentId: { type: Number, default: 0 },
    quotationSentName: { type: String },
});

module.exports = mongoose.model('quotationsent', quotationSentSchema);