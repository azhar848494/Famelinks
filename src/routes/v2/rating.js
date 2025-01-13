const express = require("express");

const router = express.Router();

const expressCallback = require("../../helpers/express-callback");
const requestValidatorCallback = require("../../helpers/request-validator-callback");
const validator = require("../../validator/v2/rating");

const addRatingController = require("../../controllers/v3/rating/addRating");
const removeRatingController = require("../../controllers/v3/rating/removeRating")

router.post(
  "/addRating",
  requestValidatorCallback(validator.addRating),
  expressCallback(addRatingController)
);

router.delete(
  "/:_id",
  requestValidatorCallback(validator.removeRating),
  expressCallback(removeRatingController)
);

module.exports = router;
