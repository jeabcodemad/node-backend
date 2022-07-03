const mongoose = require('mongoose');

const labTypeSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        index: true,
        default: 0,
    },
    name: { type: String, required: true },
});

module.exports = mongoose.model('labtype', labTypeSchema);