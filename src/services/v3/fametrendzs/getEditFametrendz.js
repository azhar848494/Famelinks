const { getEditFametrendz } = require("../../../data-access/v2/challenges");

module.exports = async (id) => {
  return await getEditFametrendz(id);
};
