const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');

// exports.register = async (req, res, next) => {
//     const { email, password, firstname, lastname, role } = req.body;
//     const user = await User.findOne({ email });
//     if(user) {
//         return res.status(403).json({ error: { message: 'email already in use!'} });
//     }

//     const newUser = new User({ email, password, firstname, lastname, role});
//     await newUser.save();

//     const token = getSignedToken(newUser);
//     res.status(200).json({  message: 'success' });
// };

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(403).json({ error: { message: 'invalid email or password!' } });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(403).json({ error: { message: 'invalid email or password!' } });
    }
    const access_token = getSignedToken(user);
    res.status(200).json({ user, access_token });
};

exports.verityUser = async (req, res, next) => {
    
    // if(token) {
    try {

        const user = jwt.verify(req.body.access_token, JWT_SECRET);
    const data = await User.findById(user.id);
        
        res.status(200).json({ user : data , access_token : req.body.access_token});

    } catch(err) {
        // error.message = 'invalid/expired token';
        // return next(err.message);
        res.status(400).json({'message' : err.message})
    }
    // }
}

getSignedToken = user => {
    return jwt.sign({ id: user._id, email: user.email, firstname: user.firstname, role: user.role }, JWT_SECRET, { expiresIn: '6h' });
};