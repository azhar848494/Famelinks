const { createHiringProfile } = require("../../../data-access/v2/users");

module.exports = async (data) => {
  return await createHiringProfile(data);
};
