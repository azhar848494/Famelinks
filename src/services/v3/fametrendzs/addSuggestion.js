const { addTrendzSuggestion } = require("../../../data-access/v3/fametrendzs");

module.exports = async (payload) => {
  return await addTrendzSuggestion(payload);
};
