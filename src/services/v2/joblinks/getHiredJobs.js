const { getHiredJobs } = require("../../../data-access/v2/joblinks");

module.exports = async (page, joblinksId, masterId) => {
  return await getHiredJobs(page, joblinksId, masterId);
};
