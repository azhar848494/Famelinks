const joi = require("joi").extend(require("@joi/date"));

module.exports = {
  addTrendzSuggestions: {
    payload: joi.object({
      name: joi.string().trim().required(),
      description: joi.string().trim().required(),
      userId: joi.string().trim(),
      gender: joi.string().trim(),
      age: joi.string().trim(),
      images: joi.array().label("images").max(5),
      type: joi.string().trim(),
    }),
  },

  updateSuggestionTrendz: {
    params: joi.object({
      trendzId: joi.string().trim().required(),
    }),
    payload: joi.object({
      name: joi.string().trim().required(),
      description: joi.string().trim().required(),
      userId: joi.string().trim(),
      gender: joi.string().trim(),
      age: joi.string().trim(),
      images: joi.array().label("images").max(5),
      type: joi.string().trim(),
    }),
  },

  createFametrendz: {
    files: joi.object({
      challenge_banner: joi.string().trim(),
    }),
    payload: joi.object({
      suggestionId: joi.string().trim(),
      suggestedBy: joi.string().trim(),
      milestoneAggrement: joi
        .object()
        .keys({
          budget: joi.number().optional(),
          minCost: joi.number().optional(),
          constant: joi.number().optional(),
          reachMultiplier: joi.number().optional(),
          perImpressionCost: joi.number().optional(),
          milestoneValue: joi.number().optional(),
        })
        .optional(),
      hashTag: joi.string().required(),
      description: joi.string().optional(),
      category: joi.string().optional(),
      type: joi.string().optional(),
      for: joi.string().trim(),
      location: joi.string().trim(),
      startDate: joi.date().format("DD-MM-YYYY").utc().optional(),
      ageGroup: joi.array().items(joi.string().trim()),
      time: joi.string().optional(),
      status: joi.string().optional(),
      images: joi.string().optional(),
      paymentId: joi.string().trim(),
      trendzCategory: joi.array().items(joi.string().trim()),
      userId: joi.string().trim(),
      purposeId: joi.string().trim(),
      amount: joi.number(),
      paymentPurpose: joi.string().trim(),
      paymentRef: joi.string().trim(),
      currency: joi.string().trim(),
      txType: joi.string().trim(),
      rewardWinner: joi.array().items(joi.string().trim()),
      rewardRunnerUp: joi.array().items(joi.string().trim()),
    }),
  },

  getEditFametrendz: {
    params: joi.object({
      id: joi.string().trim().required(),
    }),
  },

  getSavedFametrendzs: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getTrendzSuggestions: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  updateFametrendz: {
    params: joi.object({
      trendzId: joi.string().trim().required(),
    }),
    files: joi.object({
      challenge_banner: joi.string().trim(),
    }),
    payload: joi.object({      
      hashTag: joi.string(),
      description: joi.string().optional(),
      category: joi.string().optional(),
      type: joi.string().optional(),
      for: joi.string().trim(),
      location: joi.string().trim(),
      startDate: joi.date().format("DD-MM-YYYY").utc().optional(),
      ageGroup: joi.array().items(joi.string().trim()),
      time: joi.string().optional(),
      images: joi.string().optional(),
      paymentId: joi.string().trim(),
      trendzCategory: joi.array().items(joi.string().trim()),
      userId: joi.string().trim(),
    }),
  },

  deletetrendzSuggestion: {
    params: joi.object({
      trendzId: joi.string().trim().required(),
    }),
  },

  deleteFametrendz: {
    params: joi.object({
      trendzId: joi.string().trim().required(),
    }),
  },

  createFameContest: {
    payload: joi.object({
      level: joi.string().trim().required(),
      place: joi.string().trim().required(),
      winnerRewards: joi.object().keys({
        cashReward: joi.number(),
        currency: joi.string().trim(),
        brandProduct: joi.number(),
        crown: joi.string().trim(),
      }),
      runnerUpRewards: joi.object().keys({
        cashReward: joi.number(),
        currency: joi.string().trim(),
        brandProduct: joi.number(),
        crown: joi.string().trim(),
      }),
      sponsoredBy: joi.string().trim(),
      description: joi.string().trim(),
      startDate: joi.date().format("DD-MM-YYYY").utc().required(),
      endDate: joi.date().format("DD-MM-YYYY").utc().required(),
      ageGroup: joi.array().items(joi.string().trim()),
      gender: joi.string().trim().valid("male", "female", "all").optional(),
      started: joi.boolean(),
      season: joi.string().trim(),
      hYear: joi.string().trim(),
      year: joi.number(),
    }),
  },
};
