const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const Lab = require('../models/lab');
const bcrypt = require('bcrypt');
const { Error } = require('mongoose');
const errors = require('restify-errors');
const { getUserLoginId } = require('../utils/appUtils');

exports.labs = async (req, res, next) => {
    try {
        Lab.find({ deleted: false })
            .populate('labTypeRef')
            .populate('userId')
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

exports.lab = async (req, res, next) => {
    try {
        Lab.find({ labId: req.params.id, deleted: false }, function (error, doc) {
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

exports.addLab = async (req, res, next) => {
    try {
        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("Expects 'application/json'"));
        }

        const userId = await getUserLoginId(req);

        const newLab = {
            labName,
            labTel,
            labTypeId,
        } = req.body;

        newLab.userId = userId;
        const lab = new Lab(newLab);

        const validateErrors = lab.validateSync();
        if (validateErrors) {
            return res.status(400).json({ error: { message: validateErrors.message } });
        }

        lab.save(function (error) {
            if (error) {
                res.status(500).json({ data: lab, error: { message: error.message } }).end();
            } else {
                res.status(200).json({ data: lab, message: 'success' }).end();
            }
        });

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.updateLab = async (req, res, next) => {
    try {
        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("Expects 'application/json'"));
        }

        const userId = await getUserLoginId(req);

        const newLab = {
            labId,
            labName,
            labTel,
            labTypeId,
        } = req.body;

        newLab.userId = userId;

        Lab.findOneAndUpdate({ labId: req.params.id }, newLab, { new: true }, function (error, doc) {
            if (error) {
                res.status(500).json({ data: doc, error: { message: error.message } }).end();
            } else {
                res.status(200).json({ data: doc, message: 'success' }).end();
            }
        });

    } catch (error) {
        res.status(500).json({ error: { message: error.message } }).end();
    }
};

exports.deleteLab = async (req, res, next) => {
    try {

        const userId = await getUserLoginId(req);

        Lab.findOneAndUpdate({ labId: req.params.id }, { deleted: true, userId }, { new: true }, function (error, doc) {
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

exports.updateUserLab = async (req, res, next) => {
    try {
        Lab.findOneAndUpdate({ _id: req.body.labId }, {userId: req.body.userId}, { new: true }, function (error, doc) {
            if (error) {
                res.status(500).json({ data: doc, error: { message: error.message } }).end();
            } else {
                res.status(200).json({ data: doc, message: 'success' }).end();
            }
        });

    } catch (error) {
        res.status(403).send({ message : error.message  });
    }
}
