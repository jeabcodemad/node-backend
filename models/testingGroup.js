const mongoose = require('mongoose');

const testingGroupSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        index: true,
        default: 0,
    },
    name: { type: String, required: true },
    code: { type: String, required: true },
});

module.exports = mongoose.model('testinggroup', testingGroupSchema);