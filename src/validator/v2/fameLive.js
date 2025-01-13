const joi = require('joi').extend(require("@joi/date"));

module.exports = {

  beautyContest: {
    payload: joi.object({
      type: joi.string().trim().valid("self-organize", "beauty-contest").required(),
      level: joi.string().trim().valid("district", "state", "national", "global").required(),
      year: joi.number().required(),
      year: joi.number().valid("H1", "H2").required(),
      scopeLocation: joi.string().trim().optional(),
      title: joi.string().trim().required(),
      description: joi.string().trim().optional(),
      gender: joi.string().trim().valid("male", "female", "other", "all").optional(),

    }),
    files: joi.array().items(joi.string().trim())
      .label("images")
      .min(1)
      .required(),
  },

  addViewer: {
    payload: joi.object({
      liveId: joi.string().trim().required(),
      streamerId: joi.string().trim().required(),
    }),
  },

  scheduleLive: {
    payload: joi.object({
      type: joi.string().trim().valid("self-organize", "beauty-contest").required(),
      level: joi.string().trim().valid("district", "state", "national", "global").optional(),
      duration: joi.number().optional(),
      dateTime: joi.date().format("DD-MM-YYYY HH:mm").utc().required(),
    }),
  },

  getScheduleLives: {
    params: joi.object({
      type: joi.string().trim().valid("upcoming", "past").required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getGifts: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  updateLive: {
    params: joi.object({
      liveId: joi.string().trim().required(),
    }),
    payload: joi.object({
      duration: joi.number().optional(),
      dateTime: joi.date().format("DD-MM-YYYY HH:mm").utc().required(),
    }),
  },

  deleteLive: {
    params: joi.object({
      liveId: joi.string().trim().required(),
    }),
  },

  getContestants: {
    payload: joi.object({
      date: joi.date().format("DD-MM-YYYY").utc().optional(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  submitRating: {
    payload: joi.object({
      liveId: joi.string().trim().required(),
      ratings: joi.string().trim(),
    }),
  },

  startEndLive: {
    params: joi.object({
      type: joi.string().trim().required(),
      liveId: joi.string().trim().required(),
    }),
  },
};