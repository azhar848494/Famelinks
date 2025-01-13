const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const {getFamelinksService, getUserService} = require('../../../services/v3/famelinks/getFamelinks')
// const getFamelinksService = require('../../../services/v3/famelinks/getFamelinks')
const getFamelinksRedis = require('../../../redis/service/famelinks/v1/getFamelinks')
const { setExpiryData } = require('../../../redis/data-access/v1/cacheData')

exports.getUserController = async (request) => {
    let id = request.body.id

    let result = await getUserService(id)

    return serializeHttpResponse(200, {
        message: 'Famelinks status fetched successfuly',
        result
    })
}

exports.getFamelinksController = async (request) => {
    let page = request.query.page
    let famelinksDate = request.query.famelinksDate
    let famelinks = request.query.famelinks

    let location = request.user.location ? request.user.location : '*'
    let ageGroup = request.user.ageGroup ? request.user.ageGroup : '*'
    let gender = request.user.gender ? request.user.gender : '*'
    famelinksDate = famelinksDate ? famelinksDate : '*'
    famelinks = famelinks ? famelinks : '*'

    let blockList = request.user.blockList

    blockList = blockList.map((userId) => userId.toString())

    page = page ? page : 1

    let result

    let key = 'famelinks'
    key += '-' + location.toString()
    key += '-' + ageGroup.toString()
    key += '-' + gender.toString()
    key += '-' + famelinksDate.toString()
    key += '-' + famelinks.toString()
    key += '-' + page.toString()

    result = await getFamelinksRedis(key)

    if (result) {
        result = JSON.parse(result)
    }

    if (!result) {
        result = await getFamelinksService(page, location, ageGroup, gender, famelinksDate, famelinks)

        await setExpiryData(key, result, 600)
    }

    result = result.filter((famelink) => {
        if (famelink.user && (!blockList.includes(famelink.user._id.toString()))) {
            return famelink
        }
    })

    return serializeHttpResponse(200, {
        message: 'FameLinks Fetched',
        result
    })
}
