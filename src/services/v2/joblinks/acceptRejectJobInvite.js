const { acceptRejectJobInvite } = require("../../../data-access/v2/joblinks");

module.exports = async (jobId, selfId, userId, action, jobType) => {
  return await acceptRejectJobInvite(jobId, selfId, userId, action, jobType);
};
