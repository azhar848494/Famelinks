const {
  getApplicantsFacesBySearch,
  getApplicantsCrewBySearch,
} = require("../../../data-access/v2/joblinks");

module.exports = async (selfMasterId, jobId,jobType, name, age, gender, complexion,eyeColor,weight, height,bust, waist, hip, experienceLevel, page) => {
  switch (jobType) {
    case "faces":
      return await getApplicantsFacesBySearch(
        selfMasterId,
        jobId,
        name,
        age,
        gender,
        complexion,
        eyeColor,
        weight,
        height,
        bust,
        waist,
        hip,
        page
      );
      break;
    case "crew":
      return await getApplicantsCrewBySearch(selfMasterId, jobId, experienceLevel, page);
      break;
    default:
      return;
      break;
  };
};
