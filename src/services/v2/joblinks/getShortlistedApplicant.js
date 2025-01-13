const {
  getFacesShortlistedApplicant,
  getCrewShortlistedApplicant,
} = require("../../../data-access/v2/joblinks");

module.exports = async (selfMasterId, jobId, jobType, page) => {
  switch (jobType) {
    case "faces":
      return await getFacesShortlistedApplicant(selfMasterId, jobId, page);
      break;
    case "crew":
      return await getCrewShortlistedApplicant(selfMasterId, jobId, page);
      break;
    default:
      return;
      break;
  }
};
