const mongoose = require('mongoose');

const labGroupSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        index: true,
        default: 0,
    },
    name: { type: String, required: true },
});

module.exports = mongoose.model('labgroup', labGroupSchema);