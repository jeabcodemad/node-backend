const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const packageGroupSchema = new mongoose.Schema({
    packageId: { type: Number, default: 0 },
    packageCode: { type: String, required: true },
    testingType: { type: String, required: true },
    packageName: { type: String, required: true },
    standardValueEN: { type: String, required: true },
    standardValueTH: { type: String, required: true },
    checkingGroupId: { type: Number, required: true },
    deleted: { type: Boolean, default: false }
});

packageGroupSchema.virtual('checkingGroupRef', {
    ref: 'checkinggroup',
    localField: 'checkingGroupId',
    foreignField: 'id',
    justOne: true
});
packageGroupSchema.set('toJSON', { virtuals: true });

packageGroupSchema.virtual('packageGroupTestParameterRef', {
    ref: 'packagegrouptestparameter',
    localField: 'packageId',
    foreignField: 'packageId',
});
packageGroupSchema.set('toJSON', { virtuals: true });

packageGroupSchema.plugin(autoIncrement, { field: 'packageId', collection: 'PackageGroupCounters' })

module.exports = mongoose.model('packagegroup', packageGroupSchema);