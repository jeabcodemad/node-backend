const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const quotationNumberSchema = new mongoose.Schema({
    quotationNumberId: { type: Number, default: 0 },
    quotationNumber: { type: String },
    quotationStatusId: { type: Number },
    customerId: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId },
    deleted: { type: Boolean, default: false },

    created_at: { type: Date }
});

quotationNumberSchema.virtual('quotationStatusRef', {
    ref: 'quotationstatus',
    localField: 'quotationStatusId',
    foreignField: 'quotationStatusId',
    justOne: true
});
quotationNumberSchema.set('toJSON', { virtuals: true });

quotationNumberSchema.virtual('customerRef', {
    ref: 'customer',
    localField: 'customerId',
    foreignField: 'customerId',
    justOne: true
});
quotationNumberSchema.set('toJSON', { virtuals: true });

quotationNumberSchema.virtual('quotationRef', {
    ref: 'quotation',
    localField: 'quotationNumberId',
    foreignField: 'quotationNumberId',
    justOne: true
});
quotationNumberSchema.set('toJSON', { virtuals: true });

quotationNumberSchema.virtual('userRef', {
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
quotationNumberSchema.set('toJSON', { virtuals: true });

quotationNumberSchema.plugin(autoIncrement, { field: 'quotationNumberId', collection: 'QuotationNumberCounters' })

module.exports = mongoose.model('quotationnumber', quotationNumberSchema);