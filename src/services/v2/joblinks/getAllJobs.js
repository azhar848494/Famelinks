const { getAllJobs } = require("../../../data-access/v2/joblinks");

module.exports = async (page, joblinksId, masterId) => {
  return await getAllJobs(page, joblinksId, masterId);
};
