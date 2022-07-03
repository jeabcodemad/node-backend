const mongoose = require('mongoose');

const tumbolSchema = new mongoose.Schema({
    tumbolId: {
        type: Number,
        unique: true,
        index: true,
        default: 0,
    },
    zipcode: { type: String, required: true },
    tumbolNameTH: { type: String, required: true },
    tumbolNameEN: { type: String, required: true },
    amphurId: { type: Number, required: true },
});

tumbolSchema.virtual('amphurRef', {
    ref: 'amphur',
    localField: 'amphurId',
    foreignField: 'amphurId',
    justOne: true
});
tumbolSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('tumbol', tumbolSchema);