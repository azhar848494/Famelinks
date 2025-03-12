const { getChannelGrid } = require("../../../data-access/v2/channels");

module.exports = (data) => {
  return getChannelGrid(data);
};
