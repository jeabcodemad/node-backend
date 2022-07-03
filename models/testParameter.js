const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const testParameterSchema = new mongoose.Schema({
    parameterId: { type: Number, unique: false, index: false, },
    orderOfPackageGroup: { type: Number, required: true },
    parameterNameEN: { type: String, required: true },
    parameterNameTH: { type: String, required: true },
    unitEN: { type: String, required: true },
    unitTH: { type: String, required: true },
    standards: { type: String, required: true },
    lod: { type: Number, required: true },
    loq: { type: Number, required: true },
    testingValue: { type: Number, required: true },
    version: { type: Number, default: 1 },
    lastUpdate: { type: Date, default: Date.now },
    //packageId: { type: Number, required: true },
    labId: { type: Number, required: true },
    testingGroupId: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId },
    deleted: { type: Boolean, default: false },
});

/* testParameterSchema.virtual('packageGroupRef', {
    ref: 'packagegroup',
    localField: 'packageId',
    foreignField: 'packageId',
    justOne: true
});
testParameterSchema.set('toJSON', { virtuals: true }); */

testParameterSchema.virtual('labRef', {
    ref: 'lab',
    localField: 'labId',
    foreignField: 'labId',
    justOne: true
});
testParameterSchema.set('toJSON', { virtuals: true });

testParameterSchema.virtual('testingGroupRef', {
    ref: 'testinggroup',
    localField: 'testingGroupId',
    foreignField: 'id',
    justOne: true
});
testParameterSchema.set('toJSON', { virtuals: true });

testParameterSchema.virtual('userRef', {
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
testParameterSchema.set('toJSON', { virtuals: true });

testParameterSchema.plugin(autoIncrement, { field: 'parameterId', collection: 'TestParameterCounters' });

module.exports = mongoose.model('testparameter', testParameterSchema);