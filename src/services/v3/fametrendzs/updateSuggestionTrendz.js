const { updateSuggestiontrendz } = require("../../../data-access/v3/fametrendzs");

module.exports = async (trendzId, payload) => {
  return await updateSuggestiontrendz(trendzId, payload);
};
