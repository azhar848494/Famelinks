const express = require('express')

const router = express.Router()

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v3/funlinks');

const { uploadFunlinkMedia } = require('../../utils/fileUploadS3V2');

const addFunLinksController = require('../../controllers/v3/funlinks/addPost');
const getFunlinksController = require('../../controllers/v3/funlinks/getFunlinks')
const getUserStatusController = require('../../controllers/v3/funlinks/getUserStatus')

router.get('/funlinks', requestValidatorCallback(validator.getFunlinks), expressCallback(getFunlinksController));

router.post('/funlinks', uploadFunlinkMedia, requestValidatorCallback(validator.funlink), expressCallback(addFunLinksController));
router.post('/funlinks/user-status', requestValidatorCallback(validator.getStatus), expressCallback(getUserStatusController))

module.exports = router