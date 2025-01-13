const { getSavedJobs } = require("../../../data-access/v2/joblinks");

module.exports = async (page, joblinksId, masterId) => {
  return await getSavedJobs(page, joblinksId, masterId);
};
