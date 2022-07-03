module.exports = {
    PORT: process.env.PORT || 5000,
    URL: process.env.BASE_URL || 'http://localhost:5000',
    MONGODB_URI: process.env.MONGODB_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || 'seTUP2020',
    SAMPLE_UPLOAD_DIR: process.env.SAMPLE_UPLOAD_DIR || '/uploads/samples/',
}