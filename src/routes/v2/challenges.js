const express = require('express');

const validator = require('../../validator/v2/challenges');
const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');

const getOpenChallengesController = require('../../controllers/v2/challenges/getOpenChallenges');
const getUpcomingChallengesController = require('../../controllers/v2/challenges/getUpcomingChallenges');
const getChallengePostsController = require('../../controllers/v2/challenges/getChallengePosts');
const getDashboardOpenChallengesController = require('../../controllers/v2/challenges/getDashboardOpenChallenges');
const getOneChallengeController = require('../../controllers/v2/challenges/getOneChallenge');
const exploreFunlinksController = require('../../controllers/v2/challenges/exploreFunlinks');
const searchChallengeController = require('../../controllers/v2/challenges/searchChallenge');
const getChallengeSliderController = require('../../controllers/v2/challenges/getChallengeSlider');
const updateImpressionsController = require('../../controllers/v2/challenges/updateImpressions');
const getWinnersController = require('../../controllers/v2/challenges/getWinners');
const searchHashtagController = require('../../controllers/v2/challenges/searchHashtag');
const exploreFollowlinks = require('../../controllers/v2/challenges/exploreFollowlinks')
const addFunChallengeCtrl = require('../../controllers/v2/challenges/addFunChallenge')

const router = express.Router();

router.get('/winners', requestValidatorCallback(validator.getChallengeWinners), expressCallback(getWinnersController));
router.get('/funlinks/explore', requestValidatorCallback(validator.funlinksExplore), expressCallback(exploreFunlinksController));
router.get('/followlinks/explore', requestValidatorCallback(validator.followlinksExplore), expressCallback(exploreFollowlinks))
router.get('/dashboard/open', expressCallback(getDashboardOpenChallengesController));
router.get('/search/:data/:linkType', requestValidatorCallback(validator.searchChallenge), expressCallback(searchChallengeController));
router.get('/:type/slider', requestValidatorCallback(validator.slider), expressCallback(getChallengeSliderController));
router.get('/open/:type', requestValidatorCallback(validator.getOpenChallenges), expressCallback(getOpenChallengesController));
router.get('/upcoming/:type', requestValidatorCallback(validator.getUpcomingChallenges), expressCallback(getUpcomingChallengesController));
router.get('/:challengeId', requestValidatorCallback(validator.getOneChallenge), expressCallback(getOneChallengeController));
router.get('/:challengeId/:type', requestValidatorCallback(validator.getChallengesPosts), expressCallback(getChallengePostsController));
router.get('/brand/hashTag/:data', requestValidatorCallback(validator.searchHashTag), expressCallback(searchHashtagController));

router.put('/:challengeId/impressions', requestValidatorCallback(validator.updateImpressions), expressCallback(updateImpressionsController));


router.post('/createChallenge',
    requestValidatorCallback(validator.createChallenge),
    expressCallback(addFunChallengeCtrl)
  );

module.exports = router;

