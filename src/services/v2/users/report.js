const { submitReport } = require("../../../data-access/v2/users");

module.exports = async (userId, data, type, targetId, category) => {
    return await submitReport(userId, { ...data, type, targetId, category });
};