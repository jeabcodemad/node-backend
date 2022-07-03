const mongoose = require('mongoose');

const amphurSchema = new mongoose.Schema({
    amphurId: {
        type: Number,
        unique: true,
        index: true,
        default: 0,
    },
    amphurCode: { type: String, required: true },
    amphurNameTH: { type: String, required: true },
    amphurNameEN: { type: String, required: true },
    provinceId: { type: Number, required: true },
});

amphurSchema.virtual('provinceRef', {
    ref: 'province',
    localField: 'provinceId',
    foreignField: 'provinceId',
    justOne: true
});
amphurSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('amphur', amphurSchema);