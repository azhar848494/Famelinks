const { getSavedTalents } = require("../../../data-access/v2/joblinks");

module.exports = async (page, joblinksId, masterId) => {
  return await getSavedTalents(page, joblinksId, masterId);
};
