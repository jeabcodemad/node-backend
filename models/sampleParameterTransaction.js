const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const sampleParameterTransactionSchema = new mongoose.Schema({
    sampleParameterTransactionId: { type: Number, default: 0 },
    sampleParameterStatusId: { type: Number },
    sampleParameterTransactionNote: { type: String },
    sampleParameterId: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId },
    created_at: { type: Date },
});

sampleParameterTransactionSchema.virtual('sampleParameterRef', {
    ref: 'sampleparameter',
    localField: 'sampleParameterId',
    foreignField: 'sampleParameterId',
    justOne: true
});
sampleParameterTransactionSchema.set('toJSON', { virtuals: true });

sampleParameterTransactionSchema.virtual('sampleParameterStatusRef', {
    ref: 'sampleparameterstatus',
    localField: 'sampleParameterStatusId',
    foreignField: 'sampleParameterStatusId',
    justOne: true
});
sampleParameterTransactionSchema.set('toJSON', { virtuals: true });

sampleParameterTransactionSchema.virtual('userRef', {
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
sampleParameterTransactionSchema.set('toJSON', { virtuals: true });

sampleParameterTransactionSchema.plugin(autoIncrement, { field: 'sampleParameterTransactionId', collection: 'SampleParameterTransactionCounters' })
module.exports = mongoose.model('sampleparametertransaction', sampleParameterTransactionSchema);