const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const Roles = require('../models/roles');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');


exports.roles = async (req, res, next) => {
    try{
        const roles = await Roles.find({});
        console.log('res',res);
        res.send(roles);
        next();
    }catch(err) {
        res.send({ message : err.message , status : false });
        return next();
    }

};

exports.role = async (req, res, next) => {
    try{
        const role = await Roles.findById(req.params.id);
        res.send(role);
        next();
    }catch(err) {
        return next(new errors.ResourceNotFoundError(`User not found with id : ${req.params.id}`));
    }

};

exports.addRole = async (req, res, next) => {
    try {
        console.log('req body',req.body);
        const { roleName } = req.body;
        console.log('roleName',roleName);
        // const user = await User.findOne({ email });
        if (!roleName) {
            return res.status(403).json({ error: { message: 'role name is emply.' } });
        }
    
        const newRole = new Roles({ roleName });
        await newRole.save();
        //send email
    
        // const token = getSignedToken(newRole);
        res.status(200).json({ message: 'success' });
    } catch (error) {
        res.send({ message : err.message , status : false });
        return next();
    }
 
};

exports.updateRole = async (req, res, next) => {
  
    try{
        const role = await Roles.findOneAndUpdate({ _id: req.params.id }, req.body);
        res.sendStatus(200);
        next();
    }catch(err) {
        return next(new errors.ResourceNotFoundError(`No found user with id ${req.params.id}`));
    }
};

exports.deleteRole = async (req, res, next) => {
    try{
        const role = await Roles.findOneAndRemove({_id: req.params.id});
        res.send(204);
        next();
    }catch(err) {
        return next(new errors.ResourceNotFoundError(`No found user with id ${req.params.id}`));
    }
};