const appConfig = require('../../configs/app.config');
const { verify } = require('../utils/jwt');
const serializeHttpResponse = require('./serialize-http-response');
const getOneUserService = require('../services/v1/users/getOneUser');
const getGlobalSettingsService = require('../services/v1/users/getGlobalSettings');

module.exports = async (request, response, next) => {
    try {
        if (
            request.path !== '/users/login' &&
            request.path !== '/users/verifyOtp' &&
            request.path !== '/users/login/google' &&
            request.path !== '/users/login/googleRedirect' &&
            request.path !== '/users/login/email' &&
            request.path !== '/users/login/apple' &&
            request.path !== '/users/report/issue' &&
            request.path !== '/location/country-code'
        ) {
            if (!request.headers.authorization) {
                return next(serializeHttpResponse(401, {
                    message: 'No Authorization Token was found'
                }));
            }
            const decoded = verify(request.headers.authorization, appConfig.jwt.secret);

            if (!decoded._id) {
                return next(serializeHttpResponse(401, {
                    message: 'Invalid Token'
                }));
            }

            const user = await getOneUserService(decoded._id);
            const settings = await getGlobalSettingsService();
            if (!user) {
                return next(serializeHttpResponse(401, {
                    message: 'Invalid Token'
                }));
            }
            request.settings = settings;
            request.user = user;
            return next();
        }
        return next();
    } catch (error) {
        return next(serializeHttpResponse(401, {
            message: error.message.replace(/"/g, '')
        }));
    }
};