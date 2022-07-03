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
const Customer = require('../models/customer');
const PackageGroupTestParameter = require('../models/packageGroupTestParameter');
const SampleReference = require('../models/sampleReference');
const SampleSampleCondition = require('../models/sampleSampleCondition');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const { populate } = require('../models/sampleParameter');
const { exportPdf, exportQuotation, currentDate, calVat, formatDigit } = require('../utils/exportUtils');
const { parseFloatNotNaN, parseIntNotNaN, genSampleNo, getUserLoginId, getUserLogin, isAdmin, toRomanNumbers, parseUserFullname, includeString } = require('../utils/appUtils');
const sample = require('../models/sample');
const config = require('../config');

exports.quotation = async (req, res, next) => {
    QuotationNumber.findOne({ quotationNumberId: req.params.quotationnumberid, deleted: false })
        .populate('quotationStatusRef')
        .populate({ path: 'customerRef', populate: [{ path: 'addressReceiptRef' }, { path: 'addressSendRef' }] })
        .exec()
        .then(quotationNumberDoc => {

            Quotation.findOne({ quotationNumberId: quotationNumberDoc.quotationNumberId, deleted: false })
                .populate('quotationTypeRef')
                .populate('quotationReturnRef')
                .populate('quotationSentRef')
                .populate('quotationPaymentRef')
                .exec()
                .then(quotationDoc => {

                    QuotationRemark.find({ quotationId: quotationDoc.quotationId })
                        .exec()
                        .then(quotationRemarkDocs => {

                            Sample.find({ quotationId: quotationDoc.quotationId, sampleParentId: null, deleted: false })
                                .sort('sampleId')
                                .populate('remarkRef')
                                .populate({ path: 'subsamples', populate: [{ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] }, { path: 'sampleStatusRef' }] })
                                .populate('quotationRef')
                                .populate('testingGroupRef')
                                .populate({ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }, { path: 'labRef' }] })
                                .populate('sampleStatusRef')
                                .exec()
                                .then(sampleDocs => {

                                    QuotationTransaction.findOne({ quotationNumberId: quotationNumberDoc.quotationNumberId })
                                        .exec()
                                        .then(quotationTransactionDoc => {
                                            res.status(200).json({
                                                data: {
                                                    quotationNumber: quotationNumberDoc,
                                                    quotation: quotationDoc,
                                                    quotationRemarks: quotationRemarkDocs,
                                                    samples: sampleDocs,
                                                    quotationTransaction: quotationTransactionDoc
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

                }).catch(error => {
                    res.status(500).json({ data: null, error: { message: error.message } }).end();
                });


        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });
};

exports.customers = async (req, res, next) => {

    const user = await getUserLogin(req);

    Customer.find({ deleted: false })
        .populate('customerTypeRef')
        .populate('addressSendRef')
        .populate('addressReceiptRef')
        .sort('customerCode')
        .exec()
        .then(docs => {
            res.status(200).json({ data: docs, message: 'success' }).end();
        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });

};

exports.quotationNumbers = async (req, res, next) => {
    const user = await getUserLogin(req);

    let filter = { deleted: false, quotationStatusId: { $in: [1, 2, 3, 4, 5, 6] } };
    if (!isAdmin(user)) {
        filter.userId = user._id;
    }

    QuotationNumber.find(filter)
        .sort({ 'created_at': 'desc' })
        .populate('quotationRef')
        .populate('quotationStatusRef')
        .populate('customerRef')
        .populate({ path: 'quotationRef', match: { deleted: false }, populate: [{ path: 'sampleRef', populate: [{ path: 'subsamples' }] }] })
        .exec()
        .then(docs => {
            res.status(200).json({ data: docs, message: 'success' }).end();
        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });
};

exports.deleteQuotation = async (req, res, next) => {
    try {
        const userId = await getUserLoginId(req);

        QuotationNumber.findOneAndUpdate({ quotationNumberId: req.params.quotationnumberid }, { deleted: true, userId }, { new: true }, function (error, doc) {
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

exports.sampleParameters = async (req, res, next) => {

    PackageGroupTestParameter.find({ packageId: req.body.packageId })
        .populate({ path: 'packageGroupRef', populate: { path: 'checkingGroupRef' } })
        .populate({ path: 'testParameterRef', populate: [{ path: 'labRef' }, { path: 'testingGroupRef' }] })
        .exec()
        .then(docs => {

            const filtered = docs.filter(item => {
                if (req.body.testingType) {
                    if (!item.packageGroupRef || !item.packageGroupRef.testingType) {
                        return false;
                    }
                    return includeString(item.packageGroupRef.testingType, req.body.testingType)
                }
                return true;
            });

            const arr = filtered.map(item => {
                let newItem = {
                    testParameterRef: item.testParameterRef,
                    packageGroupRef: item.packageGroupRef
                };
                return newItem;
            });

            res.status(200).json({ data: arr, message: 'success' }).end();
        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });
}

genQuotationNumber = (userType, quotationNumberId) => {
    const prefix = parseIntNotNaN(userType) === 1 ? 'F' : 'E';
    const id = parseIntNotNaN(quotationNumberId) || 0;

    if (id > 99) {
        return prefix + id;
    } else if (id > 9) {
        return prefix + '0' + id;
    } else if (id > 0) {
        return prefix + '00' + id;
    }

    return '';
}



exports.getQuotationStep1 = async (req, res, next) => {
    QuotationNumber.findOne({ quotationNumberId: req.params.quotationnumberid, deleted: false })
        .populate('quotationStatusRef')
        .populate({ path: 'customerRef', populate: [{ path: 'addressReceiptRef' }, { path: 'addressSendRef' }, { path: 'customerTypeRef' }, { path: 'userRef' }] })
        .populate('userRef')
        .exec()
        .then(quotationNumberDoc => {

            Quotation.findOne({ quotationNumberId: quotationNumberDoc.quotationNumberId, deleted: false })
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

            Quotation.findOne({ quotationNumberId: quotationNumberDoc.quotationNumberId, deleted: false })
                .populate('quotationTypeRef')
                .populate('quotationReturnRef')
                .populate('quotationSentRef')
                .populate('quotationPaymentRef')
                .exec()
                .then(quotationDoc => {

                    QuotationRemark.find({ quotationId: quotationDoc.quotationId })
                        .exec()
                        .then(quotationRemarkDocs => {

                            Sample.find({ quotationId: quotationDoc.quotationId, sampleParentId: null, deleted: false })
                                .sort('sampleId')
                                .populate('remarkRef')
                                .populate({
                                    path: 'subsamples', populate: [
                                        { path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] }, { path: 'sampleStatusRef' },
                                        { path: 'references', populate: [{ path: 'sampleRef' }, { path: 'referenceRef' }] },
                                        { path: 'conditions', populate: { path: 'sampleConditionRef' } },
                                    ]
                                })
                                .populate('quotationRef')
                                .populate('testingGroupRef')
                                .populate({ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }, { path: 'labRef' }] })
                                .populate('sampleStatusRef')
                                .populate({ path: 'references', populate: [{ path: 'sampleRef' }, { path: 'referenceRef' }] })
                                .populate({ path: 'conditions', populate: { path: 'sampleConditionRef' } })
                                .exec()
                                .then(sampleDocs => {

                                    const sampleArr = sampleDocs.map(item => {
                                        let newSample = { ...item._doc };

                                        newSample.remarkRef = item.remarkRef;
                                        newSample.subsamples = item.subsamples;
                                        newSample.quotationRef = item.quotationRef;
                                        newSample.testingGroupRef = item.testingGroupRef;
                                        newSample.parameters = item.parameters;
                                        newSample.sampleStatusRef = item.sampleStatusRef;

                                        //set references
                                        const references = item.references || [];
                                        newSample.references = references.map(item => {
                                            return { ...item.referenceRef._doc, no: item.no };
                                        });

                                        //set conditions
                                        const conditions = item.conditions || [];
                                        newSample.conditions = conditions.map(item => {
                                            return item.sampleConditionRef._doc;
                                        });

                                        //set sub samples
                                        let subitems = item.subsamples || [];
                                        for (let i = 0; i < subitems.length; i++) {
                                            subitem = subitems[i];

                                            //set sub references
                                            const subreferences = subitem.references || [];
                                            subitem.references = subreferences.map(item => {
                                                return { ...item.referenceRef._doc, no: item.no };
                                            });

                                            //set sub conditions
                                            const subconditions = subitem.conditions || [];
                                            subitem.conditions = subconditions.map(item => {
                                                return item.sampleConditionRef._doc;
                                            });
                                        }

                                        return newSample;
                                    });

                                    res.status(200).json({
                                        data: {
                                            quotationNumber: quotationNumberDoc,
                                            quotation: quotationDoc,
                                            quotationRemarks: quotationRemarkDocs,
                                            samples: sampleArr,
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

            Quotation.findOne({ quotationNumberId: quotationNumberDoc.quotationNumberId, deleted: false })
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

validateAddStep1 = data => {
    return data.customerId ? true : false;
}

exports.addStep1 = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    const user = await getUserLogin(req);
    const userId = user._id;

    //-- create quotation number
    let quotationNumberData = {
        quotationNumber,
        quotationStatusId,
        customerId,
        userType,
    } = req.body;

    quotationNumberData.created_at = new Date();
    quotationNumberData.userId = userId;

    quotationNumberData.quotationStatusId = quotationNumberData.customerId ? 2 : 1;

    if (!validateAddStep1(req.body)) {
        return res.status(400).json({ data: req.body, error: { message: 'parameter must not be empty' } });
    }

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
            const newNumber = genQuotationNumber(user.customerTypeId, quotationNumberModel.quotationNumberId);

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
                            };

                            const quotationTransaction = new QuotationTransaction(quotationTransactionData);
                            await quotationTransaction.save();

                            //-- create quotation transaction : create customer
                            const quotationTransactionData2 = {
                                quotationNumberId: doc.quotationNumberId,
                                quotationStatusId: 2,
                                created_at: new Date(),
                                userId,
                            };

                            const quotationTransaction2 = new QuotationTransaction(quotationTransactionData2);
                            await quotationTransaction2.save(function (error) {
                                if (error) {
                                    res.status(500).json({ data: model, error: { message: error.message } }).end();
                                } else {
                                    res.status(200).json({ data: { quotationNumberId: doc.quotationNumberId, quotationNumber: doc.quotationNumber, quotationId: quotationModel.quotationId }, message: 'success' }).end();
                                }
                            });

                        }
                    });

                }
            });
        }
    });

}

validateUpdateStep1 = data => {
    return data.quotationNumberId && data.quotationId && data.quotationStatusId && data.customerId && data.userType;
}

exports.updateStep1 = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    const userId = await getUserLoginId(req);

    //-- update quotation number
    const quotationNumberData = {
        quotationNumberId,
        quotationStatusId,
        customerId,
        userType
    } = req.body;

    quotationNumberData.userId = userId;
    quotationNumberData.quotationStatusId = quotationNumberData.customerId ? 2 : 1;

    if (!validateUpdateStep1(req.body)) {
        return res.status(400).json({ data: req.body, error: { message: 'parameter must not be empty' } });
    }

    QuotationNumber.findOneAndUpdate({ quotationNumberId: req.body.quotationNumberId }, quotationNumberData, { new: true }, async function (error, quotationNumberDoc) {
        if (error) {
            res.status(500).json({ data: req.body, error: { message: error.message } }).end();
        } else {

            //-- update quotation
            Quotation.findOne({ quotationId: req.body.quotationId, deleted: false }, function (err, quotationDoc) {
                if (error) {
                    res.status(500).json({ data: req.body, error: { message: error.message } }).end();
                } else {

                    Quotation.findOneAndUpdate({ quotationId: req.body.quotationId, deleted: false }, { updated_at: new Date() }, { new: true }, async function (error, quotationDoc) {
                        if (error) {
                            res.status(500).json({ data: req.body, error: { message: error.message } }).end();
                        } else {

                            //-- create quotation transaction
                            const quotationTransactionData = {
                                quotationNumberId,
                                quotationStatusId: quotationNumberData.quotationStatusId,
                                created_at: new Date(),
                                userId,
                            };

                            const quotationTransaction = new QuotationTransaction(quotationTransactionData);
                            await quotationTransaction.save(function (error) {
                                if (error) {
                                    return res.status(500).json({ error: { message: error.message } }).end();
                                } else {
                                    res.status(200).json({ data: { quotationNumber: quotationNumberDoc, quotaion: quotationDoc }, message: 'success' }).end();
                                }
                            });

                            //-- update quotaion transaction
                            /* QuotationTransaction.findOneAndUpdate({ quotationNumberId }, { quotationStatusId: quotationNumberData.quotationStatusId }, { new: true }, function (error, doc) {
                                if (error) {
                                    return res.status(500).json({ error: { message: error.message } }).end();
                                } else {
                                    res.status(200).json({ data: { quotationNumber: quotationNumberDoc, quotaion: quotationDoc }, message: 'success' }).end();
                                }
                            }); */
                        }
                    });

                }
            });

        }
    });
}

validateStep2 = data => {
    return data.quotationId && data.quotationNumberId;
}

createNewVersionData = async (quotationId, samples, userId) => {
    let newQuotationId = '';

    try {

        //get current version : quotation
        const currentQuotation = await Quotation.findOne({ quotationId, deleted: false });

        //create new version : quotation
        let quotationData = {
            quotationRevision: (parseInt(currentQuotation.quotationRevision) || 0) + 1,
            quotationIssueDate: currentQuotation.quotationIssueDate,
            quotationDescription: currentQuotation.quotationDescription,
            quotationTotal: currentQuotation.quotationTotal,
            quotationPercentDiscount: currentQuotation.quotationPercentDiscount,
            quotationDiscount: currentQuotation.quotationDiscount,
            quotationPackingFee: currentQuotation.quotationPackingFee,
            quotationSubTotal: currentQuotation.quotationSubTotal,
            quotationVat: currentQuotation.quotationVat,
            quotationGrandTotal: currentQuotation.quotationGrandTotal,

            quotationTypeId: currentQuotation.quotationTypeId,
            quotationNumberId: currentQuotation.quotationNumberId,
            quotationReturnId: currentQuotation.quotationReturnId,
            quotationSentId: currentQuotation.quotationSentId,
            quotationPaymentId: currentQuotation.quotationPaymentId,

            lang: currentQuotation.lang,
            updated_at: new Date(),

            userId: currentQuotation.userId,
        };

        const quotationModel = new Quotation(quotationData);
        await quotationModel.save();

        //delete old version : quotation
        await Quotation.findOneAndUpdate({ quotationId: currentQuotation.quotationId, deleted: false }, { deleted: true });

        /*   await Sample.find({ quotationId, deleted: false })
              .populate({ path: 'subsamples', populate: [{ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] }] })
              .populate({ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] })
              .exec(); */


        if (samples) {
            for (let i = 0; i < samples.length; i++) {
                const sample = samples[i];

                //create new version : sample
                const sampleData = {
                    quotationId: quotationModel.quotationId,

                    sampleNo: sample.sampleNo,
                    sampleArticleNo: sample.sampleArticleNo,
                    sampleName: sample.sampleName,
                    sampleDescription: sample.sampleDescription,
                    sampleDescriptionTH: sample.sampleDescriptionTH,
                    certification: sample.certification,
                    sampleBuyerUID: sample.sampleBuyerUID,
                    supplierCode: sample.supplierCode,
                    supplierName: sample.supplierName,
                    sampleQty: sample.sampleQty,
                    remarkId: sample.remarkId,
                    sampleParentId: sample.sampleParentId,
                    testingGroupId: sample.testingGroupId,
                    sampleStatusId: sample.sampleStatusId,

                    sampleConditionId: sample.sampleConditionId,
                    refrigeratorTemperature: sample.refrigeratorTemperature,
                    productTemperature: sample.productTemperature,
                    supplierCode: sample.supplierCode,
                    supplierName: sample.supplierName,
                    collectedFrom: sample.collectedFrom,
                    collectedBy: sample.collectedBy,
                    collectedDateTime: sample.collectedDateTime,
                    receivedDateTime: sample.receivedDateTime,
                    physicalProperty: sample.physicalProperty,
                    testDate: sample.testDate,
                    completionDate: sample.completionDate,
                    shelfLife: sample.shelfLife,
                    ARTNo: sample.ARTNo,
                    MFD: sample.MFD,
                    BBF: sample.BBF,
                    laboratoryName: sample.laboratoryName,

                    dueDate: sample.dueDate,
                    filePath: sample.filePath,
                };

                const sampleModel = new Sample(sampleData);
                await sampleModel.save();

                //delete old version : sample
                await Sample.findOneAndUpdate({ sampleId: sample.sampleId, deleted: false }, { deleted: true });

                //get current parameters
                const currentParameters = sample.parameters || [];

                //create new version parameters
                for (let j = 0; j < currentParameters.length; j++) {
                    const parameter = currentParameters[j];
                    const referenceIds = (parameter.referenceIds || []).join(',');

                    const parameterData = {
                        sampleId: sampleModel.sampleId,
                        parameterId: parameter.parameterRef.parameterId,
                        qty: parameter.qty,
                        price: parameter.price,
                        certified: parameter.certified,

                        result: parameter.result,
                        uncertainty: parameter.uncertainty,
                        value_display: parameter.value_display,

                        duedatein: parameter.duedatein,
                        duedateout: parameter.duedateout,

                        sampleParameterStatusId: parameter.sampleParameterStatusId,
                        labId: parameter.labId,

                        referenceIds,
                    };

                    const parameterModel = new SampleParameter(parameterData);
                    await parameterModel.save();

                    //delete old version : parameter
                    await SampleParameter.findOneAndUpdate({ parameterId: parameter.parameterId, deleted: false }, { deleted: true });

                    //create sample parameter transaction
                    let sampleParameterTransactionData = {
                        sampleParameterStatusId: 1,
                        sampleParameterId: parameterModel.sampleParameterId,
                        userId,
                        created_at: new Date(),
                    }
                    const sampleParameterTransaction = new SampleParameterTransaction(sampleParameterTransactionData);
                    await sampleParameterTransaction.save();

                }

                //-- clear sample references
                await SampleReference.deleteMany({ sampleId: sample.sampleId });

                //-- create sample references
                const references = sample.references || [];
                for (let j = 0; j < references.length; j++) {
                    const sampleReferenceData = {
                        sampleId,
                        referenceId: references[j].referenceId,
                        no: (j + 1),
                    };

                    const sampleReference = new SampleReference(sampleReferenceData);
                    await sampleReference.save();
                }

                //-- clear sample conditions
                await SampleSampleCondition.deleteMany({ sampleId: sample.sampleId });

                //-- create sample sample conditions
                const conditions = sample.conditions || [];
                for (let j = 0; j < conditions.length; j++) {
                    const sampleSampleConditionData = {
                        sampleId,
                        sampleConditionId: conditions[j].sampleConditionId,
                    };

                    const sampleSampleCondition = new SampleSampleCondition(sampleSampleConditionData);
                    await sampleSampleCondition.save();
                }

                //get current sub samples
                const currentSubsamples = sample.subsamples || [];

                for (let j = 0; j < currentSubsamples.length; j++) {
                    const subsample = currentSubsamples[j];

                    //create new version : subsample
                    const subsampleData = {
                        sampleParentId: sampleModel.sampleId,
                        quotationId: quotationModel.quotationId,

                        sampleNo: subsample.sampleNo,
                        sampleArticleNo: subsample.sampleArticleNo,
                        sampleName: subsample.sampleName,
                        sampleDescription: subsample.sampleDescription,
                        sampleDescriptionTH: subsample.sampleDescriptionTH,
                        certification: subsample.certification,
                        sampleBuyerUID: subsample.sampleBuyerUID,
                        supplierCode: subsample.supplierCode,
                        supplierName: subsample.supplierName,
                        sampleQty: subsample.sampleQty,
                        remarkId: subsample.remarkId,
                        testingGroupId: subsample.testingGroupId,
                        sampleStatusId: subsample.sampleStatusId,

                        sampleConditionId: subsample.sampleConditionId,
                        refrigeratorTemperature: subsample.refrigeratorTemperature,
                        productTemperature: subsample.productTemperature,
                        supplierCode: subsample.supplierCode,
                        supplierName: subsample.supplierName,
                        collectedFrom: subsample.collectedFrom,
                        collectedBy: subsample.collectedBy,
                        collectedDateTime: subsample.collectedDateTime,
                        receivedDateTime: subsample.receivedDateTime,
                        physicalProperty: subsample.physicalProperty,
                        testDate: subsample.testDate,
                        completionDate: subsample.completionDate,
                        shelfLife: subsample.shelfLife,
                        ARTNo: subsample.ARTNo,
                        MFD: subsample.MFD,
                        BBF: subsample.BBF,
                        laboratoryName: subsample.laboratoryName,

                        dueDate: subsample.dueDate,
                        filePath: subsample.filePath,
                    };

                    const subsampleModel = new Sample(subsampleData);
                    await subsampleModel.save();

                    //delete old version : subsample
                    await Sample.findOneAndUpdate({ sampleId: subsample.sampleId, deleted: false }, { deleted: true });

                    //get current sub parameters
                    const subparameters = subsample.parameters;

                    if (subparameters) {
                        for (let m = 0; m < subparameters.length; m++) {
                            const subparameter = subparameters[m];
                            const referenceIds = (subparameter.referenceIds || []).join(',');

                            const subparameterData = {
                                sampleId: subsampleModel.sampleId,
                                parameterId: subparameter.parameterRef.parameterId,
                                qty: subparameter.qty,
                                price: subparameter.price,
                                certified: subparameter.certified,

                                result: subparameter.result,
                                uncertainty: subparameter.uncertainty,
                                value_display: subparameter.value_display,

                                duedatein: subparameter.duedatein,
                                duedateout: subparameter.duedateout,

                                sampleParameterStatusId: subparameter.sampleParameterStatusId,
                                labId: subparameter.labId,

                                referenceIds,
                            };

                            const subparameterModel = new SampleParameter(subparameterData);
                            await subparameterModel.save();

                            //delete old version : parameter
                            await SampleParameter.findOneAndUpdate({ parameterId: subparameterModel.parameterId, deleted: false }, { deleted: true });

                            //create sample parameter transacction
                            let sampleParameterTransactionData = {
                                sampleParameterStatusId: 1,
                                sampleParameterId: subparameterModel.sampleParameterId,
                                userId,
                                created_at: new Date(),
                            }
                            const sampleParameterTransaction = new SampleParameterTransaction(sampleParameterTransactionData);
                            await sampleParameterTransaction.save();
                        }
                    }
                }

                //-- clear sample references
                await SampleReference.deleteMany({ sampleId: subsample.sampleId });

                //-- create sub sample references
                const subreferences = subsample.references || [];
                for (let k = 0; k < subreferences.length; k++) {
                    const sampleReferenceData = {
                        sampleId: subsampleDoc.sampleId,
                        referenceId: subreferences[k].referenceId,
                        no: (k + 1),
                    };

                    const sampleReference = new SampleReference(sampleReferenceData);
                    await sampleReference.save();
                }

                //-- clear sample conditions
                await SampleSampleCondition.deleteMany({ sampleId: subsample.sampleId });

                //-- create sub sample sample conditions
                const subconditions = subsample.conditions || [];
                for (let k = 0; k < subconditions.length; k++) {
                    const sampleSampleConditionData = {
                        sampleId: subsampleDoc.sampleId,
                        sampleConditionId: subconditions[k].sampleConditionId,
                    };

                    const sampleSampleCondition = new SampleSampleCondition(sampleSampleConditionData);
                    await sampleSampleCondition.save();
                }

            }
        }

        //get current version : quotation remarks
        const currentQuotationRemarks = await QuotationRemark.find({ quotationId: quotationModel.quotationId });

        for (let i = 0; i < currentQuotationRemarks.length; i++) {
            const quotationRemark = currentQuotationRemarks[i];

            const quotationRemarkData = {
                quotationId: quotationModel.quotationId,
                remarkId: quotationRemark.remarkId,
                quotationRemarkSort: quotationRemark.quotationRemarkSort,
                quotationRemarkType: quotationRemark.quotationRemarkType,
            };

            const quotationRemarkModel = new quotationRemarkModel(quotationRemarkData);
            await quotationRemarkModel.save();
        }

        //calculate total
        if (quotationModel.quotationTypeId) {
            const total = await calTotal(quotationModel.quotationId);
            const vat = calVat(total, 7);

            const quotationTotalData = {
                quotationTotal: total.toFixed(2),
                quotationSubTotal: (parseFloatNotNaN(quotationModel.quotationDiscount) + parseFloatNotNaN(quotationModel.quotationPackingFee)).toFixed(2),
                quotationVat: vat.toFixed(2),
                quotationGrandTotal: (total + vat).toFixed(2),
                updated_at: new Date()
            }

            await Quotation.findOneAndUpdate({ quotationId: quotationModel.quotationId, deleted: false }, quotationTotalData);
        }

        //create quotation transaction 
        const quotationNumberModel = await QuotationNumber.findOne({ quotationNumberId: quotationModel.quotationNumberId });

        const quotationTransactionData = {
            quotationNumberId: quotationModel.quotationNumberId,
            quotationStatusId: quotationNumberModel.quotationStatusId,
            created_at: new Date(),
            userId,
        };

        const quotationTransaction = new QuotationTransaction(quotationTransactionData);
        await quotationTransaction.save();

        newQuotationId = quotationModel.quotationId;

    } catch (error) {
        console.log(error);
    }

    return newQuotationId;
}

isDisapproveFromLab = samples => {
    if (samples) {
        for (let i = 0; i < samples.length; i++) {
            if (samples[i].sampleStatusId === 3) {
                return true;
            }

            const subsamples = samples[i].subsamples;

            if (subsamples) {
                for (let j = 0; j < subsamples.length; j++) {
                    if (subsamples[j].sampleStatusId === 3) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

const getUploadFileByRef = (uploadRef, uploadFiles) => {
    for (let i = 0; i < uploadFiles.length; i++) {
        if (uploadFiles[i].fieldname === uploadRef) {
            return uploadFiles[i];
        }
    }

    return null;
}

const createFilePath = (uploadRef, uploadFiles) => {
    if (uploadRef && uploadFiles) {
        const file = getUploadFileByRef(uploadRef, uploadFiles);
        return file ? config.SAMPLE_UPLOAD_DIR + file.filename : null;
    }
    return null;
}

exports.step2 = async (req, res, next) => {
    /* if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    } */

    if (!validateStep2(req.body)) {
        return res.status(400).json({ error: { message: 'parameter must not be empty' } });
    }

    const userId = await getUserLoginId(req);

    const quotationNumberId = req.body.quotationNumberId;
    let quotationId = req.body.quotationId;
    const samples = req.body.samples ? JSON.parse(req.body.samples) : [];
    let quotationStatusId = req.body.quotationStatusId || 2;

    //already sent to lab
    if (isDisapproveFromLab(samples)) {
        quotationId = await createNewVersionData(quotationId, samples, userId);
        return res.status(200).json({ data: req.body, message: 'success' }).end();
    }

    //-- clear sample parameters
    const vSamples = await Sample.find({ quotationId, deleted: false });
    for (let i = 0; i < vSamples.length; i++) {
        const sampleId = vSamples[i].sampleId;
        const vSampleParameters = await SampleParameter.find({ sampleId });

        //-- clear sample parameter transactions
        for (let j = 0; j < vSampleParameters.length; j++) {
            await SampleParameterTransaction.deleteMany({ sampleParameterId: vSampleParameters[j].sampleParameterId });
        }

        await SampleParameter.deleteMany({ sampleId: sampleId });

        //-- clear sample references
        await SampleReference.deleteMany({ sampleId });

        //-- clear sample conditions
        await SampleSampleCondition.deleteMany({ sampleId });

        //-- clear sub samples
        const vSubsamples = await Sample.find({ sampleParentId: sampleId, deleted: false });
        for (let j = 0; j < vSubsamples.length; j++) {
            const subsampleId = vSubsamples[j].sampleId;
            const vSubsampleParameters = await SampleParameter.find({ subsampleId });

            //-- clear sub sample parameter transactions
            for (let k = 0; k < vSubsampleParameters.length; k++) {
                await SampleParameterTransaction.deleteMany({ sampleParameterId: vSubsampleParameters[k].sampleParameterId });
            }

            await SampleParameter.deleteMany({ sampleId: subsampleId });

            //-- clear sample conditions
            await SampleSampleCondition.deleteMany({ sampleId: subsampleId });
        }
    }

    //-- clear samples
    await Sample.deleteMany({ quotationId, deleted: false });

    if (samples && samples.length > 0) {

        if (quotationStatusId < 3) {
            quotationStatusId = 3;
        }

        //-- create samples
        for (let i = 0; i < samples.length; i++) {

            let sampleData = {
                quotationId,
                sampleName: samples[i].sampleName,
                sampleDescription: samples[i].sampleDescription,
                sampleDescriptionTH: samples[i].sampleDescriptionTH,
                sampleQty: samples[i].sampleQty,
                testingGroupId: samples[i].testingGroupId,
                sampleParentId: samples[i].sampleParentId,
                sampleStatusId: samples[i].sampleStatusId,

                sampleConditionId: samples[i].sampleConditionId,
                refrigeratorTemperature: samples[i].refrigeratorTemperature,
                productTemperature: samples[i].productTemperature,
                supplierCode: samples[i].supplierCode,
                supplierName: samples[i].supplierName,
                collectedFrom: samples[i].collectedFrom,
                collectedBy: samples[i].collectedBy,
                collectedDateTime: samples[i].collectedDateTime,
                receivedDateTime: samples[i].receivedDateTime,
                physicalProperty: samples[i].physicalProperty,
                testDate: samples[i].testDate,
                completionDate: samples[i].completionDate,
                shelfLife: samples[i].shelfLife,
                ARTNo: samples[i].ARTNo,
                MFD: samples[i].MFD,
                BBF: samples[i].BBF,
                laboratoryName: samples[i].laboratoryName,

                dueDate: samples[i].dueDate,
                filePath: samples[i].uploadRef ? createFilePath(samples[i].uploadRef, req.files) : samples[i].filePath,
            };

            const sampleId = samples[i].sampleId;
            if (sampleId) {
                sampleData.sampleId = sampleId;
            }

            const sampleModel = new Sample(sampleData);

            validateErrors = sampleModel.validateSync();
            if (validateErrors) {
                return res.status(400).json({ error: { message: validateErrors.message } });
            }

            const sampleDoc = await sampleModel.save();
            await sampleDoc.populate('testingGroupRef');
            await sampleDoc.execPopulate();

            //update sampleNo
            const sampleNo = genSampleNo(sampleDoc.testingGroupRef ? sampleDoc.testingGroupRef.code : '', sampleDoc.sampleId);
            await Sample.findOneAndUpdate({ sampleId: sampleDoc.sampleId, deleted: false }, { sampleNo })


            //-- create sample parameters
            const sampleParameters = samples[i].parameters || [];

            for (let j = 0; j < sampleParameters.length; j++) {
                const sp = sampleParameters[j];
                const referenceIds = (sampleParameters[j].referenceIds || []).join(',');

                let sampleParameterData = {
                    sampleId: sampleDoc.sampleId,
                    parameterId: sp.parameterRef.parameterId,
                    qty: sp.qty,
                    price: sp.price,
                    certified: sp.certified,
                    sampleParameterStatusId: 1,
                    referenceIds,
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

            //-- create sample references
            const references = samples[i].references || [];
            for (let j = 0; j < references.length; j++) {
                const sampleReferenceData = {
                    sampleId: sampleDoc.sampleId,
                    referenceId: references[j].referenceId,
                    no: (j + 1),
                };

                const sampleReference = new SampleReference(sampleReferenceData);
                await sampleReference.save();
            }

            //-- create sample sample conditions
            const conditions = samples[i].conditions || [];
            for (let j = 0; j < conditions.length; j++) {
                const sampleSampleConditionData = {
                    sampleId: sampleDoc.sampleId,
                    sampleConditionId: conditions[j].sampleConditionId,
                };

                const sampleSampleCondition = new SampleSampleCondition(sampleSampleConditionData);
                await sampleSampleCondition.save();
            }

            //-- create sub sample
            const subsamples = samples[i].subsamples || [];

            if (subsamples) {
                for (let j = 0; j < subsamples.length; j++) {

                    let subsampleData = {
                        quotationId,
                        sampleName: subsamples[j].sampleName,
                        sampleDescription: subsamples[j].sampleDescription,
                        sampleDescriptionTH: subsamples[j].sampleDescriptionTH,
                        sampleQty: subsamples[j].sampleQty,
                        testingGroupId: subsamples[j].testingGroupId,
                        sampleParentId: sampleDoc.sampleId,
                        sampleStatusId: subsamples[j].sampleStatusId,

                        sampleConditionId: subsamples[j].sampleConditionId,
                        refrigeratorTemperature: subsamples[j].refrigeratorTemperature,
                        productTemperature: subsamples[j].productTemperature,
                        supplierCode: subsamples[j].supplierCode,
                        supplierName: subsamples[j].supplierName,
                        collectedFrom: subsamples[j].collectedFrom,
                        collectedBy: subsamples[j].collectedBy,
                        collectedDateTime: subsamples[j].collectedDateTime,
                        receivedDateTime: subsamples[j].receivedDateTime,
                        physicalProperty: subsamples[j].physicalProperty,
                        testDate: subsamples[j].testDate,
                        completionDate: subsamples[j].completionDate,
                        shelfLife: subsamples[j].shelfLife,
                        ARTNo: subsamples[j].ARTNo,
                        MFD: subsamples[j].MFD,
                        BBF: subsamples[j].BBF,
                        laboratoryName: subsamples[j].laboratoryName,

                        dueDate: subsamples[j].dueDate,
                        filePath: subsamples[j].uploadRef ? createFilePath(subsamples[j].uploadRef, req.files) : subsamples[j].filePath,
                    };

                    const subsampleId = subsamples[j].sampleId;
                    if (subsampleId) {
                        subsampleData.sampleId = subsampleId;
                    }

                    const subsampleModel = new Sample(subsampleData);

                    validateErrors = subsampleModel.validateSync();
                    if (validateErrors) {
                        return res.status(400).json({ error: { message: validateErrors.message } });
                    }

                    const subsampleDoc = await subsampleModel.save();
                    await subsampleDoc.populate('testingGroupRef');
                    await subsampleDoc.execPopulate();

                    //update subsampleNo
                    const subsampleNo = genSampleNo(subsampleDoc.testingGroupRef ? subsampleDoc.testingGroupRef.code : '', subsampleDoc.sampleId);
                    await Sample.findOneAndUpdate({ sampleId: subsampleDoc.sampleId, deleted: false }, { sampleNo: subsampleNo })


                    //-- create sub sample parameters
                    const subsampleParameters = subsamples[j].parameters || [];

                    for (let k = 0; k < subsampleParameters.length; k++) {
                        const ssp = subsampleParameters[k];
                        const referenceIds = (subsampleParameters[k].referenceIds || []).join(',');

                        let subsampleParameterData = {
                            sampleId: subsampleDoc.sampleId,
                            parameterId: ssp.parameterRef.parameterId,
                            qty: ssp.qty,
                            price: ssp.price,
                            certified: ssp.certified,
                            sampleParameterStatusId: 1,
                            referenceIds,
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

                    //-- create sub sample references
                    const subreferences = subsamples[j].references || [];
                    for (let k = 0; k < subreferences.length; k++) {
                        const sampleReferenceData = {
                            sampleId: subsampleDoc.sampleId,
                            referenceId: subreferences[k].referenceId,
                            no: (k + 1),
                        };

                        const sampleReference = new SampleReference(sampleReferenceData);
                        await sampleReference.save();
                    }

                    //-- create sub sample sample conditions
                    const subconditions = subsamples[j].conditions || [];
                    for (let k = 0; k < subconditions.length; k++) {
                        const sampleSampleConditionData = {
                            sampleId: subsampleDoc.sampleId,
                            sampleConditionId: subconditions[k].sampleConditionId,
                        };

                        const sampleSampleCondition = new SampleSampleCondition(sampleSampleConditionData);
                        await sampleSampleCondition.save();
                    }

                }
            }

        }

    }

    //calculate total
    const q = await Quotation.findOne({ quotationId, deleted: false });

    if (q.quotationTypeId) {
        const total = await calTotal(quotationId);
        const vat = calVat(total, 7);

        const quotationData = {
            quotationTotal: total.toFixed(2),
            quotationSubTotal: (parseFloatNotNaN(q.quotationDiscount) + parseFloatNotNaN(q.quotationPackingFee)).toFixed(2),
            quotationVat: vat.toFixed(2),
            quotationGrandTotal: (total + vat).toFixed(2),
            updated_at: new Date(),
        }

        await Quotation.findOneAndUpdate({ quotationId, deleted: false }, quotationData);
    }

    //-- update quotaion status
    await QuotationNumber.findOneAndUpdate({ quotationNumberId }, { quotationStatusId, userId }, { new: true }, async function (error, doc) {
        if (error) {
            return res.status(500).json({ error: { message: error.message } }).end();
        } else {

            //-- update quotation
            await Quotation.findOneAndUpdate({ quotationId, deleted: false }, { updated_at: new Date() });

            //-- create quotation transaction
            const quotationTransactionData = {
                quotationNumberId,
                quotationStatusId,
                created_at: new Date(),
                userId,
            };

            const quotationTransaction = new QuotationTransaction(quotationTransactionData);
            await quotationTransaction.save(function (error) {
                if (error) {
                    res.status(500).json({ error: { message: error.message } }).end();
                } else {
                    res.status(200).json({ data: req.body, message: 'success' }).end();
                }
            });

            //-- update quotaion transaction
            /* QuotationTransaction.findOneAndUpdate({ quotationNumberId }, { quotationStatusId }, { new: true }, function (error, doc) {
                if (error) {
                    return res.status(500).json({ error: { message: error.message } }).end();
                } else {
                    res.status(200).json({ data: req.body, message: 'success' }).end();
                }
            }); */
        }
    });

}

validateStep3 = (data) => {
    return data.quotationId && data.quotationNumberId;
}

calTotal = async (quotationId) => {
    let total = 0;

    await Sample.find({ quotationId, sampleParentId: null, deleted: false })
        .populate({ path: 'subsamples', populate: [{ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] }] })
        .populate({ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] })
        .exec()
        .then(async (sampleDocs) => {

            for (let s = 0; s < sampleDocs.length; s++) {
                //parameter
                const parameters = sampleDocs[s].parameters;

                if (parameters) {
                    for (let i = 0; i < parameters.length; i++) {
                        total += (parameters[i].qty || 0) * (parameters[i].price || 0);
                    }
                }

                //sub parameter
                const subsamples = sampleDocs[s].subsamples;

                if (subsamples) {
                    for (let i = 0; i < subsamples.length; i++) {
                        const subparameters = subsamples[i].parameters;

                        if (subparameters) {
                            for (let j = 0; j < subparameters.length; j++) {
                                total += ((subparameters[j].qty || 0) * (subparameters[j].price || 0));
                            }
                        }

                    }
                }
            }

        })
        .catch(error => {
            console.log("error", error);
            return 0;
        });

    return total;
}

exports.step3 = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    if (!validateStep3(req.body)) {
        return res.status(400).json({ data: req.body, error: { message: 'parameter must not be empty' } });
    }

    const userId = await getUserLoginId(req);

    //-- update quotation
    let quotationData = {
        quotationId,
        quotationReturnId,
        quotationSentId,
        quotationPaymentId,
        quotationTypeId,
        quotationRevision,
        quotationTotal,
        quotationDiscount,
        quotationPackingFee,
        quotationSubTotal,
        quotationVat,
        quotationGrandTotal,
        lang,
    } = req.body;

    //calculate total
    const total = await calTotal(req.body.quotationId);
    const vat = calVat(total, 7);

    quotationData.quotationTotal = total.toFixed(2);
    quotationData.quotationSubTotal = (parseFloatNotNaN(quotationData.quotationDiscount) + parseFloatNotNaN(quotationData.quotationPackingFee)).toFixed(2);
    quotationData.quotationVat = vat.toFixed(2);
    quotationData.quotationGrandTotal = (total + vat).toFixed(2);
    quotationData.updated_at = new Date();

    Quotation.findOneAndUpdate({ quotationId: req.body.quotationId, deleted: false }, quotationData, { new: true }, async function (error, doc) {
        if (error) {
            res.status(500).json({ data: req.body, error: { message: error.message } }).end();
        } else {

            //-- clear quotaion remark
            await QuotationRemark.deleteMany({ quotationId: req.body.quotationId });

            //-- create quotation remark
            const quotationRemarks = req.body.quotationRemarks;

            if (quotationRemarks) {
                for (let i = 0; i < quotationRemarks.length; i++) {
                    const quotationRemarkData = {
                        quotationId: quotationData.quotationId,
                        quotationRemarkSort: quotationRemarks[i].quotationRemarkSort,
                        quotationRemarkType: quotationRemarks[i].quotationRemarkType,
                        remarkId: quotationRemarks[i].remarkId
                    };

                    const quotationRemarkModel = new QuotationRemark(quotationRemarkData);
                    await quotationRemarkModel.save();
                }
            }

            //-- create quotation transaction
            const quotationTransactionData = {
                quotationNumberId: req.body.quotationNumberId,
                quotationStatusId: 3,
                created_at: new Date(),
                userId,
            };

            const quotationTransaction = new QuotationTransaction(quotationTransactionData);
            await quotationTransaction.save(function (error) {
                if (error) {
                    res.status(500).json({ error: { message: error.message } }).end();
                } else {
                    res.status(200).json({ data: req.body, message: 'success' }).end();
                }
            });

            //-- update quotaion transaction
            /*  QuotationTransaction.findOneAndUpdate({ quotationNumberId: req.body.quotationNumberId }, { quotationStatusId: 3 }, { new: true }, function (error, doc) {
                 if (error) {
                     res.status(500).json({ data: req.body, error: { message: error.message } }).end();
                 } else {
                     res.status(200).json({ data: req.body, message: 'success' }).end();
                 }
             }); */

        }
    });
}

validateUpdateQuotationStatus = (data) => {
    return data.quotationNumberId && data.quotationStatusId;
}

exports.updateQuotationStatus = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    if (!validateUpdateQuotationStatus(req.body)) {
        return res.status(400).json({ data: req.body, error: { message: 'parameter must not be empty' } }).end();
    }

    const userId = await getUserLoginId(req);

    try {

        const quotationNumber = await QuotationNumber.findOneAndUpdate({ quotationNumberId: req.body.quotationNumberId, deleted: false }, { quotationStatusId: req.body.quotationStatusId, updated_at: new Date() });

        //-- create quotation transaction
        const quotationTransactionData = {
            quotationNumberId: req.body.quotationNumberId,
            quotationStatusId: req.body.quotationStatusId,
            created_at: new Date(),
            userId,
        };

        const quotationTransaction = new QuotationTransaction(quotationTransactionData);
        await quotationTransaction.save();

        res.status(200).json({ data: { quotationNumber }, message: 'success' }).end();

    } catch (error) {
        return res.status(500).json({ data: req.body, error: { message: error.message } }).end();
    }
}

validateSendParameters = (data) => {
    return data.quotationId && data.quotationNumberId;
}

exports.sendParameters = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    if (!validateSendParameters(req.body)) {
        return res.status(400).json({ error: { message: 'parameter must not be empty' } });
    }

    const quotationNumberId = req.body.quotationNumberId;
    const quotationId = req.body.quotationId;
    const samples = req.body.samples;

    if (!samples || samples.length === 0) {
        return res.status(400).json({ error: { message: 'sample parameter must not be empty' } });
    }

    for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];

        const sp = await Sample.findOne({ sampleId: sample.sampleId, deleted: false })
            .sort('sampleId')
            .populate('remarkRef')
            .populate({ path: 'subsamples', populate: [{ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] }] })
            .populate('quotationRef')
            .populate('testingGroupRef')
            .populate({ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] });

        //update sample parameters labId
        const parameters = sample.parameters;

        if (parameters) {
            for (let j = 0; j < parameters.length; j++) {
                await SampleParameter.findOneAndUpdate({ sampleParameterId: parameters[j].sampleParameterId }, { labId: parameters[j].sendLabId, sampleParameterStatusId: 2 }, { new: true });
            }
        }

        //update sub sample parameters labId

        const ssps = sample.subsamples;

        if (ssps) {

            for (let k = 0; k < ssps.length; k++) {
                const subparameters = ssps[k].parameters;

                if (subparameters) {
                    for (let m = 0; m < subparameters.length; m++) {
                        await SampleParameter.findOneAndUpdate({ sampleParameterId: subparameters[m].sampleParameterId }, { labId: subparameters[m].sendLabId, sampleParameterStatusId: 2 }, { new: true });
                    }
                }
            }
        }

    }

    res.status(200).json({ data: {}, message: 'success' });

}

createCertified = (labId, certified) => {
    let cer = certified === 'yes' ? 'a' : '';
    if (labId === 10) {
        cer += cer ? ',' : '';
        cer += 'c';
    }
    return cer;
}

exports.createF1Datasource = (quotationNumber, quotation, quotationRemarks, samples) => {
    const isEN = quotation && quotation.lang === 'EN' ? true : false;
    let sampleArr = [];
    let total = 0;

    if (samples) {
        for (let i = 0; i < samples.length; i++) {
            const sample = samples[i];
            const parameters = sample.parameters;
            let parameterArr = [];

            for (let p = 0; p < parameters.length; p++) {
                const parameter = parameters[p];
                const price = parameter.price || 0;
                const qty = parameter.qty || 0;
                const amount = price * qty;
                total += amount;

                parameterArr.push({
                    no: (p + 1),
                    parameterName: parameter.parameterRef ? parameter.parameterRef.parameterNameEN : '',
                    certified: createCertified(parameter.parameterRef ? parameter.parameterRef.labId : '', parameter.certified),
                    standards: parameter.parameterRef ? parameter.parameterRef.standards : '',
                    lod: parameter.parameterRef ? parameter.parameterRef.lod || '' : '',
                    loq: parameter.parameterRef ? parameter.parameterRef.loq || '' : '',
                    unit: parameter.parameterRef ? parameter.parameterRef.unitEN : '',
                    price: price,
                    qty: qty,
                    amount: amount,
                });
            }

            sampleArr.push({
                sampleName: sample.testingGroupRef ? sample.testingGroupRef.name : '',
                sampleDescription: isEN ? sample.sampleDescription : sample.sampleDescriptionTH,
                parameters: parameterArr
            });

        }
    }

    let vat = calVat(total, 7);
    let grandTotal = total + vat;

    let remarkArr = [];
    let remarkArr2 = [];
    let remarkIndex = 0;
    let remarkIndex2 = 0;

    if (quotationRemarks) {
        for (let i = 0; i < quotationRemarks.length; i++) {
            const remark = quotationRemarks[i];

            if (remark.quotationRemarkType === 1) {
                remarkArr.push({
                    label: i === 0 ? 'Remark 1' : '',
                    no: ++remarkIndex,
                    detail: remark.remarkRef ? remark.remarkRef.remarkDetail : '',
                });
            } else {
                remarkArr2.push({
                    label: i === 0 ? 'Remark 2' : '',
                    no: ++remarkIndex2,
                    detail: remark.remarkRef ? remark.remarkRef.remarkDetail : '',
                });
            }
        }
    }

    return {
        customerName: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerNameEN : '',
        quotationNumber: quotationNumber ? quotationNumber.quotationNumber : '',
        userCoName: quotationNumber && parseUserFullname(quotationNumber.userRef),
        revision: quotation ? quotation.quotationRevision : '',
        address: quotationNumber && quotationNumber.customerRef && quotationNumber.customerRef.addressSendRef ? quotationNumber.customerRef.addressSendRef.addressAddrEN : '',
        issueDate: currentDate(),
        tel: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerTel : '',
        fax: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerFax : '',
        email: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerEmail : '',
        samples: sampleArr,
        remarks: remarkArr,
        remarks2: remarkArr2,
        total: total.toFixed(2),
        vat: vat.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
    };

}

generateF2Pages = (header, rows, summary, rowPerPage) => {
    let pages = [];
    let items = [];
    let pageCount = 0;

    for (let i = 0; i < rows.length; i++) {
        items.push({ ...rows[i] });

        if ((i > 0 && i % rowPerPage === 0) || i === rows.length - 1) {

            pages.push({
                pageNumber: (pageCount + 1),
                header,
                content: { items: [...items] },
                isFirstPage: pageCount === 0,
                isSummaryPage: (i === rows.length - 1),
            });

            //clear itemArr
            while (items.length > 0) {
                items.pop();
            }

            pageCount++;
        }
    }

    pages[pages.length - 1] = { ...pages[pages.length - 1], ...summary };

    return pages;
}

exports.createF2Datasource = (quotationNumber, quotation, quotationRemarks, samples) => {
    const isEN = quotation && quotation.lang === 'EN' ? true : false;
    const rowPerPage = 15;

    let typeOfSampleSet = new Set();
    let itemArr = [];
    let sampleArr = [];

    let typeOfSampleIndex = 0;
    let sampleDescriptionIndex = 0;
    let runningIndex = 0;

    let header = {
        customerName: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerNameEN : '',
        quotationNumber: quotationNumber ? quotationNumber.quotationNumber : '',
        userCoName: quotationNumber && parseUserFullname(quotationNumber.userRef),
        revision: quotation ? quotation.quotationRevision : '',
        address: quotationNumber && quotationNumber.customerRef && quotationNumber.customerRef.addressSendRef ? quotationNumber.customerRef.addressSendRef.addressAddrEN : '',
        issueDate: currentDate(),
        tel: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerTel : '',
        fax: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerFax : '',
        email: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerEmail : '',
    };

    let subTotal = 0;

    if (samples) {
        for (let i = 0; i < samples.length; i++) {
            const sample = samples[i];
            const parameters = sample.parameters;
            let parameterArr = [];

            itemArr.push({
                typeOfSamples: '',
                isTypeOfSamplesIndex: true,
            });

            typeOfSampleIndex = runningIndex;
            runningIndex++;

            //-- push Sample Description
            itemArr.push({
                sampleDescription: isEN ? sample.sampleDescription || '' : sample.sampleDescriptionTH || '',
                isSampleDescriptionIndex: true,
            });

            sampleDescriptionIndex = runningIndex;
            runningIndex++;

            //sub sample
            const subsamples = sample.subsamples || [];

            for (let j = 0; j < subsamples.length; j++) {
                const subsample = subsamples[j];

                //-- push Type of samples
                if (subsample.testingGroupRef && subsample.testingGroupRef.name) {
                    typeOfSampleSet.add(subsample.testingGroupRef.name);
                }

                const subparameters = subsamples[j].parameters || [];

                for (let p = 0; p < subparameters.length; p++) {
                    const parameter = subparameters[p];

                    const price = parameter.price || 0;
                    const qty = parameter.qty || 0;
                    const amount = price * qty;

                    subTotal += amount;

                    //-- push sub parameter
                    itemArr.push({
                        no: p === 0 ? (j + 1) : '',
                        isSubSampleNoIndex: j === 0,
                        parameterName: parameter.parameterRef ? parameter.parameterRef.parameterNameEN : '',
                        certified: createCertified(parameter.parameterRef ? parameter.parameterRef.labId : '', parameter.certified),
                        standards: parameter.parameterRef ? parameter.parameterRef.standards : '',
                        lod: parameter.parameterRef ? parameter.parameterRef.lod || '' : '',
                        loq: parameter.parameterRef ? parameter.parameterRef.loq || '' : '',
                        unit: parameter.parameterRef ? parameter.parameterRef.unitEN : '',
                        price: price,
                        qty: qty,
                        ref: toRomanNumbers(parameter.referenceIds),
                        amount: amount,
                        isItemIndex: true,
                    });

                    runningIndex++;
                }
            }

            //-- update Type of samples
            itemArr[typeOfSampleIndex].typeOfSamples = [...typeOfSampleSet].join('/');

            //clear set
            while (typeOfSampleSet.length > 0) {
                typeOfSampleSet.pop();
            }

        }
    }

    //summary
    let discountPrice = calVat(subTotal, 10);
    let total = subTotal - discountPrice;
    let vat = calVat(total, 7);
    let grandTotal = total + vat;

    let summary = {
        subTotal: formatDigit(subTotal, 2),
        discountPrice: formatDigit(discountPrice, 2),
        total: formatDigit(total, 2),
        vat: formatDigit(vat, 2),
        grandTotal: formatDigit(grandTotal, 2),
    };

    //remarks
    let remarkArr = [];
    let remarkArr2 = [];
    let remarkIndex = 0;
    let remarkIndex2 = 0;

    if (quotationRemarks) {
        for (let i = 0; i < quotationRemarks.length; i++) {
            const remark = quotationRemarks[i];

            if (remark.quotationRemarkType === 1) {
                remarkArr.push({
                    label: remarkIndex === 0 ? 'Remark 1' : '',
                    no: ++remarkIndex,
                    detail: remark.remarkRef ? remark.remarkRef.remarkDetail : '',
                });
            } else {
                remarkArr2.push({
                    label: remarkIndex2 === 0 ? 'Remark 2' : '',
                    no: ++remarkIndex2,
                    detail: remark.remarkRef ? remark.remarkRef.remarkDetail : '',
                });
            }
        }
    }

    const pages = generateF2Pages(header, itemArr, summary, rowPerPage);

    //last page
    const lastPage = {
        pageNumber: pages.length + 1,
        remarks: remarkArr,
        remarks2: remarkArr2,
    };

    return { pages, totalPage: pages.length + 1, lastPage };

}

exports.createE1Datasource = (quotationNumber, quotation, quotationRemarks, samples) => {
    const isEN = quotation && quotation.lang === 'EN' ? true : false;
    let sampleArr = [];
    let total = 0;

    if (samples) {
        for (let i = 0; i < samples.length; i++) {
            const sample = samples[i];
            const parameters = sample.parameters;
            let parameterArr = [];

            //-- parameters
            if (parameters) {
                for (let p = 0; p < parameters.length; p++) {
                    const parameter = parameters[p];
                    const price = parameter.price || 0;
                    const qty = parameter.qty || 0;
                    const amount = price * qty;
                    total += amount;

                    parameterArr.push({
                        no: (p + 1),
                        parameterName: parameter.parameterRef ? parameter.parameterRef.parameterNameEN : '',
                        certified: createCertified(parameter.parameterRef ? parameter.parameterRef.labId : '', parameter.certified),
                        standards: parameter.parameterRef ? parameter.parameterRef.standards : '',
                        lod: parameter.parameterRef ? parameter.parameterRef.lod || '' : '',
                        loq: parameter.parameterRef ? parameter.parameterRef.loq || '' : '',
                        unit: parameter.parameterRef ? parameter.parameterRef.unitEN : '',
                        price: price,
                        qty: qty,
                        amount: amount,
                    });
                }
            }

            //-- sub samples
            const subsamples = sample.subsamples;
            let subparameterArr = [];
            let sampleName = '';

            if (subsamples) {
                for (let s = 0; s < subsamples.length; s++) {
                    const subsample = subsamples[s];
                    const subparameters = subsample.parameters;
                    let subsampleName = (s + 1) + ". " + subsample.sampleName;

                    //-- sub parameters
                    if (subparameters) {
                        for (let p = 0; p < subparameters.length; p++) {
                            const parameter = subparameters[p];
                            const price = parameter.price || 0;
                            const qty = parameter.qty || 0;
                            const amount = price * qty;
                            total += amount;


                            subparameterArr.push({
                                sampleName: p == 0 ? subsampleName : '',
                                no: (p + 1),
                                parameterName: parameter.parameterRef ? parameter.parameterRef.parameterNameEN : '',
                                certified: createCertified(parameter.parameterRef ? parameter.parameterRef.labId : '', parameter.certified),
                                standards: parameter.parameterRef ? parameter.parameterRef.standards : '',
                                lod: parameter.parameterRef ? parameter.parameterRef.lod || '' : '',
                                loq: parameter.parameterRef ? parameter.parameterRef.loq || '' : '',
                                unit: parameter.parameterRef ? parameter.parameterRef.unitEN : '',
                                price: price,
                                qty: qty,
                                amount: amount,
                            });
                        }
                    }

                    if (s === 0) {
                        sampleName = subsample.testingGroupRef ? subsample.testingGroupRef.name : '';
                    }

                }
            }

            sampleArr.push({
                sampleName,
                sampleDescription: isEN ? sample.sampleDescription : sample.sampleDescriptionTH,
                parameters: parameterArr,
                subparameters: subparameterArr
            });

        }
    }

    let specialDiscount = quotation.quotationDiscount || 0;
    let packageFee = quotation.quotationPackingFee || 0;
    let subTotal = quotation.quotationSubTotal || 0;
    let vat = quotation.quotationVat || 0;
    let grandTotal = quotation.quotationGrandTotal || 0;

    let remarkArr = [];
    let remarkArr2 = [];
    let remarkIndex = 0;
    let remarkIndex2 = 0;

    if (quotationRemarks) {
        for (let i = 0; i < quotationRemarks.length; i++) {
            const remark = quotationRemarks[i];

            if (remark.quotationRemarkType === 1) {
                remarkArr.push({
                    label: i === 0 ? 'Remark 1' : '',
                    no: ++remarkIndex,
                    detail: remark.remarkRef ? remark.remarkRef.remarkDetail : '',
                });
            } else {
                remarkArr2.push({
                    label: i === 0 ? 'Remark 2' : '',
                    no: ++remarkIndex2,
                    detail: remark.remarkRef ? remark.remarkRef.remarkDetail : '',
                });
            }
        }
    }

    return {
        customerName: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerNameEN : '',
        quotationNumber: quotationNumber ? quotationNumber.quotationNumber : '',
        userCoName: quotationNumber && parseUserFullname(quotationNumber.userRef),
        revision: quotation ? quotation.quotationRevision : '',
        address: quotationNumber && quotationNumber.customerRef && quotationNumber.customerRef.addressSendRef ? quotationNumber.customerRef.addressSendRef.addressAddrEN : '',
        issueDate: currentDate(),
        tel: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerTel : '',
        fax: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerFax : '',
        email: quotationNumber && quotationNumber.customerRef ? quotationNumber.customerRef.customerEmail : '',
        samples: sampleArr,
        remarks: remarkArr,
        remarks2: remarkArr2,
        total: total.toFixed(2),
        specialDiscount: specialDiscount.toFixed(2),
        packageFee: packageFee.toFixed(2),
        subTotal: subTotal.toFixed(2),
        vat: vat.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
    };

}

exports.getTemplateName = (quotationTypeId) => {
    let templateName = '';

    switch (quotationTypeId) {
        case 1: templateName = 'quotation_F1';
            break;
        case 2: templateName = 'quotation_F2';
            break;
        case 5: templateName += 'quotation_E1';
            break;
        default: templateName += 'quotation_F1';
            break;
    };

    return templateName;
}

exports.exportFile = async (req, res, next) => {

    try {

        const quotationNumberId = req.body.quotationNumberId;
        const quotationTypeId = req.body.quotationTypeId;

        if (!quotationTypeId) {
            return res.status(400).json({ error: { message: 'Please input quotation type' } }).end();
        }

        /* if (quotationTypeId !== 1 && quotationTypeId !== 5) {
            return res.status(404).json({ error: { message: 'Quotation type not supported yet' } }).end();
        } */

        QuotationNumber.findOne({ quotationNumberId: quotationNumberId, deleted: false })
            .populate('quotationStatusRef')
            .populate({ path: 'customerRef', popuplate: [{ path: 'addressReceiptRef' }, { path: 'addressSendRef' }] })
            .populate('userRef')
            .exec()
            .then(quotationNumberDoc => {

                Quotation.findOne({ quotationNumberId: quotationNumberId, deleted: false })
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

                                Sample.find({ quotationId: quotationDoc.quotationId, sampleParentId: null, deleted: false })
                                    .sort('sampleId')
                                    .populate('remarkRef')
                                    .populate({ path: 'subsamples', populate: [{ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }] }] }, { path: 'testingGroupRef' }] })
                                    .populate('quotationRef')
                                    .populate('testingGroupRef')
                                    .populate({ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] })
                                    .exec()
                                    .then(async (sampleDocs) => {

                                        let exportDataSource = {};

                                        switch (quotationTypeId) {
                                            case 1: exportDataSource = this.createF1Datasource(quotationNumberDoc, quotationDoc, quotationRemarkDocs, sampleDocs);
                                                //case 1: exportDataSource = this.createF1Datasource(quotationNumberDoc, quotationDoc, quotationRemarkDocs, sampleDocs);
                                                break;
                                            case 2: exportDataSource = this.createF2Datasource(quotationNumberDoc, quotationDoc, quotationRemarkDocs, sampleDocs);
                                                break;
                                            case 5: exportDataSource = this.createE1Datasource(quotationNumberDoc, quotationDoc, quotationRemarkDocs, sampleDocs);
                                                break;
                                        }

                                        let templateName = this.getTemplateName(quotationTypeId);

                                        try {

                                            let result = null

                                            if (quotationTypeId === 1 || quotationTypeId === 5) {
                                                result = await exportPdf(templateName, exportDataSource, 320, 80);
                                            } else {
                                                result = await exportQuotation(templateName, exportDataSource);
                                            }

                                            res.attachment(`quotation.pdf`);
                                            res.send(result);

                                        } catch (error) {
                                            console.log("<<< error", error);
                                            res.status(500).json({ error: { message: error.message } }).end();
                                        }

                                    }).catch(error => {
                                        res.status(500).json({ error: { message: error.message } }).end();
                                    });



                            }).catch(error => {
                                res.status(500).json({ error: { message: error.message } }).end();
                            });

                    }).catch(error => {
                        res.status(500).json({ error: { message: error.message } }).end();
                    });


            })
            .catch(error => {
                res.status(500).json({ error: { message: error.message } }).end();
            });

    } catch (err) {
        console.log(err.stack);
        Logger.error(`message - ${err.message}, stack trace - ${err.stack}`);
        return next(new HTTPError.InternalServerError('Internal Server Error'));
    }

}