const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const addressSchema = new mongoose.Schema({
    addressId: {
        type: Number,
        unique: true,
        index: true,
        default: 0,
    },
    addressAddrEN: { type: String, required: true },
    addressAddrTH: { type: String, required: true },
    provinceId: { type: Number },
    amphurId: { type: Number },
    tumbolId: { type: Number },
    zipcode: { type: String },
    customerId: { type: Number, required: true },
    deleted: { type: Boolean, default: false },
    latitude: { type: String },
    longitude: { type: String },
});

addressSchema.virtual('provinceRef', {
    ref: 'province',
    localField: 'provinceId',
    foreignField: 'provinceId',
    justOne: true
});
addressSchema.set('toJSON', { virtuals: true });

addressSchema.virtual('amphurRef', {
    ref: 'amphur',
    localField: 'amphurId',
    foreignField: 'amphurId',
    justOne: true
});
addressSchema.set('toJSON', { virtuals: true });

addressSchema.virtual('tumbolRef', {
    ref: 'tumbol',
    localField: 'tumbolId',
    foreignField: 'tumbolId',
    justOne: true
});
addressSchema.set('toJSON', { virtuals: true });

addressSchema.plugin(autoIncrement, { field: 'addressId', collection: 'AddressCounters' })

module.exports = mongoose.model('address', addressSchema);