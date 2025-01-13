const express = require('express');

const authenticate = require('../helpers/v2/authenticate');
const v2Router = require("./v2");
const v3Router = require("./v3");

const router = express.Router();

router.use('/v2', authenticate, v2Router);
router.use('/v3', authenticate, v3Router);
router.get('/profile/:profileType/:profileId', (req, res) => res.redirect('https://play.google.com/store/apps/details?id=app.famelinks'));
router.get('/post/:postType/:postId', (req, res) => res.redirect('https://play.google.com/store/apps/details?id=app.famelinks'));
router.get('/:username', (req, res) => res.redirect('https://play.google.com/store/apps/details?id=app.famelinks'));

module.exports = router;