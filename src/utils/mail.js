const nodemailer = require('nodemailer');
const appConfig = require('../../configs/app.config');
const otpUtils = require('./otp');

const transporter = nodemailer.createTransport({
    host: appConfig.mail.host,
    port: appConfig.mail.port,
    secure: appConfig.mail.secure,
    auth: {
        type: 'OAuth2',
        clientId: appConfig.google.clientId,
        clientSecret: appConfig.google.clientSecret,
        user: appConfig.mail.fromMail,
        refreshToken: appConfig.google.refreshToken,
        accessToken: appConfig.google.accessToken
    },
});

const sendOtpOnMail = (to, subject, text) => {
    return transporter.sendMail({
        from: appConfig.mail.fromMail,
        to,
        subject,
        text
    });
};

exports.sendMail = async (to) => {
    const otp = otpUtils.generateOtp();
    try {
        const subject = 'Change Email OTP';
        const body = `OTP to verify your email is ${otp}. Valid for 2 minutes.`;
        await sendOtpOnMail(to, subject, body);
    } catch (error) {
        console.log(error);
    }
    return otp;
};