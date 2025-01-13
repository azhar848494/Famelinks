const getFollowlinks = require('../../../service/followlinks/v1/getFollowlinks')
const { isValidObjectId } = require('../../../../utils/db')

module.exports = async (request, response, next) => {
    try {
        let page = request.query.page
        let childProfileId = request.user.profileFollowlinks

        if (!isValidObjectId(childProfileId)) {
            return response.status(400).json({ message: 'Invalid user id' })
        }

        page = page ? page : 1

        let result = await getFollowlinks(childProfileId, page)

        if (!result) {
            next()
        } else {
            result = JSON.parse(result)
            return response
                .status(200)
                .json({ message: 'FollowLinks Fetched', result: result, success: true })
        }
    }
    catch (error) {
        console.log(error)
        next()
    }
}