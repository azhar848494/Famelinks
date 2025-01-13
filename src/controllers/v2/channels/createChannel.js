const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const createChannel = require('../../../services/v2/channels/createChannel')

module.exports = async (request) => {
    let channelName = request.body.name

    if (!channelName || channelName == '') {
        return serializeHttpResponse(400, {
            message: 'Enter channel name'
        })
    }

    let temp = channelName.replace(/ /g, "").toLowerCase();
    let splitTemp = temp.split("");
    if (splitTemp[0] == '#') {
        splitTemp[1] = splitTemp[1].toUpperCase();
    } else {
        splitTemp[0] = splitTemp[0].toUpperCase();
        splitTemp = ['#'].concat(splitTemp)
    }
    temp = splitTemp.join("");

    let result = await createChannel({ name: temp })

    if (!result) {
        return serializeHttpResponse(500, {
            message: ' Failed to create channel'
        })
    }

    return serializeHttpResponse(200, {
        message: 'Channel created successfuly',
        result
    })
}