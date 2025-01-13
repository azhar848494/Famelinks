const { default: axios } = require("axios");
const appConfig = require("../../configs/app.config");
const otpUtils = require("./otp");

const sendOTP = (mobileNumber, otp) => {
  return axios.post(
    "https://japi.instaalerts.zone/httpapi/QueryStringReceiver",
    {},
    {
      params: {
        ver: "1.0",
        key: appConfig.sms.apiKey,
        dest: mobileNumber,
        send: appConfig.sms.header,
        dlt_entity_id: appConfig.sms.dltEntityId,
        text: `Your FameLinks OTP is ${otp}`,
      },
    }
  );
};
exports.sendOtpMessage = async (mobileNumber) => {
  const isFound = appConfig.otp.numberToIgnore.includes(
    mobileNumber.toString()
  );
  if (appConfig.otp.isEnabled && !isFound) {
    const otp = otpUtils.generateOtp();
    try {
      await sendOTP(mobileNumber, otp);
    } catch (error) {
      console.log("OTP Error: ", error.data);
    }
    return otp;
  } else {
    return appConfig.otp.value;
  }
};
