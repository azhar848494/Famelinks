const { checkBrandVisit, createBrandVisit, updateBrandVisit } = require('../../../data-access/v2/users')

module.exports = async (profileId, type, brandId) => {
    let lastVisited = new Date()
    let visit = await checkBrandVisit(profileId, type, brandId)

    if (visit && visit.length == 0) {
        let count = 1
        return await createBrandVisit({ profileId, type, brandId, lastVisited, count })
    }

    visit[0].count = visit[0].count + 1

     await updateBrandVisit(visit[0]._id, visit[0])
    return visit
}