const { getJobInvites } = require("../../../data-access/v2/joblinks");

module.exports = async (page, joblinksId, masterId) => {
  return await getJobInvites(page, joblinksId, masterId);
};
