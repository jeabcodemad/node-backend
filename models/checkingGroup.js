const mongoose = require('mongoose');

const checkingGroupSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        index: true,
        default: 0,
    },
    name: { type: String, required: true },
});

module.exports = mongoose.model('checkinggroup', checkingGroupSchema);