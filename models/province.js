const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
    provinceId: {
        type: Number,
        unique: true,
        index: true,
        default: 0,
    },
    provinceCode: { type: String, required: true },
    provinceNameTH: { type: String, required: true },
    provinceNameEN: { type: String, required: true },
});

module.exports = mongoose.model('province', provinceSchema);