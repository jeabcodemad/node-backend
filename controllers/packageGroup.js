const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const PackageGroup = require('../models/packageGroup');
const PackageGroupTestParameter = require('../models/packageGroupTestParameter');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');


exports.packageGroups = async (req, res, next) => {
    PackageGroup.find({ deleted: false })
        .populate('checkingGroupRef')
        .populate({ path: 'packageGroupTestParameterRef', populate: { path: 'testParameterRef', populate: [{ path: 'packageGroupRef' }, { path: 'labRef' }, { path: 'testingGroupRef' }] } })
        .exec()
        .then(docs => {
            res.status(200).json({ data: docs, message: 'success' }).end();
        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });

};

exports.packageGroup = async (req, res, next) => {
    PackageGroup.find({ packageId: req.params.id, deleted: false }, function (error, doc) {
        if (error) {
            res.status(500).json({ data: doc, error: { message: 'Not found data' } }).end();
        } else {
            res.status(200).json({ data: doc, message: 'success' }).end();
        }
    });
};

exports.addPackageGroup = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    try {

        const newPackageGroup = {
            packageCode,
            testingType,
            packageName,
            standardValueEN,
            standardValueTH,
            checkingGroupId,
            testParameters,
        } = req.body;

        const packageGroup = new PackageGroup(newPackageGroup);

        const validateErrors = packageGroup.validateSync();
        if (validateErrors) {
            return res.status(400).json({ error: { message: validateErrors.message } });
        }

        await packageGroup.save();

        if (testParameters) {
            for (let i = 0; i < testParameters.length; i++) {
                //add PackageGroupTestParameter
                const ptData = {
                    packageId: packageGroup.packageId,
                    parameterId: testParameters[i].parameterId,
                };

                const ptModel = new PackageGroupTestParameter(ptData);
                await ptModel.save(ptData);
            }
        }

        res.status(200).json({ data: packageGroup, message: 'success' }).end();

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.updatePackageGroup = async (req, res, next) => {
    if (!req.is('application/json')) {
        return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    const newPackageGroup = {
        packageId,
        packageCode,
        testingType,
        packageName,
        standardValueEN,
        standardValueTH,
        checkingGroupId,
        testParameters,
    } = req.body;

    PackageGroup.findOneAndUpdate({ packageId: req.params.id }, newPackageGroup, { new: true }, async function (error, doc) {
        if (error) {
            res.status(500).json({ data: doc, error: { message: error.message } }).end();
        } else {

            //clear test parameters
            await PackageGroupTestParameter.deleteMany({ packageId });

            if (testParameters) {
                for (let i = 0; i < testParameters.length; i++) {
                    //add PackageGroupTestParameter
                    const ptData = {
                        packageId,
                        parameterId: testParameters[i].parameterId,
                    };

                    const ptModel = new PackageGroupTestParameter(ptData);
                    await ptModel.save(ptData);
                }
            }

            res.status(200).json({ data: doc, message: 'success' }).end();
        }
    });

};

exports.deletePackageGroup = async (req, res, next) => {
    PackageGroup.findOneAndUpdate({ packageId: req.params.id }, { deleted: true }, { new: true }, function (error, doc) {
        if (error) {
            res.status(500).json({ data: doc, error: { message: 'Not found data' } }).end();
        } else {
            res.status(200).json({ data: doc, message: 'success' }).end();
        }
    });
};

exports.packageGroupsByTestingGroupId = async (req, res, next) => {
    PackageGroup.find({ testingGroupId: req.params.id, deleted: false })
        .populate('checkingGroupRef')
        .exec()
        .then(docs => {
            res.status(200).json({ data: docs, message: 'success' }).end();
        })
        .catch(error => {
            res.status(500).json({ data: null, error: { message: error.message } }).end();
        });

};