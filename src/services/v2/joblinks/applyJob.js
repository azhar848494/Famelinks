const {
  createJobApplication,
  updateSavedJobs,
} = require("../../../data-access/v2/joblinks");

module.exports = async (userId, jobId, jobType) => {
  let jobApplied = await createJobApplication(userId, jobId, jobType);

  if (!jobApplied) {
    return;
  }

  return jobApplied;
};
