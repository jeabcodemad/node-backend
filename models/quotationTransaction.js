const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const quotationTransactionSchema = new mongoose.Schema({
    quotationTransactionId: { type: Number, default: 0 },
    quotationTransactionNode: { type: String },
    quotationTransactionDate: { type: Date },
    quotationStatusId: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId },
    quotationNumberId: { type: Number },
    created_at: { type: Date }
});

quotationTransactionSchema.virtual('quotationStatusRef', {
    ref: 'quotationstatus',
    localField: 'quotationStatusId',
    foreignField: 'quotationStatusId',
    justOne: true
});
quotationTransactionSchema.set('toJSON', { virtuals: true });

quotationTransactionSchema.virtual('quotationNumberRef', {
    ref: 'quotationnumber',
    localField: 'quotationNumberId',
    foreignField: 'quotationNumberId',
    justOne: true
});
quotationTransactionSchema.set('toJSON', { virtuals: true });

quotationTransactionSchema.virtual('userRef', {
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
quotationTransactionSchema.set('toJSON', { virtuals: true });

quotationTransactionSchema.plugin(autoIncrement, { field: 'quotationTransactionId', collection: 'QuotationTransactionCounters' })

module.exports = mongoose.model('quotationtransaction', quotationTransactionSchema);