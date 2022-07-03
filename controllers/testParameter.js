const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const TestingGroup = require('../models/testingGroup');
const TestParameter = require('../models/testParameter');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const { getUserLoginId } = require('../utils/appUtils');

exports.testParameters = async (req, res, next) => {
    try {
        TestParameter.find({ deleted: false })
            .populate('packageGroupRef')
            .populate('labRef')
            .populate('testingGroupRef')
            .exec()
            .then(docs => {
                res.status(200).json({ data: docs, message: 'success' }).end();
            })
            .catch(error => {
                res.status(500).json({ data: null, error: { message: error.message } }).end();
            });

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.testParameter = async (req, res, next) => {
    try {
        TestParameter.find({ parameterId: req.params.id, deleted: false }, function (error, doc) {
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

exports.addTestParameter = async (req, res, next) => {
    try {
        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("Expects 'application/json'"));
        }

        const userId = await getUserLoginId(req);

        const newTestParameter = {
            orderOfPackageGroup,
            parameterNameEN,
            parameterNameTH,
            unitEN,
            unitTH,
            standards,
            lod,
            loq,
            testingValue,
            version,
            lastUpdate,
            //packageId,
            labId,
            testingGroupId,
        } = req.body;

        newTestParameter.userId = userId;

        const testParameter = new TestParameter(newTestParameter);
        testParameter.version = 1;

        const validateErrors = testParameter.validateSync();
        if (validateErrors) {
            return res.status(400).json({ error: { message: validateErrors.message } });
        }

        testParameter.save(function (error) {
            if (error) {
                res.status(500).json({ data: testParameter, error: { message: error.message } }).end();
            } else {
                res.status(200).json({ data: testParameter, message: 'success' }).end();
            }
        });

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.updateTestParameter = async (req, res, next) => {
    try {
        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("Expects 'application/json'"));
        }

        const userId = await getUserLoginId(req);

        const newTestParameter = {
            parameterId,
            orderOfPackageGroup,
            parameterNameEN,
            parameterNameTH,
            unitEN,
            unitTH,
            standards,
            lod,
            loq,
            testingValue,
            version,
            lastUpdate,
            //packageId,
            labId,
            testingGroupId,
        } = req.body;

        newTestParameter.userId = userId;

        const testParameter = new TestParameter(newTestParameter);
        testParameter.deleted = false;
        testParameter._id = null;

        const validateErrors = testParameter.validateSync();
        if (validateErrors) {
            return res.status(400).json({ error: { message: validateErrors.message } });
        }

        const oldTestParameter = await TestParameter.findOne({ parameterId: req.params.id, deleted: false });
        testParameter.version = oldTestParameter ? oldTestParameter.version + 1 : 1;

        testParameter.save(function (error) {
            if (error) {
                res.status(500).json({ data: testParameter, error: { message: error.message } }).end();
            } else {
                if (oldTestParameter) {
                    TestParameter.findOneAndUpdate({ parameterId: oldTestParameter.parameterId, deleted: false }, { deleted: true }, { new: true }, function (error, doc) {
                        if (error) {
                            res.status(500).json({ data: doc, error: { message: error.message } }).end();
                        } else {
                            res.status(200).json({ data: testParameter, message: 'success' }).end();
                        }
                    });
                } else {
                    res.status(200).json({ data: testParameter, message: 'success' }).end();
                }
            }
        });

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.deleteTestParameter = async (req, res, next) => {
    try {

        const userId = await getUserLoginId(req);

        TestParameter.findOneAndUpdate({ parameterId: req.params.id, version: req.params.version }, { deleted: true, userId }, { new: true }, function (error, doc) {
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