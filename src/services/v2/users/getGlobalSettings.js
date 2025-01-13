const { getGlobalSettings } = require("../../../data-access/v2/users");

module.exports = () => {
    return getGlobalSettings();
};