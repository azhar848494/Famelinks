const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "agencyTags",
  new Schema(
    {
      receiverId: { type: ObjectId, default: null },
      postId: { type: ObjectId, default: null },
      status: { type: String, enum: ["accepted", "pending"], default: "pending" },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
