const mongoose = require('mongoose');

const sampleStatusSchema = new mongoose.Schema({
    sampleStatusId: { type: Number, default: 0 },
    sampleStatusCode: { type: String },
    sampleStatusName: { type: String },
});

module.exports = mongoose.model('samplestatus', sampleStatusSchema);