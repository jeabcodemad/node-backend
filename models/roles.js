const mongoose = require('mongoose');
const roleSchema = new mongoose.Schema({
    roleName : { type: String, required: true }
})

module.exports = mongoose.model('role', roleSchema);
