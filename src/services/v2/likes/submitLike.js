const { updateCommentLikeCounter } = require("../../../data-access/v2/comments");
const famelinks = require("../../../data-access/v2/famelinks");
const funlinks = require("../../../data-access/v2/funlinks");
const followlinks = require("../../../data-access/v2/followlinks");
const collablinks = require("../../../data-access/v3/collablinks");
const { submitLike } = require("../../../data-access/v2/likes");
const { updateUserLikesCount } = require('../../../data-access/v2/users');

module.exports = async (childProfileId, postOwnerId, mediaId, status, postType) => {
    const result = await submitLike(childProfileId, mediaId, status);
    
    let updatePostLikeCounter;
    let property, resultProperty;

    switch (postType) {
      case "famelinks":
        updatePostLikeCounter = famelinks.updatePostLikeCounter;
        property = `profileFamelinks.likes${status}Count`;
        if (result) {
          resultProperty = `profileFamelinks.likes${result.status}Count`;
        }
        break;
      case "funlinks":
        updatePostLikeCounter = funlinks.updatePostLikeCounter;
        property = `profileFunlinks.likesCount`;
        resultProperty = `profileFunlinks.likesCount`;
        break;
      case "followlinks":
        updatePostLikeCounter = followlinks.updatePostLikeCounter;
        property = `profileFollowlinks.likesCount`;
        resultProperty = `profileFollowlinks.likesCount`;
        break;
      case "collablinks":
        return collablinks.updatePostLikeCounter(mediaId, 1);
        break;
    }

    const obj = {
        [property]: 1
    };

    if (result && (result.status + 1)) {
        obj[resultProperty] = -1;
    }

    switch (status) {
        case 0:
        case 1:
        case 2:
            let resultUpdate = await updatePostLikeCounter(mediaId, obj);
            if (postType == 'famelinks') {
                // -----------------------------v1-------------------------//
                // return updateUserLikesCount(postOwnerIdorPostId, obj); 
                // -----------------------------v1-------------------------//

                // -----------------------------v2-------------------------//
                let updateResult = await updateUserLikesCount(postOwnerId, obj);

                // Calculation of hearts can be done dynamically whenever requested.
                // No need to save it.

                // let updateObj = { hearts: 0 }
                // updateObj.hearts = (user[0].likes1Count) + (2 * user[0].likes2Count)
                // updateResult = await updateProfile(user[0].profileFamelinks, updateObj)
                // console.log(updateResult)
                return updateResult

                // -----------------------------v2-------------------------//
            }
            return;
        case 3:
            return updateCommentLikeCounter(mediaId, 1);
    }
};