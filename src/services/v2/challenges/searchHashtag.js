const { getbrandHashTagBySearch } = require("../../../data-access/v2/challenges");

module.exports = async (searchData) => {
  let result = await getbrandHashTagBySearch(searchData);
  if (result && result.length > 0) {
    return result;
  }
  return result;
};
