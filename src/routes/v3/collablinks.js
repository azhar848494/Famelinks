const express = require("express");

const expressCallback = require("../../helpers/express-callback");
const requestValidatorCallback = require("../../helpers/request-validator-callback");
const validator = require("../../validator/v3/collablinks");
const { uploadCollablinksMedia } = require("../../utils/fileUploadS3V2");
const addPostController = require("../../controllers/v3/collablinks/addPost");
const getUserCollablinks = require("../../controllers/v3/collablinks/getUserCollablinks")
const deletePostController = require("../../controllers/v3/collablinks/deletePost");
const updatePostController = require("../../controllers/v3/collablinks/updatePost");
const submitLikeController = require("../../controllers/v2/likes/submitLike");
const addCommentController = require("../../controllers/v2/comments/addComment");
const getCommentsController = require("../../controllers/v2/comments/getComments");
const getCommentRepliesController = require("../../controllers/v2/comments/getCommentReplies");
const deleteCommentController = require("../../controllers/v2/comments/deleteComment");
const router = express.Router();

router.post(
  "/collablinks",
  uploadCollablinksMedia,
  requestValidatorCallback(validator.collablinks),
  expressCallback(addPostController)
);

router.get(
  "/collablinks/:userId",
  requestValidatorCallback(validator.getUserCollablinks),
  expressCallback(getUserCollablinks)
);
router.delete(
  "/collablinks/:postId",
  requestValidatorCallback(validator.deletePost),
  expressCallback(deletePostController)
);

router.put("/collablinks/:postId", expressCallback(updatePostController));
router.post(
  "/collablinks/like/:type/:id",
  requestValidatorCallback(validator.like),
  expressCallback(submitLikeController, "collablinks")
);
router.post(
  "/collablinks/comment/:mediaId",
  requestValidatorCallback(validator.addComment),
  expressCallback(addCommentController, "collablinks")
);
router.get(
  "/collablinks/comment/:mediaId",
  requestValidatorCallback(validator.getComments),
  expressCallback(getCommentsController, "collablinks")
);
router.get(
  "/collablinks/comment/:commentId/replies",
  requestValidatorCallback(validator.getCommentReplies),
  expressCallback(getCommentRepliesController, "collablinks")
);

router.delete(
  "/collablinks/comment/:commentId",
  requestValidatorCallback(validator.deleteComment),
  expressCallback(deleteCommentController, "collablinks")
);

module.exports = router;
