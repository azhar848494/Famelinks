const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;


const winnerRewardsSchema = new Schema(
  {
    cashReward: { type: Number, required: true },
    currency: { type: String, required: false },
    brandProduct: { type: Number, required: true },
    crown: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const runnerUpRewardsSchema = new Schema(
  {
    cashReward: { type: Number, required: true },
    currency: { type: String, required: false },
    brandProduct: { type: Number, required: true },
    crown: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

module.exports = mongoose.model(
  "fameContest",
  new Schema(
    {
      sponsoredBy: { type: ObjectId, required: true },
      location: { type: ObjectId, required: true },
      level: { type: String, required: true },
      description: { type: String, default: "" },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      ageGroup: {
        type: String,
        enum: [
          "groupA",
          "groupB",
          "groupC",
          "groupD",
          "groupE",
          "groupF",
          "groupG",
          "groupH",
        ],
      },
      gender: { type: String, enum: ["male", "female", "all"] },
      started: { type: Boolean, default: false },
      season: { type: String, required: false },
      hYear: { type: String, required: false },
      year: { type: Number, required: true },
      runnerUpRewards: {
        type: runnerUpRewardsSchema,
      },
      winnerRewards: {
        type: winnerRewardsSchema,
      },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
