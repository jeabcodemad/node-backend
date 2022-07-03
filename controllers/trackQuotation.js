const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const Sample = require('../models/sample');
const SampleParameter = require('../models/sampleParameter');
const SampleParameterStatus = require('../models/sampleParameterStatus');
const SampleParameterTransaction = require('../models/sampleParameterTransaction');
const QuotationNumber = require('../models/quotationNumber');
const QuotationTransaction = require('../models/quotationTransaction');
const Quotation = require('../models/quotation');
const QuotationStatus = require('../models/quotationStatus');
const TestParamter = require('../models/testParameter');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const sample = require('../models/sample');
const { getUserLogin } = require('../utils/appUtils');

exports.quotations = async (req, res, next) => {
    try {

        const user = await getUserLogin(req);

        QuotationNumber.find({ deleted: false })
            .populate('quotationStatusRef')
            .populate('customerRef')
            .sort({ 'created_at': 'desc' })
            .populate({ path: 'quotationRef', populate: [{ path: 'sampleRef', populate: [{ path: 'subsamples' }] }] })
            .exec()
            .then(docs => {
                res.status(200).json({ data: docs, message: 'success' }).end();
            })
            .catch(error => {
                res.status(500).json({ error: { message: error.message } }).end();
            });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    };
};

exports.getQuotationTransactions = async (req, res, next) => {
    try {
        QuotationTransaction.find({ quotationNumberId: req.params.quotationnumberid })
            .populate({ path: 'quotationNumberRef', populate: [{ path: 'customerRef' }] })
            .populate('quotationStatusRef')
            .populate('userRef')
            .sort({ 'created_at': 'desc' })
            .exec()
            .then(docs => {
                res.status(200).json({ data: docs, message: 'success' }).end();
            })
            .catch(error => {
                res.status(500).json({ data: null, error: { message: error.message } }).end();
            });
    } catch (error) {
        res.status(500).json({ data: null, error: { message: error.message } }).end();
    };
}