const moment = require('moment');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/user');

const convertDateToString = (date) => {
    return !date ? '' : moment(date, moment.ISO_8601).format('YYYY-MM-DD HH:mm:ss');
}

const parseFloatNotNaN = (n) => {
    const result = parseFloat(n);
    return isNaN(result) ? 0 : result;
}

const parseIntNotNaN = (n) => {
    const result = parseInt(n);
    return isNaN(result) ? 0 : result;
}

const genQuotationNumber = (userType, quotationNumberId) => {
    const prefix = userType === 1 ? 'F' : 'E';
    const id = parseInt(quotationNumberId) || 0;

    if (id > 99) {
        return prefix + id;
    } else if (id > 9) {
        return prefix + '0' + id;
    } else if (id > 0) {
        return prefix + '00' + id;
    }

    return '';
}

const genSampleNo = (prefix, sampleId) => {
    const id = parseInt(sampleId) || 0;

    if (id > 999) {
        return prefix + id;
    } else if (id > 99) {
        return prefix + '0' + id;
    } else if (id > 9) {
        return prefix + '00' + id;
    } else if (id > 0) {
        return prefix + '000' + id;
    }

    return '';
}

const genReportNo = (prefix, reportSeq) => {
    const id = parseInt(reportSeq) || 0;

    if (id > 999) {
        return prefix + id;
    } else if (id > 99) {
        return prefix + '0' + id;
    } else if (id > 9) {
        return prefix + '00' + id;
    } else if (id > 0) {
        return prefix + '000' + id;
    }

    return '';
}

const toRomanNumber = (n) => {
    const arr = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx", ""];
    const index = n >= 1 && n <= 20 ? (n - 1) : 20;
    return arr[index];
}

const toRomanNumbers = (ns) => {
    if (ns) {
        const nsArr = ns.split(',');
        let arr = [];

        for (let i = 0; i < nsArr.length; i++) {
            arr.push(toRomanNumber(nsArr[i]));
        }

        return arr.join(',');
    }

    return '';
}

const getUserLogin = async (req) => {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const user = jwt.verify(token, JWT_SECRET);
        return await User.findOne({ email: user.email });
    } catch (error) {
        console.log(error);
        return null;
    }
}

const getUserLoginId = async (req) => {
    const user = await getUserLogin(req);
    if (user) {
        return user._id;
    }

    return null;
}

const isAdmin = user => {
    if (user) {
        return user && user.role && user.role.roleName === 'admin';
    }

    return false;
}

const parseUserFullname = (userRef) => {
    return userRef ? ((userRef.firstname || '') + ' ' + (userRef.lastname || '')) : '';
}

const includeString = (s1, s2) => {
    if (!s1 || !s2) {
        return false;
    }

    return s1.toLowerCase().includes(s2.toLowerCase());
}

module.exports = {
    convertDateToString,
    parseFloatNotNaN,
    parseIntNotNaN,
    genQuotationNumber,
    genSampleNo,
    genReportNo,
    toRomanNumber,
    toRomanNumbers,
    getUserLogin,
    getUserLoginId,
    isAdmin,
    parseUserFullname,
    includeString,
}