const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const packageGroupTestParameterSchema = new mongoose.Schema({
    packageId: { type: Number},
    parameterId: { type: Number},
});

packageGroupTestParameterSchema.virtual('packageGroupRef', {
    ref: 'packagegroup',
    localField: 'packageId',
    foreignField: 'packageId',
    justOne: true
});
packageGroupTestParameterSchema.set('toJSON', { virtuals: true });

packageGroupTestParameterSchema.virtual('testParameterRef', {
    ref: 'testparameter',
    localField: 'parameterId',
    foreignField: 'parameterId',
    justOne: true
});
packageGroupTestParameterSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('packagegrouptestparameter', packageGroupTestParameterSchema);