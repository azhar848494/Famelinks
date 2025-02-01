const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "trendzSuggestions",
  new Schema(
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      userId: { type: ObjectId, default: null },
      gender: {
        type: [String],
        default: null,
      },
      age: {
        type: [String],
        default: null,
      },
      images: {
        type: [String],
        default: null,
      },
      type : { type: [String], required: false},
      pickerId: { type: ObjectId },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
