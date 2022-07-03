const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const Customer = require('../models/customer');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const Address = require('../models/address');
const CustomerType = require('../models/customerType');
const { convertDateToString, getUserLoginId } = require('../utils/appUtils');

exports.customers = async (req, res, next) => {
    try {

        Customer.find({ deleted: false })
            .populate('customerTypeRef')
            .populate('addressSendRef')
            .populate('addressReceiptRef')
            .exec()
            .then(docs => {
                res.status(200).json({ data: docs, message: 'success' }).end();
            })
            .catch(error => {
                res.status(500).json({ data: null, error: { message: error.message } }).end();
            });

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }

};

exports.customer = async (req, res, next) => {
    try {

        Customer.findOne({ customerId: req.params.id, deleted: false })
            .populate('customerTypeRef')
            .populate('addressSendRef')
            .populate('addressReceiptRef')
            .exec()
            .then(docs => {
                res.status(200).json({ data: docs, message: 'success' }).end();
            })
            .catch(error => {
                res.status(500).json({ data: null, error: { message: error.message } }).end();
            });

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.addCustomer = async (req, res, next) => {
    try {
        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("Expects 'application/json'"));
        }

        const userId = await getUserLoginId(req);

        const newCustomer = {
            customerCode,
            customerNameEN,
            customerNameTH,
            customerTaxNumber,
            customerTaxNumber,
            customerTel,
            customerPhone,
            customerFax,
            customerEmail,
            customerNoAccount,
            customerRegisterDate,
            customerUpdateDate,
            customerTypeId,
            addressSend,
            addressReceipt,
        } = req.body;

        newCustomer.userId = userId;

        const customer = new Customer(newCustomer);
        const strCurrentDate = convertDateToString(new Date());
        customer.customerRegisterDate = strCurrentDate;
        customer.customerUpdateDate = strCurrentDate;

        const validateErrors = customer.validateSync();
        if (validateErrors) {
            return res.status(400).json({ error: { message: validateErrors.message } });
        }

        customer.save(function (error) {
            if (error) {
                res.status(500).json({ data: customer, error: { message: error.message } }).end();
            } else {
                res.status(200).json({ data: customer, message: 'success' }).end();
            }
        });

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.updateCustomer = async (req, res, next) => {
    try {

        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("Expects 'application/json'"));
        }

        const userId = await getUserLoginId(req);

        const newCustomer = {
            customerId,
            customerCode,
            customerNameEN,
            customerNameTH,
            customerTaxNumber,
            customerTaxNumber,
            customerTel,
            customerPhone,
            customerFax,
            customerEmail,
            customerNoAccount,
            customerRegisterDate,
            customerUpdateDate,
            customerTypeId,
            addressSend,
            addressReceipt,
        } = req.body;

        newCustomer.userId = userId;

        const strCurrentDate = convertDateToString(new Date());
        newCustomer.customerUpdateDate = strCurrentDate;

        Customer.findOneAndUpdate({ customerId: req.params.id }, newCustomer, { new: true }, function (error, doc) {
            if (error) {
                res.status(500).json({ data: doc, error: { message: error.message } }).end();
            } else {
                res.status(200).json({ data: doc, message: 'success' }).end();
            }
        });

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }

};

exports.deleteCustomer = async (req, res, next) => {
    try {
        const userId = await getUserLoginId(req);

        Customer.findOneAndUpdate({ customerId: req.params.id }, { deleted: true, userId }, { new: true }, function (error, doc) {
            if (error) {
                res.status(500).json({ data: doc, error: { message: 'Not found data' } }).end();
            } else {
                res.status(200).json({ data: doc, message: 'success' }).end();
            }
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.updateCustomerAddressSend = async (req, res, next) => {
    try {

        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("Expects 'application/json'"));
        }

        const userId = await getUserLoginId(req);

        Customer.findOneAndUpdate({ customerId: req.params.id }, { addressSend: req.body.addressId, userId }, { new: true }, function (error, doc) {
            if (error) {
                res.status(500).json({ data: doc, error: { message: error.message } }).end();
            } else {
                Customer.findOne({ customerId: doc.customerId, deleted: false })
                    .populate('customerTypeRef')
                    .populate('addressSendRef')
                    .populate('addressReceiptRef')
                    .exec()
                    .then(docs => {
                        res.status(200).json({ data: docs, message: 'success' }).end();
                    })
                    .catch(error => {
                        res.status(500).json({ data: null, error: { message: error.message } }).end();
                    });
            }
        });

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.updateCustomerAddressReceipt = async (req, res, next) => {
    try {

        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("Expects 'application/json'"));
        }

        const userId = await getUserLoginId(req);

        Customer.findOneAndUpdate({ customerId: req.params.id }, { addressReceipt: req.body.addressId, userId }, { new: true }, function (error, doc) {
            if (error) {
                res.status(500).json({ data: doc, error: { message: error.message } }).end();
            } else {
                Customer.findOne({ customerId: doc.customerId, deleted: false })
                    .populate('customerTypeRef')
                    .populate('addressSendRef')
                    .populate('addressReceiptRef')
                    .exec()
                    .then(docs => {
                        res.status(200).json({ data: docs, message: 'success' }).end();
                    })
                    .catch(error => {
                        res.status(500).json({ data: null, error: { message: error.message } }).end();
                    });
            }
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};