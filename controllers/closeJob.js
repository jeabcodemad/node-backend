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
const { genQuotationNumber, getUserLoginId } = require('../utils/appUtils');

exports.quotations = async (req, res, next) => {
    try {
        QuotationNumber.find({ quotationStatusId: 9, deleted: false })
            .populate('quotationStatusRef')
            .populate('customerRef')
            .sort({ 'created_at': 'desc' })
            .populate({ path: 'quotationRef', populate: [{ path: 'sampleRef', populate: [{ path: 'subsamples' }] }] })
            .exec()
            .then(docs => {
                res.status(200).json({ data: docs, message: 'success' }).end();
            })
            .catch(error => {
                res.status(500).json({ data: null, error: { message: error.message } }).end();
            });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    };
};


exports.copyQuotation = async (req, res, next) => {
    try {

        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("Expects 'application/json'"));
        }

        if (!req.body.quotationNumberId || !req.body.customerId || !req.body.userType) {
            return res.status(400).json({ data: req.body, error: { message: 'parameter must not be empty' } });
        }

        const userId = await getUserLoginId(req);

        //-- create quotation number
        let quotationNumberData = {
            customerId: req.body.customerId,
            userType: req.body.userType,
            created_at: new Date(),
            quotationStatusId: 3,
            userId,
        };

        const refQuotationNumberId = req.body.quotationNumberId;

        const quotationNumberModel = new QuotationNumber(quotationNumberData);
        let validateErrors = quotationNumberModel.validateSync();
        if (validateErrors) {
            return res.status(400).json({ data: req.body, error: { message: validateErrors.message } });
        }

        quotationNumberModel.save(function (error) {
            if (error) {
                res.status(500).json({ data: req.body, error: { message: error.message } }).end();
            } else {

                //-- update quotation number: generate new number
                const newNumber = genQuotationNumber(req.body.userType, quotationNumberModel.quotationNumberId);

                QuotationNumber.findOneAndUpdate({ quotationNumberId: quotationNumberModel.quotationNumberId, deleted: false }, { quotationNumber: newNumber }, { new: true }, function (error, doc) {
                    if (error) {
                        res.status(500).json({ data: req.body, error: { message: error.message } }).end();
                    } else {

                        //-- create quotation
                        const quotationData = {
                            quotationRevision: "1",
                            quotationNumberId: doc.quotationNumberId,
                            updated_at: new Date(),
                            userId,
                        };

                        const quotationModel = new Quotation(quotationData);
                        quotationModel.save(async function (error) {
                            if (error) {
                                res.status(500).json({ data: req.body, error: { message: error.message } }).end();
                            } else {

                                //-- create quotation transaction
                                const quotationTransactionData = {
                                    quotationNumberId: doc.quotationNumberId,
                                    quotationStatusId: 1,
                                    created_at: new Date(),
                                    userId,
                                };

                                const quotationTransaction = new QuotationTransaction(quotationTransactionData);
                                await quotationTransaction.save();

                                //-- create quotation transaction : create customer
                                const quotationTransactionData2 = {
                                    quotationNumberId: doc.quotationNumberId,
                                    quotationStatusId: 2,
                                    created_at: new Date(),
                                };

                                const quotationTransaction2 = new QuotationTransaction(quotationTransactionData2);
                                await quotationTransaction2.save();

                                //-- copy sample
                                const refQuotationNumber = await QuotationNumber.findOne({ quotationNumberId: refQuotationNumberId, deleted: false })
                                    .populate({ path: 'quotationRef', populate: { path: 'sampleRef', populate: [{ path: 'parameters', populate: { path: 'parameterRef' } }, { path: 'subsamples', populate: { path: 'parameters', populate: { path: 'parameterRef' } } }] } })
                                    .exec();

                                const samples = refQuotationNumber.quotationRef.sampleRef;

                                //create sample
                                if (samples) {

                                    for (let i = 0; i < samples.length; i++) {

                                        let sampleData = {
                                            quotationId: quotationModel.quotationId,
                                            sampleName: samples[i].sampleName,
                                            sampleDescription: samples[i].sampleDescription,
                                            sampleDescriptionTH: samples[i].sampleDescriptionTH,
                                            sampleQty: samples[i].sampleQty,
                                            testingGroupId: samples[i].testingGroupId,
                                            sampleParentId: samples[i].sampleParentId,
                                        };

                                        const sampleModel = new Sample(sampleData);

                                        validateErrors = sampleModel.validateSync();
                                        if (validateErrors) {
                                            return res.status(400).json({ error: { message: validateErrors.message } });
                                        }

                                        const sampleDoc = await sampleModel.save();

                                        //create sample parameters
                                        const sampleParameters = samples[i].parameters;

                                        if (sampleParameters) {
                                            for (let j = 0; j < sampleParameters.length; j++) {
                                                const sp = sampleParameters[j];

                                                //-- create sample parameter
                                                let sampleParameterData = {
                                                    sampleId: sampleDoc.sampleId,
                                                    parameterId: sp.parameterRef.parameterId,
                                                    qty: sp.qty,
                                                    price: sp.price,
                                                    certified: sp.certified,
                                                    sampleParameterStatusId: 1,
                                                };

                                                const sampleParameterModel = new SampleParameter(sampleParameterData);
                                                const sampleParameterDoc = await sampleParameterModel.save();

                                                //-- create sample parameter transaction
                                                let sampleParameterTransactionData = {
                                                    sampleParameterStatusId: 1,
                                                    sampleParameterId: sampleParameterDoc.sampleParameterId,
                                                    userId,
                                                    created_at: new Date(),
                                                }

                                                const sampleParameterTransaction = new SampleParameterTransaction(sampleParameterTransactionData);
                                                await sampleParameterTransaction.save();

                                            }
                                        }

                                        //-- create sub sample
                                        const subsamples = samples[i].subsamples;

                                        if (subsamples) {
                                            for (let j = 0; j < subsamples.length; j++) {

                                                let subsampleData = {
                                                    quotationId: quotationModel.quotationId,
                                                    sampleName: subsamples[j].sampleName,
                                                    sampleDescription: subsamples[j].sampleDescription,
                                                    sampleDescriptionTH: subsamples[j].sampleDescriptionTH,
                                                    sampleQty: subsamples[j].sampleQty,
                                                    testingGroupId: subsamples[j].testingGroupId,
                                                    sampleParentId: sampleDoc.sampleId,
                                                };

                                                const subsampleModel = new Sample(subsampleData);

                                                validateErrors = subsampleModel.validateSync();
                                                if (validateErrors) {
                                                    return res.status(400).json({ error: { message: validateErrors.message } });
                                                }

                                                const subsampleDoc = await subsampleModel.save();
                                                const subsampleParameters = subsamples[j].parameters;

                                                for (let k = 0; k < subsampleParameters.length; k++) {
                                                    const ssp = subsampleParameters[k];

                                                    //-- create sub sample parameter
                                                    let subsampleParameterData = {
                                                        sampleId: subsampleDoc.sampleId,
                                                        parameterId: ssp.parameterRef.parameterId,
                                                        qty: ssp.qty,
                                                        price: ssp.price,
                                                        certified: ssp.certified,
                                                        sampleParameterStatusId: 1,
                                                    };

                                                    const subsampleParameterModel = new SampleParameter(subsampleParameterData);
                                                    const subsampleParameterDoc = await subsampleParameterModel.save();

                                                    //-- create sample parameter transaction
                                                    let sampleParameterTransactionData = {
                                                        sampleParameterStatusId: 1,
                                                        sampleParameterId: subsampleParameterDoc.sampleParameterId,
                                                        userId,
                                                        created_at: new Date(),
                                                    };

                                                    const sampleParameterTransactionModel = new SampleParameterTransaction(sampleParameterTransactionData);
                                                    await sampleParameterTransactionModel.save();

                                                }

                                            }
                                        }

                                    }
                                }

                                res.status(200).json({ data: { quotationNumber: newNumber }, message: 'success' }).end();

                            }
                        });

                    }
                });
            }
        });

    } catch (error) {
        console.log("<<< error", error);
        res.status(500).json({ error: { message: error.message } }).end();
    };
};