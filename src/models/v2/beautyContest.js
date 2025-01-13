const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "beautycontests",
  new Schema(
    {
      organizerId: { type: ObjectId, required: true },
      level: { type: String, required: true },
      year: { type: Number, required: true },
      season: { type: String, enum: ['H1', 'H2'], required: true },
      scopeLocation: { type: ObjectId, default: null },
      title: { type: String, required: true },
      description: { type: String, default: null },
      images: { type: [String], default: [] },
      gender: { type: String, default: "all", enum: ["male", "female", "other", "all"] },
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
      stage: { type: String, enum: ["pre-selection", "contest", "grand-finale", "completed"], default: "pre-selection" },
      cutOffScore: {
        type: {
          preSelection: { type: Number, required: true },
          contest: { type: Number, required: false },
        },
      },
      winnerRewards: { type: [{ type: [String] }], required: true },
      startedAt: { type: Date, required: true },
      completedAt: { type: Date, required: true },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);