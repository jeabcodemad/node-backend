const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const Sample = require('../models/sample');
const SampleParameter = require('../models/sampleParameter');
const SampleParameterStatus = require('../models/sampleParameterStatus');
const SampleParameterTransaction = require('../models/sampleParameterTransaction');
const TestParamter = require('../models/testParameter');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const { getUserLoginId } = require('../utils/appUtils');

exports.parameters = async (req, res, next) => {
    SampleParameter.find({ sampleParameterStatusId: { $in: [5, 6, 7, 8] } })
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

        res.status(200).json({ data: result, message: 'success' }).end();

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }

    /* SampleParameter.findOneAndUpdate({ sampleParameterId: req.body.sampleParameterId }, { sampleParameterStatusId: req.body.sampleParameterStatusId }, { new: true }, function (error, doc) {
        if (error) {
            res.status(500).json({ data: doc, error: { message: error.message } }).end();
        } else {
            res.status(200).json({ data: doc, message: 'success' }).end();
        }
    }); */
};