const express = require('express');

const router = express.Router();

const userRouter = require('./users');
const challengeRouter = require('./challenges');
const famelinksRouter = require('./famelinks');
const locationsRouter = require('./locations');
const funlinksRouter = require('./funlinks');
const chatsRouter = require('./chats');
const referralsRouter = require('./referrals');
const followlinksRouter = require('./followlinks');
const infoPopupRouter = require('./infoPopup');
const homepage = require('./homepage')
const avatarRouter = require('./avatar')
const joblinksRouter = require('./joblinks')
const channelsRouter = require('./channels')
const clubsRouter = require('./clubs')
const clubOffersRouter = require('./clubOffers')
const fametrendzsRouter = require("./fametrendzs");
const ratingsRouter = require("./rating");
const settingRouter = require("./settings");

router.use('/users', userRouter);
router.use('/challenges', challengeRouter);
router.use('/media', famelinksRouter);
router.use('/location', locationsRouter);
router.use('/media', funlinksRouter);
router.use('/media', followlinksRouter);
router.use('/chats', chatsRouter);
router.use('/refer', referralsRouter);
router.use('/infoPopup', infoPopupRouter);
router.use('/homepage', homepage)
router.use('/avatar', avatarRouter)
router.use('/joblinks', joblinksRouter)
router.use('/channels', channelsRouter)
router.use('/clubs', clubsRouter)
router.use('/clubOffers', clubOffersRouter)
router.use("/media", fametrendzsRouter);
router.use("/rating", ratingsRouter);
router.use("/settings", settingRouter);

module.exports = router;