const { updateCommentLikeCounter } = require("../../../data-access/v2/comments");
const famelinks = require("../../../data-access/v2/famelinks");
const funlinks = require("../../../data-access/v2/funlinks");
const followlinks = require("../../../data-access/v2/followlinks");
const { deleteLike } = require("../../../data-access/v2/likes");
const { updateUserLikesCount } = require("../../../data-access/v2/users");

module.exports = async (childProfileId, postOwnerId, mediaId, postType) => {
    const result = await deleteLike(childProfileId, mediaId);
    if (result && (result.status == null)) {
        return;
    }

    let updatePostLikeCounter;
    let resultProperty;

    switch (postType) {
        case 'famelinks':
            updatePostLikeCounter = famelinks.updatePostLikeCounter;
            if (result) {
                resultProperty = `profileFamelinks.likes${result.status}Count`;
            }
            break;
        case 'funlinks':
            updatePostLikeCounter = funlinks.updatePostLikeCounter;
            resultProperty = `profileFunlinks.likesCount`;
            break;
        case 'followlinks':
            updatePostLikeCounter = followlinks.updatePostLikeCounter;
            resultProperty = `profileFollowlinks.likesCount`;
            break;
    }

    const obj = {
        [resultProperty]: -1
    };

    if (result) {
        switch (result.status) {
            case 0:
            case 1:
            case 2:
                await updatePostLikeCounter(mediaId, obj);
                if (postType == 'famelinks') {
                    return updateUserLikesCount(postOwnerId, obj);
                }
                return;
            case 3:
                return updateCommentLikeCounter(mediaId, -1);
            default:
                return;
        }
    }
    return;
};