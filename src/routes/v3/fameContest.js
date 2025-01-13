const express = require("express");

const expressCallback = require("../../helpers/express-callback");
const requestValidatorCallback = require("../../helpers/request-validator-callback");
const validator = require("../../validator/v3/fametrendz");
const { fameContest } = require("../../utils/fileUploadS3V2");

const addFameContest = require("../../controllers/v3/fameContest/addFameContest")
const router = express.Router();

router.post("/fameContest/add", fameContest, requestValidatorCallback(validator.createFameContest), expressCallback(addFameContest));

module.exports = router;
