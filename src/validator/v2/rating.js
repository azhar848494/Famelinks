const joi = require("joi");

module.exports = {
  addRating: {
    payload: joi.object({
      trendId: joi.string().trim().required(),
      rating: joi.number().min(0).max(5).required(),
    }),
  },

  deleteRating: {
    params: joi.object({
      trendId: joi.string().trim().required(),
    }),
  },

  removeRating: {
    params: joi.object({
      _id: joi.string().trim().required(),
    }),
  },
};
