const express = require('express');

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v2/chats');

const getUserChatsController = require('../../controllers/v2/chats/getUserChats');
const getUserMessagesController = require('../../controllers/v2/chats/getUserMessages');
const getUserChatRequestsController = require('../../controllers/v2/chats/getUserChatRequests');
const acceptIgnoreRequestController = require('../../controllers/v2/chats/acceptIgnoreRequest');
const markAsReadController = require('../../controllers/v2/chats/markAsRead');
const getUserJobChatsController = require('../../controllers/v2/chats/getUserJobChats');
const getUserJobChatRequestsController = require('../../controllers/v2/chats/getUserJobChatRequests');

const router = express.Router();

router.get('/messages', requestValidatorCallback(validator.getUserMessages), expressCallback(getUserMessagesController));
router.patch('/:chatId/mark-as-read', requestValidatorCallback(validator.markAsRead), expressCallback(markAsReadController));
router.get('/me', requestValidatorCallback(validator.getUserChats), expressCallback(getUserChatsController));
router.get('/requests', requestValidatorCallback(validator.getUserChatsRequest), expressCallback(getUserChatRequestsController));
router.get('/job/requests',
  requestValidatorCallback(validator.getUserJobChatsRequest),
  expressCallback(getUserJobChatRequestsController)
);

router.patch('/requests/:chatId/action',
  requestValidatorCallback(validator.acceptIgnoreRequest),
  expressCallback(acceptIgnoreRequestController)
);
router.get('/job/me', requestValidatorCallback(validator.getUserJobChats), expressCallback(getUserJobChatsController));



module.exports = router;