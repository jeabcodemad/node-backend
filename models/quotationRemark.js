const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const quotationRemarkSchema = new mongoose.Schema({
    quotationRemarkId: { type: Number, default: 0 },
    remarkId: { type: Number },
    quotationId: { type: Number },
    quotationRemarkSort: { type: Number },
    quotationRemarkType: { type: Number },
});

quotationRemarkSchema.virtual('remarkRef', {
    ref: 'remark',
    localField: 'remarkId',
    foreignField: 'remarkId',
    justOne: true
});
quotationRemarkSchema.set('toJSON', { virtuals: true });

quotationRemarkSchema.virtual('quotationRef', {
    ref: 'quotation',
    localField: 'quotationId',
    foreignField: 'quotationId',
    justOne: true
});
quotationRemarkSchema.set('toJSON', { virtuals: true });

quotationRemarkSchema.plugin(autoIncrement, { field: 'quotationRemarkId', collection: 'QuotationRemarkCounters' })

module.exports = mongoose.model('quotationremark', quotationRemarkSchema);