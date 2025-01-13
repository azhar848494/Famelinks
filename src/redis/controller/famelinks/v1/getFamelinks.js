const getFamelinks = require('../../../service/famelinks/v1/getFamelinks')
const { isValidObjectId } = require('../../../../utils/db')

module.exports = async (request, response, next) => {
    try {
        let page = request.query.page
        let childProfileId

        switch (request.user.type) {
            case 'brand':
                childProfileId = request.user.profileStorelinks
                break;
            case 'agency':
                childProfileId = request.user.profileCollablinks
                break;
            default:
                childProfileId = request.user.profileFamelinks
                break;
        }

        if (!isValidObjectId(childProfileId)) {
            return response.status(400).json({ message: 'Invalid user id' })
        }

        page = page ? page : 1

        let result = await getFamelinks(childProfileId, page)
        
        if (!result) {
            next()
        } else {
            result = JSON.parse(result)
            return response
                .status(200)
                .json({ message: 'FameLinks Fetched', result: result, success: true })
        }
    }
    catch (error) {
        console.log(error)
        next()
    }
}