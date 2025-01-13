const express = require('express');

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v3/chats');

const getUserChatsController = require('../../controllers/v3/chats/getUserChats');
const getUserMessagesController = require('../../controllers/v3/chats/getUserMessages');
const closeChatController = require('../../controllers/v3/chats/closeChat')

const router = express.Router();

router.get('/:chatId/messages', requestValidatorCallback(validator.getUserMessages), expressCallback(getUserMessagesController));
router.get('/me', requestValidatorCallback(validator.getUserChats), expressCallback(getUserChatsController));

router.post('/close/:chatId', requestValidatorCallback(validator.closeChat), expressCallback(closeChatController))

module.exports = router;