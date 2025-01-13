
const { getProfileFaces, getProfileCrew } = require("../../../data-access/v2/joblinks")
const { getOneUser } = (require("../../../data-access/v2/users"))

module.exports = async (userId, jobType) => {
    let result = await getOneUser(userId)

    if (!result) { return }

    switch (jobType) {
        case 'faces':
            result = await getProfileFaces(result.profileJobLinksFaces)
            if (result.length == 0) { return }
            return result
            break;
        case 'crew':
            result = await getProfileCrew(result.profileJobLinksCrew)
            if (result.length == 0) { return }
            return result
            break;
        default: return
            break;
    }
}