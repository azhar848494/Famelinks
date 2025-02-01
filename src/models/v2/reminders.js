const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "reminders",
  new Schema(
    {
      type: { type: String, required: true, enum: ["trendz"] },
      sourceId: { type: ObjectId, required: true },
      userId: { type: ObjectId, required: true },
      triggerAt: { type: Date }
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
