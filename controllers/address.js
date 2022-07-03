const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const Address = require('../models/address');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const Province = require('../models/province');
const Amphur = require('../models/amphur');
const District = require('../models/tumbol');

exports.addresss = async (req, res, next) => {
    Address.find({ customerId: req.params.customerId, deleted: false })
        .populate('provinceRef')
        .populate('amphurRef')
        .populate('tumbolRef')
        .exec()
        .then(docs => {
            res.status(200).json({ data: docs, message: 'success' }).end();
        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });

};

exports.address = async (req, res, next) => {
    Address.find({ addressId: req.params.id, deleted: false }, function (error, doc) {
        if (error) {
            res.status(500).json({ data: doc, error: { message: 'Not found data' } }).end();
        } else {
            res.status(200).json({ data: doc, message: 'success' }).end();
        }
    });
};

exports.addAddress = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    const newAddress = {
        addressAddrEN,
        addressAddrTH,
        provinceId,
        amphurId,
        tumbolId,
        zipcode,
        customerId,
        deleted,
        latitude,
        longitude,
    } = req.body;

    const address = new Address(newAddress);

    const validateErrors = address.validateSync();
    if (validateErrors) {
        return res.status(400).json({ error: { message: validateErrors.message } });
    }

    address.save(function (error) {
        if (error) {
            res.status(500).json({ data: address, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: address, message: 'success' }).end();
        }
    });
};

exports.updateAddress = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    const newAddress = {
        addressId,
        addressAddrEN,
        addressAddrTH,
        provinceId,
        amphurId,
        tumbolId,
        zipcode,
        customerId,
        deleted,
        latitude,
        longitude,
    } = req.body;

    Address.findOneAndUpdate({ addressId: req.params.id }, newAddress, { new: true }, function (error, doc) {
        if (error) {
            res.status(500).json({ data: doc, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: doc, message: 'success' }).end();
        }
    });

};

exports.deleteAddress = async (req, res, next) => {
    Address.findOneAndUpdate({ addressId: req.params.id }, { deleted: true }, { new: true }, function (error, doc) {
        if (error) {
            res.status(500).json({ data: doc, error: { message: 'Not found data' } }).end();
        } else {
            res.status(200).json({ data: doc, message: 'success' }).end();
        }
    });
};