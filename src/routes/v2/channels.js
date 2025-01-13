const express = require('express')

const router = express.Router()

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v2/channels');

const createChannel = require('../../controllers/v2/channels/createChannel')
const followChannel = require('../../controllers/v2/channels/followChannel')
const unFollowChannel = require('../../controllers/v2/channels/unFollowChannel')
const searchChannel = require('../../controllers/v2/channels/searchChannel')
const getChannelPosts = require('../../controllers/v2/channels/getChannelPosts')

router.get('/search/:data', requestValidatorCallback(validator.searchChannel), expressCallback(searchChannel))

router.post('/', requestValidatorCallback(validator.channel), expressCallback(createChannel))
router.post('/follow/:channelId', requestValidatorCallback(validator.followUnfollow), expressCallback(followChannel))

router.delete('/unfollow/:channelId', requestValidatorCallback(validator.followUnfollow), expressCallback(unFollowChannel))

router.get('/post',
  requestValidatorCallback(validator.getChannelPosts),
  expressCallback(getChannelPosts)
);

module.exports = router