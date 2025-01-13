const { deleteComment, updateCommentRepliesCounter } = require("../../../data-access/v2/comments");
const famelinksDao = require("../../../data-access/v2/famelinks");
const funlinksDao = require("../../../data-access/v2/funlinks");
const followlinksDao = require("../../../data-access/v2/followlinks");
const collablinks = require("../../../data-access/v3/collablinks");

module.exports = async (commentId, userId, postId, postType) => {
    const result = await deleteComment(commentId, userId);
    if (result.parentId) {
        return updateCommentRepliesCounter(result.parentId, -1);
    } else {
        switch (postType) {
            case 'famelinks':
                return famelinksDao.updatePostCommentCounter(postId, -1);
            case 'funlinks':
                return funlinksDao.updatePostCommentCounter(postId, -1);
            case 'followlinks':
                return followlinksDao.updatePostCommentCounter(postId, -1);
                case 'collablinks':
                    return collablinks.updatePostCommentCounter(postId, -1);
        }
    }
};