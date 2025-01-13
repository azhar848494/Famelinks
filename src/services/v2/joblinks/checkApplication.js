const { checkApplication } = require("../../../data-access/v2/joblinks");

module.exports = async (jobId, userId) => {
  return await checkApplication(jobId, userId);
};
