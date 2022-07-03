
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const config = require('../config');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const runningPath = process.cwd();
        const uploadPath = path.join(runningPath, config.SAMPLE_UPLOAD_DIR);

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(xlsx|XLSX|xls|XLS)$/)) {
        req.fileValidationError = 'not valid file type!';
        return cb(new Error('not valid file type!'), false);
    }
    cb(null, true);
};

exports.upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Limit size 5MB
}).any();