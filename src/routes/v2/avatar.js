const express = require('express')
const router = express.Router()

const expressCallback = require('../../helpers/express-callback');

const { uploadAvatar } = require('../../utils/fileUploadS3')

const getAvatarController = require('../../controllers/v2/avatar/getAvatar')
const uploadAvatarController = require('../../controllers/v2/avatar/uploadAvatar')

router.get('/', expressCallback(getAvatarController))
router.post('/', uploadAvatar, expressCallback(uploadAvatarController))

module.exports = router
