const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const updateUserPrivacy = require('../../../services/v2/users/updatePrivacy');
const getOneUserService = require('../../../services/v2/users/getOneUser');
const { isValidObjectId } = require('../../../utils/db');

module.exports = async (request) => {
    let action = request.query.action;

    if (!isValidObjectId(request.user._id)) {
        return serializeHttpResponse(400, {
            message: 'Invalid User Id'
        });
    }

    const result = await getOneUserService(request.user._id);

    if (!result) {
        return serializeHttpResponse(200, {
            message: 'User not found'
        });
    }

    await updateUserPrivacy(request.user._id, action);
    
    return serializeHttpResponse(200, {
        message: 'Privacy Updated'
    });
};