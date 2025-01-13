const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const getAllJobCategories = require("../../../services/v2/joblinks/getAllJobCategories")

module.exports = async (request) => {
    let jobType = request.params.jobType;

    const result = await getAllJobCategories(jobType);

    if (!result) {
        return serializeHttpResponse(500, {
            message: "Failed to fetch all types of jobs",
        });
    }

    return serializeHttpResponse(200, {
        message: "Jobs fetched successfuly",
        result
    });
}