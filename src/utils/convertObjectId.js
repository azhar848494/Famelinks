const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const serializeHttpResponse = require("../helpers/serialize-http-response");

module.exports = (id) => {
    if (mongoose.Types.ObjectId.isValid(id)) {
        return mongoose.Types.ObjectId(id);
    }
    return id;
};
