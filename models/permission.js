const mongoose = require('mongoose');
const permissionSchema = new mongoose.Schema({
    permissionName : { type: String, required: true },
    privileges:{type: Array, required: true, default: []}
})

module.exports = mongoose.model('permission', permissionSchema);
