const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');


exports.users = async (req, res, next) => {
    try{
        const users = await User.find({});
        console.log('users',users);
        res.send(users);
        next();
    }catch(err) {
        return next(err.message);
    }

};

exports.user = async (req, res, next) => {
    try{
        const user = await User.findById(req.params.id);
        res.send(user);
        next();
    }catch(err) {
        return next(new errors.ResourceNotFoundError(`User not found with id : ${req.params.id}`));
    }

};

exports.addUser = async (req, res, next) => {
    // if(req.user.role !== "admin") {
    //     return res.redirect('https://www.google.com');
    // }

//   console.log("req: ",req.body)
    
    const { email, password, firstname, lastname, customerId, customerTypeId, role , permission } = req.body;
    
    const user = await User.findOne({ email });
    if (user) {
        return res.status(403).json({ error: { message: 'email already in use!' } });
    }

    const newUser = new User({ email, password : '1234', firstname, lastname, customerId, customerTypeId, role , permission });
    await newUser.save();
    //send email

    const token = getSignedToken(newUser);
    res.status(200).json({ message: 'success' });
};

//update
exports.updateUser = async (req, res, next) => {
    // if(req.user.role !== "admin") {
    //     return res.redirect('https://www.google.com');
    // }

    try{
        if(req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(req.body.password, salt);
            // console.log('req.body.password',req.body.password);
            // console.log('passwordHash',passwordHash);
            req.body.password = passwordHash;
        }
        // console.log('req.body',req.body);
        const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body);
        res.sendStatus(200);
        next();
    }catch(err) {
        res.status(403).send({ message : err.message  });

    }
};

//delete
exports.deleteUser = async (req, res, next) => {
    // if(req.user.role !== "admin") {
    //     return res.redirect('https://www.google.com');
    // }
    try{
        const user = await User.findOneAndRemove({_id: req.params.id});
        res.send(204);
        next();
    }catch(err) {
        return next(new errors.ResourceNotFoundError(`No found user with id ${req.params.id}`));
    }
};



getSignedToken = user => {
    return jwt.sign({ id: user._id, email: user.email, firstname: user.firstname, role: user.role }, JWT_SECRET, { expiresIn: '6h' });
};