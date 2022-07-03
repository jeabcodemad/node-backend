const mongoose = require('mongoose');

const reportNoSchema = new mongoose.Schema({
    seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('reportno', reportNoSchema);