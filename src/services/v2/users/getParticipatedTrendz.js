const { getParticipatedTrendz } = require("../../../data-access/v2/challenges");

module.exports = async (data) => {
  return await getParticipatedTrendz(data);
};
