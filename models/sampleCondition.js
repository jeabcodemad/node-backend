const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const sampleConditionSchema = new mongoose.Schema({
    sampleConditionId: { type: Number, default: 0 },
    sampleConditionGroup: { type: String },

    sampleConditionOrder: { type: Number },
    sampleConditionEN: { type: String },
    sampleConditionTH: { type: String },
});

sampleConditionSchema.plugin(autoIncrement, { field: 'sampleConditionId', collection: 'SampleConditionCounters' })

module.exports = mongoose.model('samplecondition', sampleConditionSchema);