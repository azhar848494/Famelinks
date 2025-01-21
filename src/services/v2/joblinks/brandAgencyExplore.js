const { brandAgencyExplore, getSavedTalents } = require('../../../data-access/v2/joblinks')

module.exports = async (data) => {
    let profiles = []
    let savedTalents = []

    profiles = await brandAgencyExplore(data)
    savedTalents = await getSavedTalents(data)

    savedTalents = savedTalents[0].savedTalents

    return { profiles: profiles, savedTalents: savedTalents }
}