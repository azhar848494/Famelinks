const bcrypt = require('bcrypt');

const appConfig = require('../../configs/app.config');

exports.compareHash = (data, hash) => {
    return bcrypt.compare(data.toString(), hash);
};

exports.generateHash = (data) => {
    return bcrypt.hash(data.toString(), appConfig.crypt.salt);
};