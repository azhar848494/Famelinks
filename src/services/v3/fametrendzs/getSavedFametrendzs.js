const { getSavedFametrendzs } = require("../../../data-access/v2/challenges");

module.exports = async (page, userId) => {
  return await getSavedFametrendzs(page, userId);
};
