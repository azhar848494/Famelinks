const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const addPostService = require("../../../services/v3/collablinks.js/addPost");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const { getUserByTag } = require("../../../data-access/v2/users");

//-----------------------v2-----------------------//
const getCollablinksProfile = require("../../../services/v2/users/getChildProfile");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const {
  updateUser,
  addAgencyTags,
  updateAgencyTag,
  getAgencyTag,
} = require("../../../data-access/v2/users");
//-----------------------v2-----------------------//

module.exports = async (request) => {
  let agencyTags = request.body.agencyTags;
  let profileCollablinks = request.user.profileCollablinks;

  if (!profileCollablinks) {
    return serializeHttpResponse(500, {
      message: "collablinks profile of requested user not found",
    });
  }
  //-----------------------v2-----------------------//
  let collabLinksProfile = await getCollablinksProfile(
    request.user._id,
    "collablinks",
    "self"
  );

  if (!collabLinksProfile) {
    return serializeHttpResponse(500, {
      message: "collablinks profile of requested user not found",
    });
  }

  let result = await addPostService(
    collabLinksProfile[0]._id,
    request.user,
    request.files,
    request.body,
    request.headers.authorization
  );

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Post not upload",
    });
  }

  // if (agencyTags && agencyTags.length > 0) {
  //   agencyTags = await Promise.all(
  //     agencyTags.map(async (tag) => {
  //       let user = await getUserByTag(tag);
  //       if (user) {
  //         await addAgencyTags(user._id, result._id);
  //       }
  //       return user;
  //     })
  //   );

    if (request.user.pushToken && agencyTags.length > 0) {
      agencyTags.map(async (tag) => {
        let user = await getUserByTag(tag);
          let Tag = await addAgencyTags(user._id, result._id);
        await sendNotificationsService(
          "tag",
          {
            sourceName: request.user.name,
            sourceId: request.user._id,
            sourceMedia: request.user.profileImage,
            sourceType: request.user.type,
          },
          null,
          {
            targetId: user._id,
            pushToken: user.pushToken,
            //count: onePost.commentsCount,
            userId: user._id,
            targetMedia: user.profileImage,
            category: "request",
            tagId: Tag.postId,
          },
          true,
          true
        );
      });
    }
  //}

  return serializeHttpResponse(200, {
    message: "Collablinks Added",
  });
  //-----------------------v2-----------------------//
};
