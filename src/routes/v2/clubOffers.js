const express = require('express')

const router = express.Router()

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const validator = require('../../validator/v2/clubOffers');

const { uploadClubOfferMedia } = require('../../utils/fileUploadS3');

const createClubOffer = require('../../controllers/v2/clubOffers/createClubOffer')
const getClubOfferById = require('../../controllers/v2/clubOffers/getClubOfferById')
const getClubOffer = require('../../controllers/v2/clubOffers/getClubOffer')
const updateClubOffer = require('../../controllers/v2/clubOffers/updateClubOffer')
const applyWithdrawClubOffer = require('../../controllers/v2/clubOffers/applyWithdrawClubOffer')
const withdrawCancelOffers = require('../../controllers/v2/clubOffers/withdrawCancelOffers')
const saveUnsavePromoters = require('../../controllers/v2/clubOffers/saveUnsavePromoters')
const searchCategory = require('../../controllers/v2/clubOffers/searchCategory')
const addCategory = require('../../controllers/v2/clubOffers/addCategory')
const grantOffer = require('../../controllers/v2/clubOffers/grantOffer')
const getApplicants = require('../../controllers/v2/clubOffers/getApplicants')

router.post('/', uploadClubOfferMedia, requestValidatorCallback(validator.clubOffer), expressCallback(createClubOffer))
router.post('/promoters/:offerId', requestValidatorCallback(validator.saveUnsavePromoters), expressCallback(saveUnsavePromoters))
router.post('/application/:offerId', requestValidatorCallback(validator.applyWithdrawPromoters), expressCallback(applyWithdrawClubOffer))
router.post('/category', requestValidatorCallback(validator.category), expressCallback(addCategory))
router.post('/grantOffer', requestValidatorCallback(validator.grantOffer), expressCallback(grantOffer))
router.delete('/withdraw/:offerId', requestValidatorCallback(validator.withdrawCancelOffers), expressCallback(withdrawCancelOffers))

router.get('/', requestValidatorCallback(validator.getClubOffer), expressCallback(getClubOffer))
router.get('/:offerId', requestValidatorCallback(validator.getClubOfferById), expressCallback(getClubOfferById))
router.get('/category/:searchData', requestValidatorCallback(validator.searchData), expressCallback(searchCategory))
router.get('/applicants/:offerId', requestValidatorCallback(validator.getApplicants), expressCallback(getApplicants))

router.patch('/:offerId', uploadClubOfferMedia, requestValidatorCallback(validator.updateClubOffer), expressCallback(updateClubOffer))
module.exports = router