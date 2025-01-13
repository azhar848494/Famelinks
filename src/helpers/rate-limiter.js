const serializeHttpResponse = require("./serialize-http-response");
const expressRateLimit = require('express-rate-limit');

module.exports = (limitPerDay) => {
    return expressRateLimit({
        windowMs: 1 * 60 * 1000,
        max: limitPerDay,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (request, response, next, options) =>
            next(serializeHttpResponse(options.statusCode, {
                message: options.message
            }))
    });
};