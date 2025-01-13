const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const { isValidObjectId } = require("../../../utils/db");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const removeProfileImageService = require("../../../services/v2/users/removeProfileImage");
const {
  getCollablinksProfile,
  getJoblinksProfile,
  getFunlinksProfile,
  getFollowlinksProfile,
  getFamelinksProfile,
  getStorelinksProfile,
  updateFamelinksImage,
  updateFunlinksImage,
  updatejoblinksImage,
  updateStorelinksImage,
  updateCollablinksImage,
  updateFollowlinksImage,
} = require("../../../data-access/v2/users");

module.exports = async (request) => {
  let masterId = request.query.masterId;
  let profileId = request.query.profileId;
  profileId = profileId ? profileId : "*";

  if (masterId) {
    if (!isValidObjectId(masterId)) {
      return serializeHttpResponse(400, {
        message: "Invalid masterId",
      });
    }
    if(masterId != request.user._id){
      return serializeHttpResponse(400, {
        message: "permisision Denied",
      });
    }
    const user = await getOneUserService(masterId);
    if (!user) {
      return serializeHttpResponse(200, {
        message: "user Not found",
      });
    }
  }

  if (profileId != "*") {
    let profileFamelinks = await getFamelinksProfile(profileId);
    if (profileFamelinks != null) {
      await updateFamelinksImage(profileId);
    }
    let profileFunlinks = await getFunlinksProfile(profileId);
    if (profileFunlinks != null) {
      await updateFunlinksImage(profileId);
    }
    let profileFollowlinks = await getFollowlinksProfile(profileId);
    if (profileFollowlinks != null) {
      await updateFollowlinksImage(profileId);
    }

    let profileJoblinks = await getJoblinksProfile(profileId);
    if (profileJoblinks != null) {
      await updatejoblinksImage(profileId);
    }

    let profileStorelinks = await getStorelinksProfile(profileId);
    if (profileStorelinks != null) {
      await updateStorelinksImage(profileId);
    }

    let profileCollablinks = await getCollablinksProfile(profileId);
    if (profileCollablinks != null) {
      await updateCollablinksImage(profileId);
    }
  }
  if (profileId == "*") {
    await removeProfileImageService(masterId);
  }
  return serializeHttpResponse(200, {
    message: "profile Image Removed",
  });
};
