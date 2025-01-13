const express = require('express');

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v2/famelinks');

// const { uploadFamelinksMedia } = require('../../utils/fileUploadS3');

const { uploadFamelinksMedia } = require('../../utils/fileUploadS3V2');

const addPostController = require('../../controllers/v2/famelinks/addPost');
const submitLikeController = require('../../controllers/v2/likes/submitLike');
const addCommentController = require('../../controllers/v2/comments/addComment');
const deleteCommentController = require('../../controllers/v2/comments/deleteComment');
const updateCommentController = require('../../controllers/v2/comments/updateComment');
const getCommentsController = require('../../controllers/v2/comments/getComments');
const getCommentRepliesController = require('../../controllers/v2/comments/getCommentReplies');
const getMyFameLinksController = require('../../controllers/v2/famelinks/getMyFameLinks');
const getUserFameLinksController = require('../../controllers/v2/famelinks/getUserFameLinks');
const getFameLinksController = require('../../controllers/v2/famelinks/getFameLinks');
const getAdFameLinksController = require('../../controllers/v2/famelinks/getAdFamelinks');
// const getFollowLinksController = require('../../controllers/v2/famelinks/getFollowLinks');
const deletePostController = require('../../controllers/v2/famelinks/deletePost');
const deletePostMediaController = require('../../controllers/v2/famelinks/deletePostMedia');
const updatePostController = require('../../controllers/v2/famelinks/updatePost');
const getSingleFameLinksController = require('../../controllers/v2/famelinks/getSingleFameLinks');

const router = express.Router();

router.post('/famelinks/like/:type/:id', requestValidatorCallback(validator.like), expressCallback(submitLikeController, 'famelinks'));
router.post('/famelinks/comment/:mediaId', requestValidatorCallback(validator.addComment), expressCallback(addCommentController, 'famelinks'));
router.post('/contest', uploadFamelinksMedia, requestValidatorCallback(validator.famelinks), expressCallback(addPostController));

router.delete('/famelinks/comment/:commentId', requestValidatorCallback(validator.deleteComment), expressCallback(deleteCommentController, 'famelinks'));
router.delete('/famelinks/:postId/:mediaType', requestValidatorCallback(validator.deletePostMedia), expressCallback(deletePostMediaController));
router.delete('/famelinks/:postId', requestValidatorCallback(validator.deletePost), expressCallback(deletePostController));

router.put('/famelinks/comment/:commentId', requestValidatorCallback(validator.updateComment), expressCallback(updateCommentController, 'famelinks'));
router.put('/famelinks/:postId', requestValidatorCallback(validator.updatePost), expressCallback(updatePostController));
router.put('/famelinks/:postId/mark-safe', requestValidatorCallback(validator.markSafe), expressCallback(updatePostController));

router.get('/famelinks/comment/:commentId/replies', requestValidatorCallback(validator.getCommentReplies), expressCallback(getCommentRepliesController, 'famelinks'));
router.get('/famelinks/comment/:mediaId', requestValidatorCallback(validator.getComments), expressCallback(getCommentsController, 'famelinks'));
router.get('/famelinks/me', requestValidatorCallback(validator.getMyFamelinks), expressCallback(getMyFameLinksController));
router.get('/famelinks/adPost', requestValidatorCallback(validator.getAdFamelinks), expressCallback(getAdFameLinksController));
router.get('/famelinks/:userId', requestValidatorCallback(validator.getUserFamelinks), expressCallback(getUserFameLinksController));
router.get('/famelinks', requestValidatorCallback(validator.getFamelinks), expressCallback(getFameLinksController));
router.get('/famelinks/single/:postId', requestValidatorCallback(validator.getSingleFamelinks), expressCallback(getSingleFameLinksController));

module.exports = router;