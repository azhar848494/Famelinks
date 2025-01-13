const { addFunChallenge } = require("../../../data-access/v2/challenges");

module.exports = async (payload) => {
  return await addFunChallenge(payload);
};
