const serializeHttpResponse = require("../../../helpers/serialize-http-response");

module.exports = async (request) => {
  let masterUserId = request.params.masterUserId;
  let linkType = request.params.linkType;
  let jobType = request.body.jobType;

  if (request.user._id != masterUserId) {
    return serializeHttpResponse(500, {
      message: `Permission denied. Cannot update other user profile`,
    });
  }

  if (request.body.clubCategory && request.body.clubCategory.length > 3) {
    return serializeHttpResponse(400, {
      message: 'Maximum 3 club categories can be selected'
    })
  }

  const updateChildProfile = require("../../../services/v2/users/updateChildProfile");

  if (request.files) {
    if (request.files.profileImage) {
      request.body.profileImage = request.files.profileImage;
    }
    if (request.files.profileImageX50) {
      request.body.profileImageX50 = request.files.profileImageX50;
    }
    if (request.files.profileImageX300) {
      request.body.profileImageX300 = request.files.profileImageX300;
    }
  }
  
  let result = await updateChildProfile(
    masterUserId,
    linkType,
    jobType,
    request.body
  );

  if (!result) {
    return serializeHttpResponse(500, {
      message: `Failed to update ${linkType} user profile`,
    });
  }

  return serializeHttpResponse(200, {
    message: `${linkType} user profile updated`,
    result,
  });
};
