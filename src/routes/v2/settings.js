const express = require("express");
const router = express.Router();

const validator = require("../../validator/v2/users");
const expressCallback = require("../../helpers/express-callback");
const requestValidatorCallback = require("../../helpers/request-validator-callback");
const getSettingController = require("../../controllers/v2/users/getSetting");

router.get(
  "/settings",
  requestValidatorCallback(validator.setting),
  expressCallback(getSettingController)
);

module.exports = router;
