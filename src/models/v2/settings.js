const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "settings",
  new Schema(
    {
      welcomeImage: { type: String },
      welcomeVideo: { type: String },
      welcomeText: { type: String },
      famelinksDailyPosts: { type: Number, default: 0 },
      isVerifiedAll: { type: String, default: 'Pending' },
      clubOfferDailyPosts: { type: Number, default: 0 },
      clubOffersLimit: { type: Number, default: 0 },
      followInviteDailyLimit: { type: Number, default: 0 },
      clubOffersApplicationDailyLimit: { type: Number, default: 0 },
      platformCost: { type: Number, default: 0 },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
