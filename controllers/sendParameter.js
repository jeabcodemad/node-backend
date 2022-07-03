const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const Sample = require('../models/sample');
const SampleParameter = require('../models/sampleParameter');
const SampleParameterStatus = require('../models/sampleParameterStatus');
const SampleParameterTransaction = require('../models/sampleParameterTransaction');
const QuotationNumber = require('../models/quotationNumber');
const Quotation = require('../models/quotation');
const QuotationStatus = require('../models/quotationStatus');
const TestParamter = require('../models/testParameter');
const QuotationTransaction = require('../models/quotationTransaction');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const sample = require('../models/sample');
const { getUserLoginId } = require('../utils/appUtils');

exports.quotations = async (req, res, next) => {
    QuotationNumber.find({ quotationStatusId: { $in: [4, 5, 7, 8] }, deleted: false })
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
};

validateUpdateStatus = (data) => {
    return data.quotationId && data.quotationNumberId;
}

exports.updateStatus = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    if (!validateUpdateStatus(req.body)) {
        return res.status(400).json({ data: req.body, error: { message: 'parameter must not be empty' } });
    }

    const userId = await getUserLoginId(req);

    const sendParameters = req.body.sendParameters;
    let isApproveAll = true;

    try {

        if (sendParameters) {

            for (let i = 0; i < sendParameters.length; i++) {
                const sampleStatusId = sendParameters[i].sampleStatusId;
                const sampleParameterStatusId = sampleStatusId; //use same id
                const parameters = sendParameters[i].parameters;
                const duedatein = sendParameters[i].duedate;
                const duedateout = sendParameters[i].duedate;

                if (sampleParameterStatusId !== 2 && isApproveAll) {
                    isApproveAll = false;
                }

                //update parameters status
                if (parameters) {
                    for (let j = 0; j < parameters.length; j++) {
                        await SampleParameter.findOneAndUpdate({ sampleParameterId: parameters[j].sampleParameterId }, { labId: parameters[j].sendLabId, sampleParameterStatusId: sampleParameterStatusId, duedatein, duedateout }, { new: true });

                        //-- create sample parameter transaction
                        let sampleParameterTransactionData = {
                            sampleParameterStatusId: sampleParameterStatusId,
                            sampleParameterId: parameters[j].sampleParameterId,
                            userId,
                            created_at: new Date(),
                        }

                        const sampleParameterTransaction = new SampleParameterTransaction(sampleParameterTransactionData);
                        await sampleParameterTransaction.save();
                    }
                }

                //update sub parameters status
                const subsamples = sendParameters[i].subsamples;
                if (subsamples) {
                    for (let k = 0; k < subsamples.length; k++) {

                        const subsampleStatusId = subsamples[k].sampleStatusId;
                        const subsampleParameterStatusId = subsampleStatusId; //use same id
                        const subparameters = subsamples[k].parameters;
                        const subduedatein = subsamples[k].duedate;
                        const subduedateout = subsamples[k].duedate;

                        if (subsampleParameterStatusId !== 2 && isApproveAll) {
                            isApproveAll = false;
                        }

                        if (subparameters) {
                            for (let m = 0; m < subparameters.length; m++) {
                                await SampleParameter.findOneAndUpdate({ sampleParameterId: subparameters[m].sampleParameterId }, { labId: subparameters[m].sendLabId, sampleParameterStatusId: subsampleParameterStatusId, duedatein: subduedatein, duedateout: subduedateout }, { new: true });

                                //-- create sub sample parameter transaction
                                let sampleParameterTransactionData = {
                                    sampleParameterStatusId: subsampleParameterStatusId,
                                    sampleParameterId: subparameters[m].sampleParameterId,
                                    userId,
                                    created_at: new Date(),
                                }

                                const sampleParameterTransaction = new SampleParameterTransaction(sampleParameterTransactionData);
                                await sampleParameterTransaction.save();
                            }
                        }

                        //update sub sample
                        const subsampleData = {
                            sampleStatusId: subsampleStatusId,

                            sampleConditionId: subsamples[k].sampleConditionId,
                            refrigeratorTemperature: subsamples[k].refrigeratorTemperature,
                            productTemperature: subsamples[k].productTemperature,
                            supplierCode: subsamples[k].supplierCode,
                            supplierName: subsamples[k].supplierName,
                            collectedFrom: subsamples[k].collectedFrom,
                            collectedBy: subsamples[k].collectedBy,
                            collectedDateTime: subsamples[k].collectedDateTime,
                            receivedDateTime: subsamples[k].receivedDateTime,
                            physicalProperty: subsamples[k].physicalProperty,
                            testDate: subsamples[k].testDate,
                            completionDate: subsamples[k].completionDate,
                            shelfLife: subsamples[k].shelfLife,
                            ARTNo: subsamples[k].ARTNo,
                            MFD: subsamples[k].MFD,
                            BBF: subsamples[k].BBF,
                            laboratoryName: subsamples[k].laboratoryName,
                        }

                        await Sample.findOneAndUpdate({ sampleId: subsamples[k].sampleId }, subsampleData);
                    }
                }

                //update sample
                const sampleData = {
                    sampleStatusId,

                    sampleConditionId: sendParameters[i].sampleConditionId,
                    refrigeratorTemperature: sendParameters[i].refrigeratorTemperature,
                    productTemperature: sendParameters[i].productTemperature,
                    supplierCode: sendParameters[i].supplierCode,
                    supplierName: sendParameters[i].supplierName,
                    collectedFrom: sendParameters[i].collectedFrom,
                    collectedBy: sendParameters[i].collectedBy,
                    collectedDateTime: sendParameters[i].collectedDateTime,
                    receivedDateTime: sendParameters[i].receivedDateTime,
                    physicalProperty: sendParameters[i].physicalProperty,
                    testDate: sendParameters[i].testDate,
                    completionDate: sendParameters[i].completionDate,
                    shelfLife: sendParameters[i].shelfLife,
                    ARTNo: sendParameters[i].ARTNo,
                    MFD: sendParameters[i].MFD,
                    BBF: sendParameters[i].BBF,
                    laboratoryName: sendParameters[i].laboratoryName,
                }
                await Sample.findOneAndUpdate({ sampleId: sendParameters[i].sampleId }, sampleData);
            }

        }

        //update quotation number status
        const quotationStatusId = isApproveAll ? 7 : 4;
        await QuotationNumber.findOneAndUpdate({ quotationNumberId: req.body.quotationNumberId, deleted: false }, { quotationStatusId });

        //update quotation
        await Quotation.findOneAndUpdate({ quotationId: req.body.quotationId, deleted: false }, { updated_at: new Date() })

        //-- create quotation transaction
        const quotationTransactionData = {
            quotationNumberId: req.body.quotationNumberId,
            quotationStatusId,
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