const { deleteSuggestionTrendz } = require("../../../data-access/v3/fametrendzs");

module.exports = async (trendzId) => {
  return await deleteSuggestionTrendz(trendzId);
};
