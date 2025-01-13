const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const createHiringProfileFaces = require("../../../services/v2/joblinks/createHiringProfileFaces");
const { updateProfileJoblinks } = require("../../../data-access/v2/users");

module.exports = async (request) => {
  let result;
  let payload = request.body;
  let userId = request.user._id;

  payload.type = "faces";

  payload.userId = userId;

  result = await createHiringProfileFaces(payload);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to create hiring profile for Front Faces",
    });
  }

  //Match with users' hiring profile and send notifications to those users
  if (result) {
     let updateObj = {};
    updateObj.profileFaces = result._id
    await updateProfileJoblinks(userId, updateObj);
  }

  return serializeHttpResponse(200, {
    message: "hiring profile for Front Faces created successfuly",
    result,
  });
};
