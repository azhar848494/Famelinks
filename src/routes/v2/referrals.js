const express = require('express');

const validator = require('../../validator/v2/referrals');
const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');

const applyReferralCodeController = require('../../controllers/v2/referrals/applyReferralCode');

const router = express.Router();

router.post('/apply', requestValidatorCallback(validator.applyReferralCode), expressCallback(applyReferralCodeController));

module.exports = router;