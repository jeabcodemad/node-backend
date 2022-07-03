const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const sampleSchema = new mongoose.Schema({
    sampleId: { type: Number, default: 0 },
    sampleNo: { type: String },

    sampleArticleNo: { type: String },
    sampleName: { type: String },
    sampleDescription: { type: String },
    sampleDescriptionTH: { type: String },
    certification: { type: String },
    sampleBuyerUID: { type: String },
    supplierCode: { type: String },
    supplierName: { type: String },
    sampleQty: { type: Number },

    remarkId: { type: Number },
    sampleParentId: { type: Number },
    quotationId: { type: Number },
    testingGroupId: { type: Number },
    sampleStatusId: { type: Number },
    sampleConditionId: { type: Number },

    refrigeratorTemperature: { type: String },
    productTemperature: { type: String },
    supplierCode: { type: String },
    supplierName: { type: String },
    collectedFrom: { type: String },
    collectedBy: { type: String },
    collectedDateTime: { type: Date },
    receivedDateTime: { type: Date },
    physicalProperty: { type: String },
    testDate: { type: Date },
    completionDate: { type: Date },
    shelfLife: { type: String },
    ARTNo: { type: String },
    MFD: { type: String },
    BBF: { type: String },
    laboratoryName: { type: String },

    dueDate: { type: Date },
    filePath: { type: String },

    deleted: { type: Boolean, default: false }
});

sampleSchema.virtual('remarkRef', {
    ref: 'remark',
    localField: 'remarkId',
    foreignField: 'remarkId',
    justOne: true
});
sampleSchema.set('toJSON', { virtuals: true });

sampleSchema.virtual('subsamples', {
    ref: 'sample',
    localField: 'sampleId',
    foreignField: 'sampleParentId',
});
sampleSchema.set('toJSON', { virtuals: true });

sampleSchema.virtual('parameters', {
    ref: 'sampleparameter',
    localField: 'sampleId',
    foreignField: 'sampleId',
});
sampleSchema.set('toJSON', { virtuals: true });

sampleSchema.virtual('quotationRef', {
    ref: 'quotation',
    localField: 'quotationId',
    foreignField: 'quotationId',
    justOne: true
});
sampleSchema.set('toJSON', { virtuals: true });

sampleSchema.virtual('testingGroupRef', {
    ref: 'testinggroup',
    localField: 'testingGroupId',
    foreignField: 'id',
    justOne: true
});
sampleSchema.set('toJSON', { virtuals: true });

sampleSchema.virtual('sampleStatusRef', {
    ref: 'samplestatus',
    localField: 'sampleStatusId',
    foreignField: 'sampleStatusId',
    justOne: true
});
sampleSchema.set('toJSON', { virtuals: true });

sampleSchema.virtual('conditions', {
    ref: 'samplesamplecondition',
    localField: 'sampleId',
    foreignField: 'sampleId',
});
sampleSchema.set('toJSON', { virtuals: true });

sampleSchema.virtual('references', {
    ref: 'samplereference',
    localField: 'sampleId',
    foreignField: 'sampleId',
});
sampleSchema.set('toJSON', { virtuals: true });

sampleSchema.plugin(autoIncrement, { field: 'sampleId', collection: 'SampleCounters' })

module.exports = mongoose.model('sample', sampleSchema);