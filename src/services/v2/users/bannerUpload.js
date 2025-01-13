const { bannerUpload } = require('../../../data-access/v2/users');

module.exports = async (profileId, files) => {
    return await bannerUpload(profileId, files);
};