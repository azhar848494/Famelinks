const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "categoriesSuggestions",
  new Schema(
    {
      name: { type: String, required: true },
      type: { type: String, required: true, enum: ["faces", "crew"] },
      suggestedBy: { type: ObjectId, default: null },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
