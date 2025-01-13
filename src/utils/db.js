const { isValidObjectId } = require("mongoose");

exports.isValidObjectId = (objectId) => {
    if (!objectId) {
        return false;
    }
    return isValidObjectId(objectId);
};