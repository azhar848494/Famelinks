const { getAllJobCategories } = require("../../../data-access/v2/joblinks")

module.exports = async (jobType) => {
  return await getAllJobCategories(jobType);
};