const { getTrendzSuggestions, getMyTrendzSuggestions } = require("../../../data-access/v3/fametrendzs");

module.exports = async (page, userId, type) => {
  if (type == 'individual') {
    return await getMyTrendzSuggestions(page, userId);
  } else {
    return await getTrendzSuggestions(page, userId);
  }
};
