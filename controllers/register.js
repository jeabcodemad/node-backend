const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');

exports.register = async (req, res, next) => {
    const { email, password, firstname, lastname, role } = req.body;
    const user = await User.findOne({ email });
    console.log(email)
    if(user) {
        return res.status(403).json({ error: { message: 'email already in use!'} });
    }

    const newUser = new User({ email, password, firstname, lastname, role});
    await newUser.save();

    const token = getSignedToken(newUser);
    res.status(200).json({  message: 'success' });
};

getSignedToken = user => {
    return jwt.sign({ id: user._id, email: user.email, firstname: user.firstname, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
};