const mongoose = require('mongoose');

const remarkSchema = new mongoose.Schema({
    remarkId: { type: Number, default: 0 },
    remarkDetail: { type: String },
    remarkType: { type: Number },
});

module.exports = mongoose.model('remark', remarkSchema);