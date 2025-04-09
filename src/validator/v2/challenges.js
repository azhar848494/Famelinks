const joi = require('joi').extend(require("@joi/date"));

module.exports = {
  getOpenChallenges: {
    params: joi.object().keys({
      type: joi.string().trim().valid("famelinks").required(),
    }),
    query: joi.object().keys({
      page: joi.number().min(1).optional().allow(null),
      search: joi.string().trim().min(1).optional().default(""),
    }),
  },

  getTrend: {
    query: joi.object().keys({
      page: joi.number().min(1).required(),
      sponsorId: joi.string(),
    }),
  },

  getUpcomingChallenges: {
    params: joi.object().keys({
      type: joi.string().trim().valid("famelinks", "funlinks", "fameContest").required(),
    }),
    query: joi.object().keys({
      page: joi.number().min(1).required(),
      sponsorId: joi.string(),
    }),
  },

  getAllTrendz: {
    query: joi.object().keys({
      page: joi.number().min(1).required(),
      sponsorId: joi.string().trim().required(),
    }),
  },

  getChallengesPosts: {
    params: joi.object().keys({
      challengeId: joi.string().min(1).trim().required(),
      type: joi
        .string()
        .min(1)
        .trim()
        .valid("famelinks", "funlinks", "brand")
        .required(),
    }),
    query: joi.object().keys({
      page: joi.number().min(1).required(),
    }),
  }, 

  getOneChallenge: {
    params: joi.object().keys({
      challengeId: joi.string().trim().required(),
    }),
  },

  funlinksExplore: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  searchChallenge: {
    params: joi.object().keys({
      data: joi.string().trim().required(),
      linkType: joi
        .string()
        .trim()
        .valid("famelinks", "funlinks", "followlinks")
        .required(),
    }),
  },

  slider: {
    params: joi.object().keys({
      type: joi.string().trim().valid("open", "upcoming").required(),
    }),
  },

  updateImpressions: {
    params: joi.object().keys({
      challengeId: joi.string().trim().required(),
    }),
    payload: joi.object().keys({
      impressions: joi.number().positive().required(),
    }),
  },

  getChallengeWinners: {
    query: joi.object().keys({
      page: joi.number().positive().required(),
    }),
  },

  searchHashTag: {
    params: joi.object().keys({
      data: joi.string().trim().required(),
    }),
  },

  followlinksExplore: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  createChallenge: {
    payload: joi.object({
      type: joi.string().required(),
      hashTag: joi.string().required(),
      startDate: joi.date().format("DD-MM-YYYY").utc().optional(),
      time: joi.string().optional(),
      totalCoin: joi.string().required(),
      totalUser: joi.string().required(),
      giftCoins: joi.string().required(),
    }),
  },
};