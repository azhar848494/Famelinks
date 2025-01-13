const express = require('express')

const router = express.Router()

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v2/clubs');

const { addClub } = require('../../utils/fileUploadS3')

const getClubs = require('../../controllers/v2/clubs/getClubs')
const addClubs = require('../../controllers/v2/clubs/addClubs')

router.get('/', expressCallback(getClubs))
router.post('/', addClub, requestValidatorCallback(validator.addClub), expressCallback(addClubs))

module.exports = router