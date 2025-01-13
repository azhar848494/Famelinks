const { getShortlistedJobs } = require("../../../data-access/v2/joblinks");

module.exports = async (page, joblinksId, masterId) => {
  return await getShortlistedJobs(page, joblinksId, masterId);
};
