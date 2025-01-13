const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const fameCoinService = require("../../../services/v2/users/fameCoins");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const UserDB = require("../../../models/v2/users");
const { getUserProfileFamelinks } = require("../../../data-access/v2/users")

module.exports = async (request) => {
  await fameCoinService(
    request.body.toUserId,
    request.body.fameCoins,
    request.user._id
  );
  return serializeHttpResponse(200, {
    message: "FameCoins Given Successfully",
  });
};
