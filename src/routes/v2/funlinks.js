const express = require('express');
const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v2/funlinks');

// const { uploadFunlinkMedia } = require('../../utils/fileUploadS3');

const { uploadFunlinkMedia } = require('../../utils/fileUploadS3V2');

const addFunLinksController = require('../../controllers/v2/funlinks/addPost');
const getFunLinksController = require('../../controllers/v2/funlinks/getFunLinks');
const getMyFunLinksController = require('../../controllers/v2/funlinks/getMyFunLinks');
const getUserFunLinksController = require('../../controllers/v2/funlinks/getUserFunLinks');
const getMusicController = require('../../controllers/v2/funlinks/getMusic');
const submitLikeController = require('../../controllers/v2/likes/submitLike');
const addCommentController = require('../../controllers/v2/comments/addComment');
const deleteCommentController = require('../../controllers/v2/comments/deleteComment');
const deletePostController = require('../../controllers/v2/funlinks/deletePost');
const updateCommentController = require('../../controllers/v2/comments/updateComment');
const getCommentRepliesController = require('../../controllers/v2/comments/getCommentReplies');
const getCommentsController = require('../../controllers/v2/comments/getComments');
const getSingleFunLinksController = require('../../controllers/v2/funlinks/getSingleFunLinks');
const updatePostController = require('../../controllers/v2/funlinks/updatePost');
const getMusicPostsController = require('../../controllers/v2/funlinks/getMusicPosts');
const viewMediaController = require('../../controllers/v2/views/view')

const router = express.Router();

router.post('/funlinks/view/:mediaId', requestValidatorCallback(validator.view), expressCallback(viewMediaController, 'funlinks'))
router.post('/funlinks/like/:type/:id', requestValidatorCallback(validator.like), expressCallback(submitLikeController, 'funlinks'));
router.post('/funlinks/comment/:mediaId', requestValidatorCallback(validator.addComment), expressCallback(addCommentController, 'funlinks'));
router.post('/funlinks', uploadFunlinkMedia, requestValidatorCallback(validator.funlink), expressCallback(addFunLinksController));

router.delete('/funlinks/comment/:commentId', requestValidatorCallback(validator.deleteComment), expressCallback(deleteCommentController, 'funlinks'));
router.delete('/funlinks/:postId', requestValidatorCallback(validator.deletePost), expressCallback(deletePostController));

router.put('/funlinks/comment/:commentId', requestValidatorCallback(validator.updateComment), expressCallback(updateCommentController, 'funlinks'));
router.put('/funlinks/:postId', requestValidatorCallback(validator.updatePost), expressCallback(updatePostController));
router.put('/funlinks/:postId/mark-safe', requestValidatorCallback(validator.markSafe), expressCallback(updatePostController));

router.get('/funlinks/comment/:commentId/replies', requestValidatorCallback(validator.getCommentReplies), expressCallback(getCommentRepliesController, 'funlinks'));
router.get('/funlinks/comment/:mediaId', requestValidatorCallback(validator.getComments), expressCallback(getCommentsController, 'funlinks'));
router.get('/funLinks/me', requestValidatorCallback(validator.getMyFunlinks), expressCallback(getMyFunLinksController));
router.get('/funlinks/songs', requestValidatorCallback(validator.getMusic), expressCallback(getMusicController));
router.get('/funlinks/:userId',
  requestValidatorCallback(validator.getUserFunlinks),
  expressCallback(getUserFunLinksController)
);
router.get('/funlinks', requestValidatorCallback(validator.getFunlinks), expressCallback(getFunLinksController));
router.get('/funlinks/single/:postId', requestValidatorCallback(validator.getSingleFamelinks), expressCallback(getSingleFunLinksController));
router.get('/funlinks/songs/:musicId/posts', requestValidatorCallback(validator.getMusicPosts), expressCallback(getMusicPostsController));

module.exports = router;