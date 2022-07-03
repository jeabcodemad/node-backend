const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const referenceSchema = new mongoose.Schema({
    referenceId: { type: Number, default: 0 },
    referenceGroup: { type: String },

    referenceOrder: { type: Number },
    referenceEN: { type: String },
    referenceTH: { type: String },
});

referenceSchema.plugin(autoIncrement, { field: 'referenceId', collection: 'ReferenceCounters' })

module.exports = mongoose.model('reference', referenceSchema);