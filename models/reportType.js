const mongoose = require('mongoose');

const reportTypeSchema = new mongoose.Schema({
    id: { type: Number, default: 0 },
    name: { type: String },
    lang: { type: String },
    customerTypeId: { type: Number },
});

module.exports = mongoose.model('reporttype', reportTypeSchema);