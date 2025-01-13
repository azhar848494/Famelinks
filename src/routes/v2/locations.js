const express = require('express');

const validator = require('../../validator/v2/locations');
const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');

const getAllLocationsController = require('../../controllers/v2/location/getAllLocation');
const LocationsController = require('../../controllers/v2/location/getLocations');
const getCountriesController = require('../../controllers/v2/location/getCountries');
const getStatesController = require('../../controllers/v2/location/getStates');
const getDistrictsController = require('../../controllers/v2/location/getDistricts');
const getCountryCodesController = require('../../controllers/v2/location/getCountryCodes');
const getLocationsBySearch = require('../../controllers/v2/location/getLocationsBySearch')

const router = express.Router(); 

router.get('/all', expressCallback(getAllLocationsController));
router.get('/', requestValidatorCallback(validator.getLocations), expressCallback(LocationsController.getLocationsController));
router.get('/find', requestValidatorCallback(validator.getLocations), expressCallback(LocationsController.findLocationsController));
router.get('/countries', requestValidatorCallback(validator.getCountries), expressCallback(getCountriesController));
router.get('/states', requestValidatorCallback(validator.getStates), expressCallback(getStatesController));
router.get('/districts', requestValidatorCallback(validator.getDistricts), expressCallback(getDistrictsController));
router.get('/country-code', expressCallback(getCountryCodesController));
router.get('/search',
  requestValidatorCallback(validator.getLocationsBySearch),
  expressCallback(getLocationsBySearch)
);

module.exports = router;