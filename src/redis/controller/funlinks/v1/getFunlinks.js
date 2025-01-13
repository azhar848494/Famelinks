const getFunlinks = require('../../../service/funlinks/v1/getFunlinks')
const { isValidObjectId } = require('../../../../utils/db')

module.exports = async (request, response, next) => {
    try {
        let page = request.query.page
        let childProfileId = request.user.profileFunlinks

        if (!isValidObjectId(childProfileId)) {
            return response.status(400).json({ message: 'Invalid user id' })
        }

        page = page ? page : 1

        let result = await getFunlinks(childProfileId, page)

        if (!result) {
            next()
        } else {
            result = JSON.parse(result)
            return response
                .status(200)
                .json({ message: 'FunLinks Fetched', result: result, success: true })
        }
    }
    catch (error) {
        console.log(error)
        next()
    }
}