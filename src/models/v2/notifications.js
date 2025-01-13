const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "notifications",
  new Schema(
    {
      source: { type: String, required: true },
      body: { type: String, required: true },
      type: {
        type: String,
        required: true,
        enum: [
          "followUser",
          "commentPost",
          "likePost",
          "likeComment",
          "congratsFollower",
          "challangeStarted",
          "challangeStarting",
          "challangeEnding",
        ],
      },
      sourceId: { type: ObjectId, required: true },
      userId: { type: ObjectId, required: true },
      targetId: { type: ObjectId, required: true },
      sourceMedia: { type: String, default: null },
      sourceMediaType: { type: String, default: null },
      targetMedia: { type: String, default: null },
      data: { type: String, default: null },
      action: { type: String, default: null },
      postType: { type: String, default: null },
      sourceType: { type: String, default: null },
      category: {
        type: String,
        required: true,
        enum: ["general", "requests", "jobs_offers"],
        default: "general",
      },
      tagId: { type: ObjectId, default: null },
      isSeen: { type: Boolean, default: false },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
