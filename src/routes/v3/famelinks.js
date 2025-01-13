const express = require('express')

const router = express.Router()

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v3/famelinks');

// 
const {getFamelinksController, getUserController} = require('../../controllers/v3/famelinks/getFamelinks')
// const getFamelinksController = require('../../controllers/v3/famelinks/getFamelinks')
const getUserStatusController = require('../../controllers/v3/famelinks/getUserStatus')

router.get('/famelinks', requestValidatorCallback(validator.getFamelinks), expressCallback(getFamelinksController));
router.get('/user', requestValidatorCallback(validator.getUser), expressCallback(getUserController));

router.post('/famelinks/user-status', requestValidatorCallback(validator.getStatus), expressCallback(getUserStatusController))

module.exports = router