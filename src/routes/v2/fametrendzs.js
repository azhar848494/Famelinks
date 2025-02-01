const express = require('express');

const router = express.Router();

const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');
const {
  uploadRewardImages,
  uploadTrendzSuggestionMedia,
  uploadChannelBanner,
  fameContest,
} = require('../../utils/fileUploadS3V2');

const createFametrendzController = require('../../controllers/v3/fametrendzs/createfametrendz');
const addTrendzSuggestionsController = require('../../controllers/v3/fametrendzs/addSuggestions');
const updateSuggestionTrendzController = require('../../controllers/v3/fametrendzs/updateSuggestionTrendz');
const uploadTrendBanner = require('../../controllers/v3/fametrendzs/uploadFametrendsBanner');
const getTrendSettingController = require('../../controllers/v3/fametrendzs/getTrendSetting')
const getSavedFametrendzsController = require('../../controllers/v3/fametrendzs/getSavedFametrendzs')
const getEditFametrendzController = require('../../controllers/v3/fametrendzs/getEditFametrendz')
const getTrendSuggestions = require('../../controllers/v3/fametrendzs/getTrendSuggestions');
const updateFametrendz = require('../../controllers/v3/fametrendzs/updateFametrendz')
const deleteFametrendz = require('../../controllers/v3/fametrendzs/deleteFametrendz')
const deleteSuggestionTrendz = require('../../controllers/v3/fametrendzs/deleteSuggestionTrendz')
const validator = require('../../validator/v3/fametrendz');

router.post('/createFametrendz',
  uploadChannelBanner,
  requestValidatorCallback(validator.createFametrendz),
  expressCallback(createFametrendzController)
);

router.put('/updateFametrendz/:trendzId',
  uploadChannelBanner,
  requestValidatorCallback(validator.updateFametrendz),
  expressCallback(updateFametrendz)
);

router.post('/addTrendSuggestion',
  uploadTrendzSuggestionMedia,
  requestValidatorCallback(validator.addTrendzSuggestions),
  expressCallback(addTrendzSuggestionsController)
);
router.post('/uploadTrendBanner',
  uploadChannelBanner,
  expressCallback(uploadTrendBanner)
);
router.get('/trendzSetting', expressCallback(getTrendSettingController));
router.get('/savedFametrendz',
  requestValidatorCallback(validator.getSavedFametrendzs),
  expressCallback(getSavedFametrendzsController)
);
router.get('/trendSuggestions',
  requestValidatorCallback(validator.getTrendzSuggestions),
  expressCallback(getTrendSuggestions)
);
router.get('/editFametrendz/:id',
  requestValidatorCallback(validator.getEditFametrendz),
  expressCallback(getEditFametrendzController)
);

router.put('/updateSuggestionTrendz/:trendzId',
  uploadTrendzSuggestionMedia,
  requestValidatorCallback(validator.updateSuggestionTrendz),
  expressCallback(updateSuggestionTrendzController)
);

router.delete('/deleteFametrendz/:trendzId',
  requestValidatorCallback(validator.deleteFametrendz),
  expressCallback(deleteFametrendz)
);

router.delete('/deleteSuggestionTrendz/:trendzId',
  requestValidatorCallback(validator.deletetrendzSuggestion),
  expressCallback(deleteSuggestionTrendz)
);
module.exports = router;
