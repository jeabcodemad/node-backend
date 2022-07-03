const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const Sample = require('../models/sample');
const SampleParameter = require('../models/sampleParameter');
const SampleParameterStatus = require('../models/sampleParameterStatus');
const SampleParameterTransaction = require('../models/sampleParameterTransaction');
const TestParamter = require('../models/testParameter');
const QuotationNumber = require('../models/quotationNumber');
const QuotationTransaction = require('../models/quotationTransaction');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const { getUserLoginId } = require('../utils/appUtils');


exports.parameters = async (req, res, next) => {
    SampleParameter.find({ sampleParameterStatusId: { $in: [6, 7, 8] } })
        .populate({ path: 'sampleRef', populate: { path: 'quotationRef', populate: { path: 'quotationNumberRef' } } })
        .populate({ path: 'parameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'testingGroupRef' }] })
        .populate('labRef')
        .populate('sampleParameterStatusRef')
        .sort({ 'sampleParameterId': 'desc' })
        .exec()
        .then(docs => {
            res.status(200).json({ data: docs, message: 'success' }).end();
        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });
};

validateUpdateParameterStatus = data => {
    return data.sampleParameterId && data.sampleParameterStatusId;
}

getParametersInQuotation = async (quotationNumberId) => {
    const parameters = await SampleParameter.find()
        .populate({ path: 'sampleRef', populate: { path: 'quotationRef', populate: { path: 'quotationNumberRef' } } })
        .exec();

    return parameters.filter(item => {
        return !item.sampleRef.quotationRef.deleted && item.sampleRef.quotationRef.quotationNumberRef.quotationNumberId === quotationNumberId;
    });
}

isAllParameterApproved = async (parameters) => {
    const notApprovedItems = parameters.filter(item => {
        return item.sampleParameterStatusId < 7;
    });

    return notApprovedItems.length === 0;
}

exports.updateParameterStatus = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    if (!validateUpdateParameterStatus(req.body)) {
        return res.status(400).json({ data: req.body, error: { message: 'parameter must not be empty' } });
    }

    const userId = await getUserLoginId(req);

    try {

        const result = await SampleParameter.findOneAndUpdate({ sampleParameterId: req.body.sampleParameterId }, { sampleParameterStatusId: req.body.sampleParameterStatusId, certified: req.body.certified }, { new: true })
            .populate('sampleParameterStatusRef');

        //-- create sample parameter transaction
        let sampleParameterTransactionData = {
            sampleParameterStatusId: req.body.sampleParameterStatusId,
            sampleParameterId: req.body.sampleParameterId,
            userId,
            created_at: new Date(),
        }

        const sampleParameterTransaction = new SampleParameterTransaction(sampleParameterTransactionData);
        await sampleParameterTransaction.save();

        //check all paramter status in quotation
        const parameters = await getParametersInQuotation(req.body.quotationNumberId);

        if (await isAllParameterApproved(parameters)) {
            //update parameters status
            for (let i = 0; i < parameters.length; i++) {
                await SampleParameter.findOneAndUpdate({ sampleParameterId: parameters[i].sampleParameterId }, { sampleParameterStatusId: 8 });

                //-- create sample parameter transaction
                let sampleParameterTransactionData = {
                    sampleParameterStatusId: 8,
                    sampleParameterId: parameters[i].sampleParameterId,
                    userId,
                    created_at: new Date(),
                }

                const sampleParameterTransaction = new SampleParameterTransaction(sampleParameterTransactionData);
                await sampleParameterTransaction.save();
            }

            //update quotation status
            await QuotationNumber.findOneAndUpdate({ quotationNumberId: req.body.quotationNumberId, deleted: false }, { quotationStatusId: 8 });

            //-- create quotation transaction
            const quotationTransactionData = {
                quotationNumberId: req.body.quotationNumberId,
                quotationStatusId: 8,
                created_at: new Date(),
                userId,
            };

            const quotationTransaction = new QuotationTransaction(quotationTransactionData);
            await quotationTransaction.save();
        }

        res.status(200).json({ data: result, message: 'success' }).end();

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }

};