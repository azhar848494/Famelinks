const express = require('express')

const router = express.Router();

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v3/followlinks');

const { uploadFollowlinksMedia } = require('../../utils/fileUploadS3');

const addPostController = require('../../controllers/v3/followlinks/addPost');
const getWelcomeVideo = require('../../controllers/v3/followlinks/getWelcomeVideo')

router.post('/followlinks', uploadFollowlinksMedia, requestValidatorCallback(validator.followlinks), expressCallback(addPostController));
router.get(
  "/welcomeVideo",
  requestValidatorCallback(validator.getWelcomeVideo),
  expressCallback(getWelcomeVideo)
);

module.exports = router
