const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const createHiringProfileCrew = require("../../../services/v2/joblinks/createHiringProfileCrew");
const { updateProfileJoblinks } = require("../../../data-access/v2/users")

module.exports = async (request) => {

  let result;
  let payload = request.body;

  payload.type = "crew"

  payload.userId = request.user._id;

  result = await createHiringProfileCrew(payload);

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Failed to create hiring profile for Behind the Scenes",
    });
  }

  //Match with users' hiring profile and send notifications to those users
  if(result){
      let updateObj = {};
      updateObj.profileCrew = result._id;
      await updateProfileJoblinks(request.user._id, updateObj);
  }

  return serializeHttpResponse(200, {
    message: "hiring profile for Behind the Scenes created successfuly",
    result,
  });


};
