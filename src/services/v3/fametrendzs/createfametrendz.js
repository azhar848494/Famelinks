const { createfametrendz, updateSuggestiontrendz } = require("../../../data-access/v3/fametrendzs");

module.exports = async (payload) => {
  if (payload.suggestionId) {
    await updateSuggestiontrendz(payload.suggestionId, { pickerId: payload.sponsor });
  }
  return await createfametrendz(payload);
};
