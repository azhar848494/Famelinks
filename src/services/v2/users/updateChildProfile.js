const { getProfileFamelinks,
    getProfileFollowlinks,
    getProfileFunlinks,
    getStorelinks,
    getSelfCollablinks,
    updateProfileFamelinks,
    updateProfileFollowlinks,
    updateProfileFunlinks,
    updateStorelinks,
    updateCollablinks,
    getOneUser,
    getAgencyProfileJoblinks,
    getBrandProfileJoblinks,
    getProfileJoblinks,
    updateProfileJoblinks } = require('../../../data-access/v2/users')

module.exports = async (userId, linkType, jobType, data) => {
    let result = await getOneUser(userId)

    if (!result) { return }

    let childProfile

    switch (linkType) {
        case 'famelinks':
            childProfile = await getProfileFamelinks(userId)
            if (childProfile.length > 0 && !childProfile[0].isRegistered) { data.isRegistered = true }
            return await updateProfileFamelinks(userId, data)
            break;
        case 'followlinks':
            childProfile = await getProfileFollowlinks(userId)
            if (childProfile.length > 0 && !childProfile[0].isRegistered) { data.isRegistered = true }
            return await updateProfileFollowlinks(userId, data)
            break;
        case 'funlinks':
            childProfile = await getProfileFunlinks(userId)
            if (childProfile.length > 0 && !childProfile[0].isRegistered) { data.isRegistered = true }
            return await updateProfileFunlinks(userId, data)
            break;
        case 'joblinks':
            if (result.type == 'brand') {
                childProfile = await getBrandProfileJoblinks(userId)
                if (childProfile.length > 0 && !childProfile[0].isRegistered) { data.isRegistered = true }
            }

            if (result.type == 'agency') {
                childProfile = await getAgencyProfileJoblinks(userId)
                if (childProfile.length > 0 && !childProfile[0].isRegistered) { data.isRegistered = true }
            }

            childProfile = await getProfileJoblinks(userId)
            if (childProfile.length > 0 && !childProfile[0].isRegistered) { data.isRegistered = true }

            return await updateProfileJoblinks(userId, data)
            break;
        case 'storelinks':
            childProfile = await getStorelinks(userId)
            if (childProfile.length > 0 && !childProfile[0].isRegistered) { data.isRegistered = true }
            return await updateStorelinks(userId, data)
            break;
        case 'collablinks':
            childProfile = await getSelfCollablinks(userId)
            if (childProfile.length > 0 && !childProfile[0].isRegistered) { data.isRegistered = true }
            return await updateCollablinks(userId, data)
            break;
        default: return
    }
}