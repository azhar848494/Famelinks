const express = require('express');

// const validator = require('../../validator/v2/referrals');
const expressCallback = require('../../helpers/express-callback');
// const requestValidatorCallback = require('../../helpers/request-validator-callback');

const markAsSafeController = require('../../controllers/v2/webhooks/markAsSafe');

const router = express.Router();

router.post('/post/mark', /*requestValidatorCallback(validator.applyReferralCode),*/ expressCallback(markAsSafeController));

module.exports = router;