const { sendOtpMessage } = require('../../../utils/sms');
const { generateHash } = require('../../../utils/crypt');
const { sign } = require('../../../utils/jwt');
const appConfig = require('../../../../configs/app.config');
const { sendMail } = require('../../../utils/mail');
const { getPhoneNumberDetails } = require('../../../utils/phoneNumber');

module.exports = async (payload) => {
    let otp;
    if (payload.mobileNumber) {
        const details = getPhoneNumberDetails(payload.mobileNumber);
        console.log(details);
        otp = await sendOtpMessage(`${details.countryCode}${details.nationalNumber}`);;
    } else if (payload.email) {
        otp = await sendMail(payload.email);
    }
    const otpHash = await generateHash(otp);
    const token = sign({
        otp: otpHash,
        mobileNumber: payload.mobileNumber || null,
        email: payload.email || null
    }, appConfig.jwt.secret, {
        expiresIn: appConfig.otp.expiryTimeInSeconds
    });
    return {
        token,
        expiryTimeInSeconds: appConfig.otp.expiryTimeInSeconds
    };
};