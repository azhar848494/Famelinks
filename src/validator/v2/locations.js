const joi = require('joi');

module.exports = {
  getLocations: {
    query: joi.object({
      search: joi.string().trim().min(3).required(),
    }),
  },

  getCountries: {
    query: joi.object({
      continent: joi
        .string()
        .trim()
        .min(1)
        .valid(
          "asia",
          "europe",
          "south america",
          "north america",
          "africa",
          "antarctica",
          "australia"
        )
        .required(),
    }),
  },

  getStates: {
    query: joi.object({
      country: joi.string().trim().min(1).required(),
    }),
  },

  getDistricts: {
    query: joi.object({
      country: joi.string().trim().min(1).required(),
      state: joi.string().trim().min(1).required(),
    }),
  },

  getLocationsBySearch: {
    query: joi.object({
      search: joi.string().trim().min(3).required(),
      search_type: joi.string(),
      // page: joi.number().min(1).required()
    }),
  },
};