const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const sampleParameterSchema = new mongoose.Schema({
    sampleParameterId: { type: Number, default: 0 },
    sampleId: { type: Number },
    parameterId: { type: Number },
    qty: { type: Number },
    price: { type: Number },
    certified: { type: String },

    result: { type: Number },
    uncertainty: { type: Number },
    value_display: { type: Number },

    duedatein: { type: Date },
    duedateout: { type: Date },

    sampleParameterStatusId: { type: Number },
    labId: { type: Number },
    referenceId: { type: Number },
    referenceIds: { type: String },
});

sampleParameterSchema.virtual('sampleRef', {
    ref: 'sample',
    localField: 'sampleId',
    foreignField: 'sampleId',
    justOne: true
});
sampleParameterSchema.set('toJSON', { virtuals: true });

sampleParameterSchema.virtual('parameterRef', {
    ref: 'testparameter',
    localField: 'parameterId',
    foreignField: 'parameterId',
    justOne: true
});
sampleParameterSchema.set('toJSON', { virtuals: true });

sampleParameterSchema.virtual('sampleParameterStatusRef', {
    ref: 'sampleparameterstatus',
    localField: 'sampleParameterStatusId',
    foreignField: 'sampleParameterStatusId',
    justOne: true
});
sampleParameterSchema.set('toJSON', { virtuals: true });

sampleParameterSchema.virtual('labRef', {
    ref: 'lab',
    localField: 'labId',
    foreignField: 'labId',
    justOne: true
});
sampleParameterSchema.set('toJSON', { virtuals: true });

sampleParameterSchema.virtual('sampleParameterTransactionRef', {
    ref: 'sampleparametertransaction',
    localField: 'sampleParameterId',
    foreignField: 'sampleParameterId',
});
sampleParameterSchema.set('toJSON', { virtuals: true });

sampleParameterSchema.virtual('referenceRef', {
    ref: 'reference',
    localField: 'referenceId',
    foreignField: 'referenceId',
    justOne: true
});
sampleParameterSchema.set('toJSON', { virtuals: true });

sampleParameterSchema.plugin(autoIncrement, { field: 'sampleParameterId', collection: 'SampleParameterCounters' })

module.exports = mongoose.model('sampleparameter', sampleParameterSchema);