const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const TestingGroup = require('../models/testingGroup');
const LabGroup = require('../models/labGroup');
const LabType = require('../models/labType');
const CheckingGroup = require('../models/checkingGroup');
const Province = require('../models/province');
const Amphur = require('../models/amphur');
const Tumbol = require('../models/tumbol');
const CustomerType = require('../models/customerType');
const QuotationReturn = require('../models/quotationReturn');
const QuotationSent = require('../models/quotationSent');
const QuotationPayment = require('../models/quotationPayment');
const QuotationType = require('../models/quotationType');
const SampleCondition = require('../models/sampleCondition');
const Reference = require('../models/reference');
const Remark = require('../models/remark');
const Customer = require('../models/customer');
const ReportType = require('../models/reportType');
const PackageGroup = require('../models/packageGroup');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');


exports.testingGroups = async (req, res, next) => {
    TestingGroup.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.labGroups = async (req, res, next) => {
    LabGroup.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.checkingGroups = async (req, res, next) => {
    CheckingGroup.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.packageGroups = async (req, res, next) => {
    PackageGroup.find({ checkingGroupId: req.params.checkinggroupid, deleted: false }, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.labTypes = async (req, res, next) => {
    LabType.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.provinces = async (req, res, next) => {
    try {
        const docs = await Province.find().sort('provinceNameTH').exec();
        res.status(200).json({ data: docs, message: 'success' }).end();
    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.amphurs = async (req, res, next) => {
    try {
        const docs = await Amphur.find({ provinceId: req.params.provinceId }).sort('amphurNameTH').exec();
        res.status(200).json({ data: docs, message: 'success' }).end();
    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.tumbols = async (req, res, next) => {
    try {
        const docs = await Tumbol.find({ amphurId: req.params.amphurId }).sort('tumbolNameTH').exec();
        res.status(200).json({ data: docs, message: 'success' }).end();
    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.customerTypes = async (req, res, next) => {
    CustomerType.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.quotationReturns = async (req, res, next) => {
    QuotationReturn.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.quotationSents = async (req, res, next) => {
    QuotationSent.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.quotationPayments = async (req, res, next) => {
    QuotationPayment.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.quotationTypes = async (req, res, next) => {
    QuotationType.find({ customerTypeId: req.params.typeid }, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.remarks = async (req, res, next) => {
    Remark.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.getCustomersByType = async (req, res, next) => {
    Customer.find({ customerTypeId: req.params.typeid }, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.getSampleCondition = async (req, res, next) => {
    SampleCondition.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.getReference = async (req, res, next) => {
    Reference.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

exports.getReportType = async (req, res, next) => {
    ReportType.find({}, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};