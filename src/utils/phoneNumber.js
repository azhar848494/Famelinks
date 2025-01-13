const phoneUtils = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNF = require('google-libphonenumber').PhoneNumberFormat;

exports.getValidPhoneNumber = (countryCode, phoneNumber) => {
    try {
        const phoneNumberParsed = phoneUtils.parse(`+${countryCode}${phoneNumber}`);
        const countryCodeParsed = phoneNumberParsed.getCountryCode();
        const isValidNumber = phoneUtils.isValidNumber(phoneNumberParsed);
        const nationalNumber = phoneNumberParsed.getNationalNumber();

        if (countryCodeParsed.toString() !== countryCode.toString()) {
            return;
        }
        if (!isValidNumber || (nationalNumber.toString() !== phoneNumber.toString())) {
            return;
        }
        return phoneUtils.format(phoneNumberParsed, PNF.E164);
    } catch (error) {
        return;
    }
};

exports.getValidPhoneNumber2 = (phoneNumber) => {
    try {
        const phoneNumberParsed = phoneUtils.parse(`+${phoneNumber}`);
        const isValidNumber = phoneUtils.isValidNumber(phoneNumberParsed);

        if (!isValidNumber) {
            return;
        }
        return phoneUtils.format(phoneNumberParsed, PNF.E164);
    } catch (error) {
        return;
    }
};

exports.getPhoneNumberDetails = (phoneNumber) => {
    try {
        const phoneNumberParsed = phoneUtils.parse(`${phoneNumber}`);
        const countryCode = phoneNumberParsed.getCountryCode();
        const nationalNumber = phoneNumberParsed.getNationalNumber();

        return {
            countryCode,
            nationalNumber
        };
    } catch (error) {
        return {};
    }
};