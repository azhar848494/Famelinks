const { getNewTalents } = require("../../../data-access/v2/joblinks");

module.exports = async (page, masterId, joblinksId) => {
    return await getNewTalents(page, masterId, joblinksId);
}