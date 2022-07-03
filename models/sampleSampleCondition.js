const mongoose = require('mongoose');

const sampleSampleConditionSchema = new mongoose.Schema({
    sampleId: { type: Number },
    sampleConditionId: { type: Number },
});

sampleSampleConditionSchema.virtual('sampleRef', {
    ref: 'sample',
    localField: 'sampleId',
    foreignField: 'sampleId',
    justOne: true
});
sampleSampleConditionSchema.set('toJSON', { virtuals: true });

sampleSampleConditionSchema.virtual('sampleConditionRef', {
    ref: 'samplecondition',
    localField: 'sampleConditionId',
    foreignField: 'sampleConditionId',
    justOne: true
});
sampleSampleConditionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('samplesamplecondition', sampleSampleConditionSchema);