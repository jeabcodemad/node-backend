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
const Reference = require('../models/reference');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const { populate } = require('../models/sampleParameter');
const { exportReport, currentDate, formatDate, formatDatetime } = require('../utils/exportUtils');
const { toRomanNumber, toRomanNumbers, genReportNo, getUserLoginId } = require('../utils/appUtils');
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
                                .populate({ path: 'subsamples', populate: [{ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] }, { path: 'sampleStatusRef' }] })
                                .populate('quotationRef')
                                .populate('testingGroupRef')
                                .populate({ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }, { path: 'labRef' }] })
                                .populate('sampleStatusRef')
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

validateUpdateValue = (data) => {
    return data.quotationId && data.quotationNumberId;
}

exports.updateValue = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    if (!validateUpdateValue(req.body)) {
        return res.status(400).json({ data: req.body, error: { message: 'parameter must not be empty' } });
    }

    const userId = await getUserLoginId(req);

    const samples = req.body.samples;

    try {

        if (samples) {

            for (let i = 0; i < samples.length; i++) {

                //update subsample
                const subsamples = samples[i].subsamples;

                if (subsamples) {
                    for (let j = 0; j < subsamples.length; j++) {
                        const subsampleData = {
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
                        }

                        await Sample.findOneAndUpdate({ sampleId: subsamples[j].sampleId }, subsampleData);

                        //update subparameters
                        const subparameters = subsamples[j].parameters;

                        if (subparameters) {
                            for (let k = 0; k < subparameters.length; k++) {
                                const subreferenceIds = subparameters[k].referenceIds || [];
                                await SampleParameter.findOneAndUpdate({ sampleParameterId: subparameters[k].sampleParameterId }, { referenceIds: subreferenceIds.join(',') });

                                //-- create sample parameter transaction
                                let sampleParameterTransactionData = {
                                    sampleParameterStatusId: subparameters[k].sampleParameterStatusId,
                                    sampleParameterId: subparameters[k].sampleParameterId,
                                    userId,
                                    created_at: new Date(),
                                }

                                const sampleParameterTransaction = new SampleParameterTransaction(sampleParameterTransactionData);
                                await sampleParameterTransaction.save();
                            }
                        }
                    }
                }

                //update sample
                const sampleData = {
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
                }

                await Sample.findOneAndUpdate({ sampleId: samples[i].sampleId }, sampleData);

                //update parameters
                const parameters = samples[i].parameters;

                if (parameters) {
                    for (let k = 0; k < parameters.length; k++) {
                        const referenceIds = parameters[k].referenceIds || [];
                        await SampleParameter.findOneAndUpdate({ sampleParameterId: parameters[k].sampleParameterId }, { referenceIds: referenceIds.join(',') });

                        //-- create sample parameter transaction
                        let sampleParameterTransactionData = {
                            sampleParameterStatusId: parameters[k].sampleParameterStatusId,
                            sampleParameterId: parameters[k].sampleParameterId,
                            userId,
                            created_at: new Date(),
                        }

                        const sampleParameterTransaction = new SampleParameterTransaction(sampleParameterTransactionData);
                        await sampleParameterTransaction.save();
                    }
                }
            }

        }

        const quotationNumberModel = await QuotationNumber.findOne({ quotationNumberId: req.body.quotationNumberId, deleted: false });

        //-- create quotation transaction
        const quotationTransactionData = {
            quotationNumberId: req.body.quotationNumberId,
            quotationStatusId: quotationNumberModel.quotationStatusId,
            created_at: new Date(),
            userId,
        };

        const quotationTransaction = new QuotationTransaction(quotationTransactionData);
        await quotationTransaction.save();

    } catch (error) {
        return res.status(500).json({ error: { message: error.message } }).end();
    }

    res.status(200).json({ message: 'success' }).end();

};

exports.getReportType = async (req, res, next) => {
    ReportType.find({ customerTypeId: req.params.customertypeid }, function (error, docs) {
        if (error) {
            res.status(500).json({ data: docs, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: docs, message: 'success' }).end();
        }
    });
};

nextReportNo = async () => {
    const reportNoModel = await ReportNo.findOne();
    const seq = reportNoModel.seq + 1;
    await ReportNo.findOneAndUpdate({}, { seq });
    return seq;
}

createReferences = async (referenceArr, isEN) => {
    let arr = [];
    const references = await Reference.find({ referenceId: { $in: [...referenceArr] } });

    if (references) {
        for (let i = 0; i < references.length; i++) {
            arr.push({
                no: toRomanNumber(references[i].referenceId),
                detail: (isEN ? references[i].referenceEN || '' : references[i].referenceTH || '')
            });
        }
    }

    return arr;
}

createCertified = (labId, certified) => {
    let cer = certified === 'no' ? 'n' : '';
    if (labId === 10) {
        cer += cer ? ',' : '';
        cer += 'c';
    }
    return cer;
}

exports.createReportF1Datasource = async (quotationNumber, quotation, quotationRemarks, samples, lang) => {
    const isEN = lang === 'EN' ? true : false;
    const rowPerPage = 5;

    let pages = [];
    let totalPage = 0;
    let referenceArr = new Set();
    const reportNo = await nextReportNo();

    //---------------------
    if (samples) {

        for (let i = 0; i < samples.length; i++) {
            const sample = samples[i];
            let items = [];

            //set header
            const header = {
                reportNo: genReportNo('F', reportNo),
                sampleNo: sample.sampleNo || '',
                issueDate: currentDate(),
                customerName: quotationNumber.customerRef ? (isEN ? quotationNumber.customerRef.customerNameEN : quotationNumber.customerRef.customerNameTH) : '',
                address: (quotationNumber.customerRef && quotationNumber.customerRef.addressSendRef) ? (isEN ? quotationNumber.customerRef.addressSendRef.addressAddrEN || '' : quotationNumber.customerRef.addressSendRef.addressAddrTH || '') : '',
                sampleDescriptionEN: sample.sampleDescription || '',
                sampleDescriptionTH: sample.sampleDescriptionTH || '',
                refrigeratorTemperature: sample.refrigeratorTemperature || '',
                productTemperature: sample.productTemperature || '',
                supplierCode: sample.supplierCode || '',
                supplierName: sample.supplierName || '',
                collectedFrom: sample.collectedFrom || '',
                collectedBy: sample.collectedBy || '',
                collectedDateTime: formatDatetime(sample.collectedDateTime),
                receivedDateTime: formatDatetime(sample.receivedDateTime),
                sampleCondition: sample.sampleConditionRef ? (isEN ? sample.sampleConditionRef.sampleConditionEN || '' : sample.sampleConditionRef.sampleConditionTH || '') : '',
                physicalProperty: sample.physicalProperty || '',

                testDate: formatDate(sample.testDate),
                completionDate: formatDate(sample.completionDate),
                shelfLife: sample.shelfLife || '',
                ARTNo: sample.ARTNo || '',
                MFD: sample.MFD || '',
                BBF: sample.BBF || '',

            };//*** */

            //set footer
            const footer = {};//*** */

            //set content
            const parameters = sample.parameters;

            if (parameters) {

                const length = parameters.length;

                for (let p = 0; p < length; p++) {
                    const no = p + 1;

                    const parameter = parameters[p];
                    const ref = toRomanNumbers(parameter.referenceIds);

                    //add reference ids
                    if (parameter.referenceIds) {
                        const ids = parameter.referenceIds.split(',');

                        for (let e = 0; e < ids.length; e++) {
                            referenceArr.add(ids[e]);
                        }

                    }

                    items.push({
                        no,
                        parameterName: parameter.parameterRef ? (isEN ? parameter.parameterRef.parameterNameEN || '' : parameter.parameterRef.parameterNameTH || '') : '',
                        certified: createCertified(parameter.parameterRef ? parameter.parameterRef.labId : '', parameter.certified),
                        standards: parameter.parameterRef ? parameter.parameterRef.standards : '',
                        lod: parameter.parameterRef ? parameter.parameterRef.lod || '' : '',
                        loq: parameter.parameterRef ? parameter.parameterRef.loq || '' : '',
                        unit: parameter.parameterRef ? (isEN ? parameter.parameterRef.unitEN : parameter.parameterRef.unitTH) : '',
                        result: parameter.result || '',
                        standardLimit: parameter.parameterRef && parameter.parameterRef.packageGroupRef ? (isEN ? parameter.parameterRef.packageGroupRef.standardValueEN || '' : parameter.parameterRef.packageGroupRef.standardValueTH || '') : '',
                        ref,
                    });

                    /* //add reference
                    if (parameter.referenceRef) {
                        referenceArr.add(ref + '. ' + (isEN ? parameter.referenceRef.referenceEN : parameter.referenceRef.referenceTH));
                    } */

                    if (no % rowPerPage === 0 || no === length) {
                        totalPage++;

                        //set content
                        const content = {
                            items: [...items]
                        };

                        pages.push({
                            header,
                            content,
                            footer,
                            isFirstPage: false,
                            isLastPage: false,
                            pageNumber: totalPage,
                            isSubPage: no > rowPerPage,
                        });

                        isFirstPage = false;

                        //clear items
                        while (items.length > 0) {
                            items.pop();
                        }

                    }
                }
            }

        }
    }

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

    //set more values
    if (pages.length > 0) {
        pages[0].isFirstPage = true;

        let lastPage = pages[pages.length - 1];
        lastPage.isLastPage = true;
        lastPage.remarks = remarkArr;
        lastPage.remarks2 = remarkArr2;
        lastPage.references = await createReferences(referenceArr, isEN);
    }

    return { pages, totalPage };
}

exports.createReportWaterDatasource = async (quotationNumber, quotation, quotationRemarks, samples, lang) => {
    const isEN = lang === 'EN' ? true : false;
    const rowPerPage = 5;

    let pages = [];
    let totalPage = 0;
    let referenceArr = new Set();
    const reportNo = await nextReportNo();

    //---------------------
    if (samples) {

        for (let i = 0; i < samples.length; i++) {
            const sample = samples[i];
            let items = [];
            let sampleConditionArr = new Set();

            //set header
            const header = {
                reportNo: genReportNo('F', reportNo),
                sampleNo: sample.sampleNo || '',
                issueDate: currentDate(),
                customerName: quotationNumber.customerRef ? (isEN ? quotationNumber.customerRef.customerNameEN : quotationNumber.customerRef.customerNameTH) : '',
                address: (quotationNumber.customerRef && quotationNumber.customerRef.addressSendRef) ? (isEN ? quotationNumber.customerRef.addressSendRef.addressAddrEN || '' : quotationNumber.customerRef.addressSendRef.addressAddrTH || '') : '',
                sampleDescriptionEN: sample.sampleDescription || '',
                sampleDescriptionTH: sample.sampleDescriptionTH || '',
                collectedFrom: sample.collectedFrom || '',
                collectedBy: sample.collectedBy || '',
                collectedDateTime: formatDatetime(sample.collectedDateTime),
                receivedDateTime: formatDatetime(sample.receivedDateTime),

                testDate: formatDate(sample.testDate),
                completionDate: formatDate(sample.completionDate),
                sampleId: sample.sampleId,

                laboratoryName: sample.laboratoryName,
            };

            //set footer
            const footer = {};

            //set content
            const subsamples = sample.subsamples || [];

            for (let i = 0; i < subsamples.length; i++) {
                const subparameters = subsamples[i].parameters || [];
                let no = 0;

                let subsampleCondition = subsamples[i].sampleConditionRef ? (isEN ? subsamples[i].sampleConditionRef.sampleConditionEN || '' : subsamples[i].sampleConditionRef.sampleConditionTH || '') : '';
                sampleConditionArr.add(subsampleCondition);

                for (let p = 0; p < subparameters.length; p++) {
                    no++;

                    const parameter = subparameters[p];
                    //const reference = parameter.referenceRef ? toRomanNumber(parameter.referenceRef.referenceId) : '';
                    const reference = toRomanNumbers(parameter.referenceIds);

                    //add reference ids
                    if (parameter.referenceIds) {
                        const ids = parameter.referenceIds.split(',');

                        for (let e = 0; e < ids.length; e++) {
                            referenceArr.add(ids[e]);
                        }

                    }

                    items.push({
                        no,
                        parameterName: parameter.parameterRef ? (isEN ? parameter.parameterRef.parameterNameEN || '' : parameter.parameterRef.parameterNameTH || '') : '',
                        certified: createCertified(parameter.parameterRef ? parameter.parameterRef.labId : '', parameter.certified),
                        standards: parameter.parameterRef ? parameter.parameterRef.standards : '',
                        lod: parameter.parameterRef ? parameter.parameterRef.lod || '' : '',
                        loq: parameter.parameterRef ? parameter.parameterRef.loq || '' : '',
                        unit: parameter.parameterRef ? (isEN ? parameter.parameterRef.unitEN : parameter.parameterRef.unitTH) : '',
                        result: parameter.result || '',
                        standardLimit: parameter.parameterRef && parameter.parameterRef.packageGroupRef ? (isEN ? parameter.parameterRef.packageGroupRef.standardValueEN || '' : parameter.parameterRef.packageGroupRef.standardValueTH || '') : '',
                        reference,
                    });

                    /* //add reference
                    if (parameter.referenceRef) {
                        referenceArr.add(ref + '. ' + (isEN ? parameter.referenceRef.referenceEN : parameter.referenceRef.referenceTH));
                    } */

                    if (no % rowPerPage === 0 || (i === subsamples.length - 1 && (p === subparameters.length - 1))) {
                        totalPage++;

                        //set content
                        const content = {
                            items: [...items]
                        };

                        pages.push({
                            header,
                            content,
                            footer,
                            isFirstPage: false,
                            isLastPage: false,
                            pageNumber: totalPage,
                            isSubPage: no > rowPerPage,
                        });

                        isFirstPage = false;

                        //clear items
                        while (items.length > 0) {
                            items.pop();
                        }

                    }
                }

                //set sample conditions
                for (let pg = 0; pg < pages.length; pg++) {
                    if (pages[pg].header.sampleId === sample.sampleId) {
                        pages[pg].header.sampleConditions = [...sampleConditionArr];
                    }
                }

                while (sampleConditionArr.length > 0) {
                    sampleConditionArr.pop();
                }

            }

        }
    }

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

    let lastPage = pages[pages.length - 1];
    pages[0].isFirstPage = true;
    lastPage.isLastPage = true;
    lastPage.remarks = remarkArr;
    lastPage.remarks2 = remarkArr2;
    lastPage.references = await createReferences(referenceArr, isEN);

    return { pages, totalPage };
}

exports.getTemplateName = (reportTypeId) => {
    let templateName = '';

    switch (reportTypeId) {
        case 19: templateName += 'report_water_EN';
            break;
        default: templateName += 'report_F1_EN';
            break;
    };

    return templateName;
}

exports.getReportDatasource = async (reportTypeId, quotationNumberDoc, quotationDoc, quotationRemarkDocs, sampleDocs) => {
    let templateName = '';

    switch (reportTypeId) {
        case 19: return await this.createReportWaterDatasource(quotationNumberDoc, quotationDoc, quotationRemarkDocs, sampleDocs, 'EN');
        default: return await this.createReportF1Datasource(quotationNumberDoc, quotationDoc, quotationRemarkDocs, sampleDocs, 'EN');
    };

}

exports.exportFile = async (req, res, next) => {

    try {

        const quotationNumberId = req.body.quotationNumberId;
        const reportTypeId = req.body.reportTypeId;

        if (!reportTypeId) {
            return res.status(400).json({ error: { message: 'Please input quotation type' } }).end();
        }

        QuotationNumber.findOne({ quotationNumberId: quotationNumberId, deleted: false })
            .populate('quotationStatusRef')
            .populate({ path: 'customerRef', populate: [{ path: 'addressReceiptRef' }, { path: 'addressSendRef' }] })
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
                                    .populate({ path: 'subsamples', populate: [{ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }] }, { path: 'sampleConditionRef' }] })
                                    .populate('quotationRef')
                                    .populate('testingGroupRef')
                                    .populate({ path: 'parameters', populate: [{ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] }, { path: 'referenceRef' }] })
                                    .populate('sampleConditionRef')
                                    .exec()
                                    .then(async (sampleDocs) => {

                                        const exportDataSource = await this.getReportDatasource(reportTypeId, quotationNumberDoc, quotationDoc, quotationRemarkDocs, sampleDocs);
                                        let templateName = this.getTemplateName(reportTypeId);

                                        try {

                                            const result = await exportReport(templateName, exportDataSource);
                                            //res.attachment(`quotation.pdf`);
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