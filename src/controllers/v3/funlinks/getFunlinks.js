const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const getFunlinksService = require('../../../services/v3/funlinks/getFunlinks')
const getFunlinksRedis = require('../../../redis/service/funlinks/v1/getFunlinks')
const { setExpiryData } = require('../../../redis/data-access/v1/cacheData')

module.exports = async (request) => {
    let page = request.query.page
    let funlinksDate = request.query.funlinksDate
    let funlinks = request.query.funlinks

    let location = request.user.location ? request.user.location : '*'
    let ageGroup = request.user.ageGroup ? request.user.ageGroup : '*'
    let gender = request.user.gender ? request.user.gender : '*'
    funlinksDate = funlinksDate ? funlinksDate : '*'
    funlinks = funlinks ? funlinks : '*'

    let blockList = request.user.blockList

    blockList = blockList.map((userId) => userId.toString())

    page = page ? page : 1

    let result

    let key = 'funlinks'
    key += '-' + location.toString()
    key += '-' + ageGroup.toString()
    key += '-' + gender.toString()
    key += '-' + funlinksDate.toString()
    key += '-' + funlinks.toString()
    key += '-' + page.toString()

    result = await getFunlinksRedis(key)

    if (result) {
        result = JSON.parse(result)
    }

    if (!result) {
        result = await getFunlinksService(page, location, ageGroup, gender, funlinksDate, funlinks)

        await setExpiryData(key, result, 600)
    }

    result = result.filter((funlink) => {
        if (funlink.user && (!blockList.includes(funlink.user._id.toString()))) {
            return funlink
        }
    })

    return serializeHttpResponse(200, {
        message: 'FunLinks Fetched',
        result
    })
}