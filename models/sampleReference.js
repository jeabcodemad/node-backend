const mongoose = require('mongoose');

const sampleReferenceSchema = new mongoose.Schema({
    sampleId: { type: Number },
    referenceId: { type: Number },
    no: { type: Number },
});

sampleReferenceSchema.virtual('sampleRef', {
    ref: 'sample',
    localField: 'sampleId',
    foreignField: 'sampleId',
    justOne: true
});
sampleReferenceSchema.set('toJSON', { virtuals: true });

sampleReferenceSchema.virtual('referenceRef', {
    ref: 'reference',
    localField: 'referenceId',
    foreignField: 'referenceId',
    justOne: true
});
sampleReferenceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('samplereference', sampleReferenceSchema);