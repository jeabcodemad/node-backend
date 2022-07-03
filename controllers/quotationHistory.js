const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const QuotationNumber = require('../models/quotationNumber');
const Quotation = require('../models/quotation');
const QuotationRemark = require('../models/quotationRemark');
const QuotationTransaction = require('../models/quotationTransaction');
const QuotationStatus = require('../models/quotationStatus');
const Sample = require('../models/sample');
const SampleParameter = require('../models/sampleParameter');
const TestParameter = require('../models/testParameter');
const SampleParameterTransaction = require('../models/sampleParameterTransaction');
const SampleStatus = require('../models/sampleStatus');
const ReportType = require('../models/reportType');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const { populate } = require('../models/sampleParameter');
const { exportReport, currentDate, formatDate, formatDatetime } = require('../utils/exportUtils');
const { toRomanNumber, genReportNo } = require('../utils/appUtils');
const ReportNo = require('../models/reportNo');

exports.getQuotationVersions = async (req, res, next) => {
    Quotation.find({ quotationNumberId: req.params.quotationnumberid })
        .sort({ 'quotationRevision': 'desc' })
        .exec()
        .then(docs => {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }).catch(error => {
            res.status(500).json({ error: { message: error.message } }).end();
        });
};

exports.getQuotationStep1 = async (req, res, next) => {
    QuotationNumber.findOne({ quotationNumberId: req.params.quotationnumberid, deleted: false })
        .populate('quotationStatusRef')
        .populate({ path: 'customerRef', populate: [{ path: 'addressReceiptRef' }, { path: 'addressSendRef' }, { path: 'customerTypeRef' }] })
        .exec()
        .then(quotationNumberDoc => {

            Quotation.findOne({ quotationNumberId: quotationNumberDoc.quotationNumberId, quotationId: req.params.quotationid })
                .populate('quotationTypeRef')
                .populate('quotationReturnRef')
                .populate('quotationSentRef')
                .populate('quotationPaymentRef')
                .exec()
                .then(quotationDoc => {

                    res.status(200).json({
                        data: {
                            quotationNumber: quotationNumberDoc,
                            quotation: quotationDoc,
                        },
                        message: 'success'
                    }).end();

                }).catch(error => {
                    res.status(500).json({ data: null, error: { message: error.message } }).end();
                });


        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });
};

exports.getQuotationStep2 = async (req, res, next) => {
    QuotationNumber.findOne({ quotationNumberId: req.params.quotationnumberid, deleted: false })
        .populate('quotationStatusRef')
        .populate({ path: 'customerRef', populate: [{ path: 'addressReceiptRef' }, { path: 'addressSendRef' }] })
        .exec()
        .then(quotationNumberDoc => {

            Quotation.findOne({ quotationNumberId: quotationNumberDoc.quotationNumberId, quotationId: req.params.quotationid })
                .populate('quotationTypeRef')
                .populate('quotationReturnRef')
                .populate('quotationSentRef')
                .populate('quotationPaymentRef')
                .exec()
                .then(quotationDoc => {

                    QuotationRemark.find({ quotationId: quotationDoc.quotationId })
                        .exec()
                        .then(quotationRemarkDocs => {

                            Sample.find({ quotationId: quotationDoc.quotationId, sampleParentId: null })
                                .sort('sampleId')
                                .populate('remarkRef')
                                .populate({ path: 'subsamples', populate: [{ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }, { path: 'referenceRef' }] }, { path: 'sampleStatusRef' }, { path: 'sampleConditionRef' }] })
                                .populate('quotationRef')
                                .populate('testingGroupRef')
                                .populate({ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }, { path: 'labRef' }, { path: 'referenceRef' }] })
                                .populate('sampleStatusRef')
                                .populate('sampleConditionRef')
                                .exec()
                                .then(sampleDocs => {

                                    res.status(200).json({
                                        data: {
                                            quotationNumber: quotationNumberDoc,
                                            quotation: quotationDoc,
                                            quotationRemarks: quotationRemarkDocs,
                                            samples: sampleDocs,
                                        },
                                        message: 'success'
                                    }).end();

                                }).catch(error => {
                                    res.status(500).json({ data: null, error: { message: error.message } }).end();
                                });



                        }).catch(error => {
                            res.status(500).json({ data: null, error: { message: error.message } }).end();
                        });

                }).catch(error => {
                    res.status(500).json({ data: null, error: { message: error.message } }).end();
                });


        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });
};

exports.getQuotationStep3 = async (req, res, next) => {
    QuotationNumber.findOne({ quotationNumberId: req.params.quotationnumberid, deleted: false })
        .populate('quotationStatusRef')
        .populate({ path: 'customerRef', populate: [{ path: 'addressReceiptRef' }, { path: 'addressSendRef' }] })
        .exec()
        .then(quotationNumberDoc => {

            Quotation.findOne({ quotationNumberId: quotationNumberDoc.quotationNumberId, quotationId: req.params.quotationid })
                .populate('quotationTypeRef')
                .populate('quotationReturnRef')
                .populate('quotationSentRef')
                .populate('quotationPaymentRef')
                .exec()
                .then(quotationDoc => {

                    QuotationRemark.find({ quotationId: quotationDoc.quotationId })
                        .populate('remarkRef')
                        .exec()
                        .then(quotationRemarkDocs => {

                            res.status(200).json({
                                data: {
                                    quotationNumber: quotationNumberDoc,
                                    quotation: quotationDoc,
                                    quotationRemarks: quotationRemarkDocs,
                                },
                                message: 'success'
                            }).end();

                        }).catch(error => {
                            res.status(500).json({ data: null, error: { message: error.message } }).end();
                        });

                }).catch(error => {
                    res.status(500).json({ data: null, error: { message: error.message } }).end();
                });


        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });
};