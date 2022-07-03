const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');
const Schema = mongoose.Schema
const labSchema = new mongoose.Schema({
    labId: { type: Number, default: 0 },
    labName: { type: String, required: true },
    labTel: { type: String, required: true },
    deleted: { type: Boolean, default: false },
    userId: [{
        type : Schema.Types.ObjectId,
        ref : 'user'
    }],
    labTypeId: { type: String, required: true },
});

labSchema.virtual('labTypeRef', {
    ref: 'labtype',
    localField: 'labTypeId',
    foreignField: 'id',
    justOne: true
});
labSchema.set('toJSON', { virtuals: true });

labSchema.virtual('userRef', {
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
labSchema.set('toJSON', { virtuals: true });

labSchema.plugin(autoIncrement, { field: 'labId', collection: 'LabCounters' })

module.exports = mongoose.model('lab', labSchema);