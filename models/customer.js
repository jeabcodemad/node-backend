const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const customerSchema = new mongoose.Schema({
    customerId: { type: Number, default: 0 },
    customerCode: { type: String, required: true },
    customerNameEN: { type: String, required: true },
    customerNameTH: { type: String, required: true },
    customerTaxNumber: { type: String, required: true },
    customerTaxNumber: { type: String, required: true },
    customerTel: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerFax: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerNoAccount: { type: String, required: true },
    customerRegisterDate: { type: Date, required: true },
    customerUpdateDate: { type: Date, required: true },
    customerTypeId: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId },
    addressSend: { type: Number },
    addressReceipt: { type: Number },
    deleted: { type: Boolean, default: false }
});

customerSchema.virtual('customerTypeRef', {
    ref: 'customertype',
    localField: 'customerTypeId',
    foreignField: 'customerTypeId',
    justOne: true
});
customerSchema.set('toJSON', { virtuals: true });

customerSchema.virtual('addressSendRef', {
    ref: 'address',
    localField: 'addressSend',
    foreignField: 'addressId',
    justOne: true
});
customerSchema.set('toJSON', { virtuals: true });

customerSchema.virtual('addressReceiptRef', {
    ref: 'address',
    localField: 'addressReceipt',
    foreignField: 'addressId',
    justOne: true
});
customerSchema.set('toJSON', { virtuals: true });

customerSchema.virtual('userRef', {
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
customerSchema.set('toJSON', { virtuals: true });

customerSchema.plugin(autoIncrement, { field: 'customerId', collection: 'CustomerCounters' })

module.exports = mongoose.model('customer', customerSchema);