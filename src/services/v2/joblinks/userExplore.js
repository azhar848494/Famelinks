const {
  userExplore,
  getSavedTalents,
} = require("../../../data-access/v2/joblinks");

module.exports = async (page, joblinksId, masterId) => {
    let jobs = []
    let savedTalents;

    jobs = await userExplore(page, joblinksId, masterId)
     savedTalents = await getSavedTalents(page, joblinksId);

     savedTalents = savedTalents[0].savedTalents;

     return { jobs: jobs, savedTalents: savedTalents };


}