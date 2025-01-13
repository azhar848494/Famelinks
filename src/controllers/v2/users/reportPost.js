const { getOnePost: getFamelinksPost } = require("../../../data-access/v2/famelinks");
const { getOnePost: getFunlinksPost } = require("../../../data-access/v2/funlinks");
const { getOnePost: getFollowlinksPost } = require("../../../data-access/v2/followlinks");
const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const reportService = require('../../../services/v2/users/report');
const { isValidObjectId } = require("../../../utils/db");
const checkJob = require('../../../services/v2/joblinks/checkJob')

module.exports = async (request) => {
    if (!isValidObjectId(request.params.mediaId)) {
        return serializeHttpResponse(400, {
            message: 'Invalid Post'
        });
    }

    const famelinks = await getFamelinksPost(request.params.mediaId);
    const funlinks = await getFunlinksPost(request.params.mediaId);
    const followlinks = await getFollowlinksPost(request.params.mediaId);
    const joblinks = await checkJob(request.params.mediaId)

    let type;

    if (famelinks) {
        type = 'famelinks';
    } else if (funlinks) {
        type = 'funlinks';
    } else if (followlinks) {
        type = 'followlinks';
    } else if (joblinks && joblinks.length != 0) {
        type = 'joblinks'
    } else {
        return serializeHttpResponse(404, {
            message: 'Post not found'
        });
    }
    await reportService(request.user._id, { body: request.body.body }, type, request.params.mediaId, request.body.type);

    return serializeHttpResponse(200, {
        message: 'Post Reported'
    });
};