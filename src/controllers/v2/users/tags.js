const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const tagsService = require('../../../services/v2/users/tags')
const { isValidObjectId } = require('../../../utils/db');
const getOneUserService = require('../../../services/v2/users/getOneUser')

module.exports = async (request) => {
    let postId = request.params.postId
    let action = request.params.action

    if (!isValidObjectId(postId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid post Id'
        });
    }

    let result = await getOneUserService(request.user._id)

    if(!result){
        return serializeHttpResponse(400, {
            message: 'User not found'
        })
    }

    let profileId

    switch (result.type) {
      case "individual":
        profileId = result._id;
        break;
      case "brand":
        profileId = result._id;
        break;
      default :
        profileId = result.profileCollablinks;
        break;
    }

    result = await tagsService(profileId, postId, action)

    if (!result) {
        return serializeHttpResponse(200, {
            message: `${action} unsuccessful`
        })
    }

    return serializeHttpResponse(200, {
        message: `${action} successful`
    })
}