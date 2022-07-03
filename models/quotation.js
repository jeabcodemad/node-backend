const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const quotationSchema = new mongoose.Schema({
    quotationId: { type: Number, default: 0 },
    quotationRevision: { type: String },
    quotationIssueDate: { type: Date },
    quotationDescription: { type: String },
    quotationTotal: { type: Number },
    quotationPercentDiscount: { type: Number },
    quotationDiscount: { type: Number },
    quotationPackingFee: { type: Number },
    quotationSubTotal: { type: Number },
    quotationVat: { type: Number },
    quotationGrandTotal: { type: Number },

    quotationTypeId: { type: Number },
    quotationNumberId: { type: Number },
    quotationReturnId: { type: Number },
    quotationSentId: { type: Number },
    quotationPaymentId: { type: Number },

    userId: { type: mongoose.Schema.Types.ObjectId },
    lang: { type: String },

    deleted: { type: Boolean, default: false },

    updated_at: { type: Date }
});

quotationSchema.virtual('quotationTypeRef', {
    ref: 'quotationtype',
    localField: 'quotationTypeId',
    foreignField: 'quotationTypeId',
    justOne: true
});
quotationSchema.set('toJSON', { virtuals: true });

quotationSchema.virtual('quotationNumberRef', {
    ref: 'quotationnumber',
    localField: 'quotationNumberId',
    foreignField: 'quotationNumberId',
    justOne: true
});
quotationSchema.set('toJSON', { virtuals: true });

quotationSchema.virtual('quotationReturnRef', {
    ref: 'quotationreturn',
    localField: 'quotationReturnId',
    foreignField: 'quotationReturnId',
    justOne: true
});
quotationSchema.set('toJSON', { virtuals: true });

quotationSchema.virtual('quotationSentRef', {
    ref: 'quotationsent',
    localField: 'quotationSentId',
    foreignField: 'quotationSentId',
    justOne: true
});
quotationSchema.set('toJSON', { virtuals: true });

quotationSchema.virtual('quotationPaymentRef', {
    ref: 'quotationpayment',
    localField: 'quotationPaymentId',
    foreignField: 'quotationPaymentId',
    justOne: true
});
quotationSchema.set('toJSON', { virtuals: true });

quotationSchema.virtual('sampleRef', {
    ref: 'sample',
    localField: 'quotationId',
    foreignField: 'quotationId',
});
quotationSchema.set('toJSON', { virtuals: true });

quotationSchema.virtual('userRef', {
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
quotationSchema.set('toJSON', { virtuals: true });

quotationSchema.plugin(autoIncrement, { field: 'quotationId', collection: 'QuotationCounters' });

module.exports = mongoose.model('quotation', quotationSchema);