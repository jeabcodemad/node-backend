const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, lowercase: true, required: true, trim: true, validate: [emailValidator, 'incorrect mail format'] },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    role: { type: Object, required: true },
    permission: { type: Array, required : true },
    customerTypeId : { type: String, required: true },
    customerId : { type: String, required: true },
    data: {
        displayName:{type: String, required:false, default: "name lastname"},
        photoURL:{type: String, required:false, default: "http://www.chemlabgroup.com/wp-content/uploads/2020/02/cropped-logohead-192x192.jpg"},
        email:{type: String, required:false, default: "email"},
        settings:{
            layout: {
                style: {type: String, required:false, default: "layout1"},
                config: {
                    scroll: {type: String, required:false, default: "layout1"},
                    navbar: {
                        display : {type: Boolean, default: true},
                        folded : {type: Boolean, default: false},
                        position : {type: String, default: "left"}
                    },
                    toolbar: {
                        display : {type: Boolean, default: true},
                        style : {type: String, default: "fixed"},
                        position : {type: String, default: "below"}
                    },
                    footer: {
                        display : {type: Boolean, default: true},
                        style : {type: String, default: "fixed"},
                        position : {type: String, default: "below"}
                    },
                    mode : {type: String, default: "fullwidth"}
                }
            },
            customScrollbars : {type: Boolean, default: true},
            theme: {
                main : {type: String, default: "legacy"},
                navbar : {type: String, default: "legacy"},
                toolbar : {type: String, default: "legacy"},
                footer : {type: String, default: "legacy"}
            }
        },
        shortcuts : ["calendar", "mail", "contacts"]
    } 
});

function emailValidator(value) {
    return /^.+@.+\..+$/.test(value);
}

userSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(this.password, salt);
        this.password = passwordHash;
        next();
    } catch (err) {
        next(err);
    }
});

// userSchema.methods.isPasswordValid = async function(value) {
//     try {
//         return await bcrypt.compare(value, this.password);
//     } catch (err) {
//         throw new Error(err);
//     }
// };

module.exports = mongoose.model('user', userSchema);