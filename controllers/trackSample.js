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

exports.getSampleParameters = async (req, res, next) => {
    try {
        const sampleParameters = await SampleParameter.find({ sampleParameterStatusId: { $in: [2, 4, 5, 6, 7, 8] } })
            .populate({ path: 'sampleRef', populate: { path: 'quotationRef', populate: { path: 'quotationNumberRef', populate: 'customerRef' } } })
            .populate({ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'testingGroupRef' }] })
            .populate('labRef')
            .populate('sampleParameterStatusRef')
            .populate('sampleParameterTransactionRef')
            .sort({ 'sampleParameterId': 'desc' })
            .exec();

        const arr = sampleParameters.filter(item => {
            return item.sampleRef && item.sampleRef.quotationRef && !item.sampleRef.quotationRef.deleted && item.sampleRef.quotationRef.quotationNumberRef && !item.sampleRef.quotationRef.quotationNumberRef.deleted;
        });

        res.status(200).json({ data: arr, message: 'success' }).end();

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    };
};

exports.getSampleParameterTransactions = async (req, res, next) => {
    try {
        SampleParameterTransaction.find({ sampleParameterId: req.params.sampleparameterid })
            .populate({
                path: 'sampleParameterRef', populate: [
                    { path: 'sampleRef', populate: { path: 'quotationRef', populate: { path: 'quotationNumberRef', populate: 'customerRef' } } },
                    { path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'testingGroupRef' }] }
                ]
            })
            .populate('sampleParameterStatusRef')
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