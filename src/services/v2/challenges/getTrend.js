const { getTrend } = require("../../../data-access/v2/challenges");

module.exports = (data) => {
  return getTrend(data);
};
