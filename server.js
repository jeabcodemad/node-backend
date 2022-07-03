if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');

const errors = require('restify-errors');

const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const userRoutes = require('./routes/user');
const packageGroupRoutes = require('./routes/packageGroup');
const testParameterRoutes = require('./routes/testParameter');
const labRoutes = require('./routes/lab');
const masterDataRoutes = require('./routes/masterData');
const customerRoutes = require('./routes/customer');
const addressRoutes = require('./routes/address');
const roleRoutes = require('./routes/role');
const quotationRoutes = require('./routes/quotation');
const labParameterRoutes = require('./routes/labParameter');
const sendParameterRoutes = require('./routes/sendParameter');
const checkLabParameterRoutes = require('./routes/checkLabParameter');
const approveLabParameterRoutes = require('./routes/approveLabParameter');
const trackQuotationRoutes = require('./routes/trackQuotation');
const trackSampleRoutes = require('./routes/trackSample');
const quotationReportRoutes = require('./routes/quotationReport');
const quotationsRoutes = require('./routes/closeJob');
const quotationHistoryRoutes = require('./routes/quotationHistory');

const auth = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/register', registerRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/packagegroup', packageGroupRoutes);
app.use('/api/testparameter', testParameterRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/masterdata', masterDataRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/roles', auth, roleRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/labparameter', labParameterRoutes);
app.use('/api/checklabparameter', checkLabParameterRoutes);
app.use('/api/approvelabparameter', approveLabParameterRoutes);
app.use('/api/sendparameter', sendParameterRoutes);
app.use('/api/trackquotation', trackQuotationRoutes);
app.use('/api/tracksample', trackSampleRoutes);
app.use('/api/quotationreport', quotationReportRoutes);
app.use('/api/closejob', quotationsRoutes);
app.use('/api/quotationhistory', quotationHistoryRoutes);

app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
    const err = new errors.UnauthorizedError('Unauthorized');
    err.status = (404);
    next(err);
});
app.use((req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: { message: err.message } });
});

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => { console.log('connected to mongodb'); })
    .catch(err => console.log(err.message));

app.listen(config.PORT || 5000);