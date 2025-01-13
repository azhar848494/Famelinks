const express = require('express');
const router = express.Router();
const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v2/homepage');

const getFeedController = require('../../controllers/v2/homepage/getFeedController')
router.get('/feed', expressCallback(getFeedController))

module.exports = router