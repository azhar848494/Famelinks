const { bannerDelete } = require('../../../data-access/v2/users');

module.exports = async (profileId, file) => {
    return bannerDelete(profileId, file);
};