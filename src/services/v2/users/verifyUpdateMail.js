const { verify } = require('../../../utils/jwt');
const { compareHash } = require('../../../utils/crypt');
const appConfig = require('../../../../configs/app.config');
const { updateUser } = require('../../../data-access/v2/users');

module.exports = async (payload, userId) => {
    try {
        const decodedToken = verify(payload.otpHash, appConfig.jwt.secret);
        const isOtpMatched = await compareHash(payload.otp, decodedToken.otp);

        if (!isOtpMatched) {
            return;
        }

        return updateUser(userId, {
            email: decodedToken.email
        });
    } catch (error) {
        return;
    }
};