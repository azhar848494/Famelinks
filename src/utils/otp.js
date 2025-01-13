const randomUtils = require('./random');
const appConfig = require('../../configs/app.config');

exports.generateOtp = () => {
    return randomUtils.generateNumber(appConfig.otp.length);
};