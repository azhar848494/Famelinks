const express = require('express');

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v2/followlinks');

// const { uploadFollowlinksMedia } = require('../../utils/fileUploadS3');

const { uploadFollowlinksMedia } = require('../../utils/fileUploadS3V2');

const addPostController = require('../../controllers/v2/followlinks/addPost');
const submitLikeController = require('../../controllers/v2/likes/submitLike');
const addCommentController = require('../../controllers/v2/comments/addComment');
const deleteCommentController = require('../../controllers/v2/comments/deleteComment');
const updateCommentController = require('../../controllers/v2/comments/updateComment');
const getCommentsController = require('../../controllers/v2/comments/getComments');
const getCommentRepliesController = require('../../controllers/v2/comments/getCommentReplies');
const getMyFollowLinksController = require('../../controllers/v2/followlinks/getMyFollowLinks');
const getUserFollowLinksController = require('../../controllers/v2/followlinks/getUserFollowLinks');
const getFollowLinksController = require('../../controllers/v2/followlinks/getFollowLinks');
// // const getFollowLinksController = require('../../controllers/v2/followlinks/getFollowLinks');
const deletePostController = require('../../controllers/v2/followlinks/deletePost');
const deletePostMediaController = require('../../controllers/v2/followlinks/deletePostMedia');
const updatePostController = require('../../controllers/v2/followlinks/updatePost');
const getSingleFollowLinksController = require('../../controllers/v2/followlinks/getSingleFollowLinks');
const getClubsController = require('../../controllers/v2/followlinks/getClubs')
const viewMediaController = require('../../controllers/v2/views/view')

const router = express.Router();

router.post('/followlinks/view/:mediaId', requestValidatorCallback(validator.view), expressCallback(viewMediaController, 'followlinks'))
router.post('/followlinks/like/:type/:id', requestValidatorCallback(validator.like), expressCallback(submitLikeController, 'followlinks'));
router.post('/followlinks/comment/:mediaId', requestValidatorCallback(validator.addComment), expressCallback(addCommentController, 'followlinks'));
router.post('/followlinks', uploadFollowlinksMedia, requestValidatorCallback(validator.followlinks), expressCallback(addPostController));

router.delete('/followlinks/comment/:commentId', requestValidatorCallback(validator.deleteComment), expressCallback(deleteCommentController, 'followlinks'));
router.delete('/followlinks/:postId/:mediaName', requestValidatorCallback(validator.deletePostMedia), expressCallback(deletePostMediaController));
router.delete('/followlinks/:postId', requestValidatorCallback(validator.deletePost), expressCallback(deletePostController));

router.put('/followlinks/comment/:commentId', requestValidatorCallback(validator.updateComment), expressCallback(updateCommentController, 'followlinks'));
router.put('/followlinks/:postId', requestValidatorCallback(validator.updatePost), expressCallback(updatePostController));
router.put('/followlinks/:postId/mark-safe', requestValidatorCallback(validator.markSafe), expressCallback(updatePostController));

router.get('/followlinks/comment/:commentId/replies', requestValidatorCallback(validator.getCommentReplies), expressCallback(getCommentRepliesController, 'followlinks'));
router.get('/followlinks/comment/:mediaId', requestValidatorCallback(validator.getComments), expressCallback(getCommentsController, 'followlinks'));
router.get('/followlinks/me', requestValidatorCallback(validator.getMyFollowlinks), expressCallback(getMyFollowLinksController));
router.get('/followlinks/clubs', expressCallback(getClubsController))
router.get('/followlinks/:userId', requestValidatorCallback(validator.getUserFollowlinks), expressCallback(getUserFollowLinksController));
router.get('/followlinks', requestValidatorCallback(validator.getFollowlinks), expressCallback(getFollowLinksController));
router.get('/followlinks/single/:postId', requestValidatorCallback(validator.getSingleFollowlinks), expressCallback(getSingleFollowLinksController));

module.exports = router;