const {
  getSotedApplicantsFaces,
  getSortedApplicantsCrew,
} = require("../../../data-access/v2/joblinks");

module.exports = async (selfMasterId, jobId, jobType, page, sort) => {
  switch (jobType) {
    case "faces":
      return await getSotedApplicantsFaces(selfMasterId, jobId, page, sort);
      break;
    case "crew":
      return await getSortedApplicantsCrew(selfMasterId, jobId, page, sort);
      break;
    default:
      return;
      break;
  }
};
