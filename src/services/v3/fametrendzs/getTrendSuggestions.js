const { getTrendzSuggestions } = require("../../../data-access/v3/fametrendzs");

module.exports = async (page, userId) => {
  return await getTrendzSuggestions(page, userId);
};
