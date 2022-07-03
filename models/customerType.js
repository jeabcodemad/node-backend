const mongoose = require('mongoose');

const customerTypeSchema = new mongoose.Schema({
    customerTypeId: {
        type: Number,
        unique: true,
        index: true,
        default: 0,
    },
    customerTypeCode: { type: String, required: true },
    customerTypeName: { type: String, required: true },
});

module.exports = mongoose.model('customertype', customerTypeSchema);