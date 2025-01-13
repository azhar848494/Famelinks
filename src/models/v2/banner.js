const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "banners",
  new Schema(
    {
      image: { type: String, required: true},
      scope: {
        type: String,
        required: true,
        enum: ["district", "state", "country", "continent", "worldwide"],
        default: "worldwide"
      },
      location: { type: ObjectId, default: null },
      for: {
        type: String,
        required: true,
        enum: ["male", "female", "kids", "all", ],
        default: "all"
      },
      ageGroup: {
        type: String,
        default: "all",
        enum: [
          "groupA",
          "groupB",
          "groupC",
          "groupD",
          "groupE",
          "groupF",
          "groupG",
          "groupH",
          "all"
        ],
      },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
