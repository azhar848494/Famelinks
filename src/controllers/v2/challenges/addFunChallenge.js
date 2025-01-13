const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const addFunChallengeService = require('../../../services/v2/challenges/addFunChallenge');
const getOneUserService = require("../../../services/v2/users/getOneUser");
const { updateUserCoin } = require("../../../data-access/v2/users");

module.exports = async (request) => {
    let payload = request.body;
    payload.createdBy = request.user._id;

    if (request.user.type == "individual") {
        return serializeHttpResponse(400, {
            message: "only brand or agency can create fun challenge",
        });
    }

    const user = await getOneUserService(request.user._id);

    if (user.fameCoins < payload.totalCoin) {
        return serializeHttpResponse(400, {
            message: "You don't have enough balance",
        });
    }

    let result = await addFunChallengeService(payload);


    if (!result) {
        return serializeHttpResponse(500, {
            message: "Failed to create fun challenge",
        });
    }

    await updateUserCoin(request.user._id, -payload.totalCoin);

    return serializeHttpResponse(200, {
        message: "Fun challenge created successfuly",
        result,
    });
};