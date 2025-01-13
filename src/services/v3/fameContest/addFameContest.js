const { addFameContest } = require("../../../data-access/v3/fametrendzs");

module.exports = async (payload) => {
  return await addFameContest(payload);
};
