const { brandAgencyExplore, getSavedTalents } = require('../../../data-access/v2/joblinks')

module.exports = async (search, page, joblinksId) => {
    let profiles = []
    let savedTalents

    profiles = await brandAgencyExplore(search ,page, joblinksId);
    savedTalents = await getSavedTalents(page, joblinksId)

    savedTalents = savedTalents[0].savedTalents

    return { profiles: profiles, savedTalents: savedTalents }
}