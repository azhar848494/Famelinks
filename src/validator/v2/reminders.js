const joi = require('joi');

module.exports = {
  createReminders: {
    payload: joi.object({
      type: joi.string().trim().required(),
      sourceId: joi.string().trim().required(),
      // triggerAt: joi.date().required(),
    }),
  },
};