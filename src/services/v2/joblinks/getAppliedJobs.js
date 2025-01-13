const { getAppliedJobs } = require("../../../data-access/v2/joblinks");

module.exports = async (page, joblinksId, masterId) => {
  return await getAppliedJobs(page, joblinksId, masterId);
};
