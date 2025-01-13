const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const addJobCategory = require("../../../services/v2/joblinks/addJobCategory")

module.exports = async (request) => {
    const result = await addJobCategory(request.body)
    if (!result) {
        return serializeHttpResponse(500, {
            message: "Failed to add new job details",
        });
    }

    return serializeHttpResponse(200, {
        message: "New Job category added successfuly",
        result
    });
}