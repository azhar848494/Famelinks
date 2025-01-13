const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const accountSuspend = require('../../../services/v2/users/accountSuspend')
const accountRestoreDelete = require('../../../services/v2/users/accountRestoreDelete')
const getOneUserService = require('../../../services/v2/users/getOneUser')

module.exports = async (request) => {
    let action = request.body.action
    let result

    if (!action) {
        return serializeHttpResponse(400, {
            message: 'Please state whether to suspend, delete or restore the user account'
        })
    }

    let user = await getOneUserService(request.user._id)

    if (!user) {
        return serializeHttpResponse(400, {
            message: 'Requested user does not exist'
        })
    }

    if (action == 'suspend' && (user.isDeleted || user.deleteDate != null)) {
        return serializeHttpResponse(400, {
            message: `This account is already deleted. Cannot suspend deleted account`
        })
    }

    if (action == 'suspend' && user.isSuspended) {
        return serializeHttpResponse(400, {
            message: 'This account is already suspended'
        })
    }

    if (action == 'restore' && (user.isDeleted == false && user.deleteDate == null)) {
        return serializeHttpResponse(400, {
            message: 'This account is already restored and is active'
        })
    }

    if (action == 'delete' && (user.isDeleted == true && user.deleteDate != null)) {
        return serializeHttpResponse(400, {
            message: 'This account is already deleted'
        })
    }

    if (action == 'suspend') {
        result = await accountSuspend(request.user._id)
    }

    if (action == 'delete') {
        result = await accountRestoreDelete(request.user._id, action)
    }

    if (action == 'restore') {
        result = await accountRestoreDelete(request.user._id, action)
    }

    if (!result) {
        return serializeHttpResponse(500, {
            message: `Failed to ${action} user account`
        })
    }

    return serializeHttpResponse(200, {
        message: '',
        result
    })
}