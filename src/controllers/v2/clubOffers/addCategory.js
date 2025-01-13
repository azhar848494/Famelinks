const serializeHttpResponse = require('../../../helpers/serialize-http-response')
const addCategory = require('../../../services/v2/clubOffers/addCategory')

module.exports = async (request) => {
    let name = request.body.name

    let temp = name.replace(/ /g, "");
    let splitTemp = temp.split("");
    if (splitTemp[0] == '#') {
        splitTemp[1] = splitTemp[1].toUpperCase();
    } else {
        splitTemp[0] = splitTemp[0].toUpperCase();
        splitTemp = ['#'].concat(splitTemp)
    }
    temp = splitTemp.join("");


    let result = await addCategory(temp)
    if (!result) {
        return serializeHttpResponse(500, {
            message: 'Failed to add new club category'
        })
    }

    return serializeHttpResponse(200, {
        message: 'Added new club category'
    })
}