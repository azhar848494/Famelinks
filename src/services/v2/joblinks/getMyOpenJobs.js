const { getMyOpenJobs } = require("../../../data-access/v2/joblinks");

module.exports = async (joblinksId, page, userId, typeObj) => {
  return await getMyOpenJobs(joblinksId, page, userId, typeObj);
};
