const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // const error = new Error();
    // error.status = 403;

    if(authHeader) {
        const token = authHeader.split('Bearer ')[1];
        if(token) {
            try {
                const user = jwt.verify(token, JWT_SECRET);
                req.user = user;
                console.log(user);
                return next();
            } catch(err) {
                // error.message = 'invalid/expired token';
                return next(err.message);
            }
        }

        // error.message = 'authorization header must be provided';
        return next(res.status(403).json({ error: 'Authorization header must be provided' }));
    }
    // error.message = 'authorization header must be provided';
    return next(res.status(403).json({ error: 'Authorization header must be provided' }));


};