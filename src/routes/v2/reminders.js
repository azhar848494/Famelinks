const express = require('express')
const router = express.Router()

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v2/reminders');

const createReminderController = require('../../controllers/v2/reminders/createReminder')

router.post('/', 
  requestValidatorCallback(validator.createReminders),
  expressCallback(createReminderController),
)

module.exports = router
