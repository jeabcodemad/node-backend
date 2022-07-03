const mongoose = require('mongoose');
const autoIncrement = require('mongoose-easy-auto-increment');

const sampleParameterStatusSchema = new mongoose.Schema({
    sampleParameterStatusId: { type: Number, default: 0 },
    sampleParameterStatusCode: { type: String },
    sampleParameterStatusName: { type: String },
});

sampleParameterStatusSchema.plugin(autoIncrement, { field: 'sampleParameterStatusId', collection: 'SampleParameterStatusCounters' })
module.exports = mongoose.model('sampleparameterstatus', sampleParameterStatusSchema);