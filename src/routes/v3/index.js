const express = require('express');

const router = express.Router();

const chatsRouter = require('./chats');
const followlinksRouter = require('./followlinks');
const funlinksRouter = require('./funlinks')
const famelinksRouter = require('./famelinks')
const collablinksRouter = require('./collablinks')
const fameContestRouter = require('./fameContest')


router.use('/chats', chatsRouter);
router.use('/media', famelinksRouter);
router.use('/media', followlinksRouter);
router.use('/media', funlinksRouter);
router.use("/media", collablinksRouter);
router.use("/media", fameContestRouter);




module.exports = router;