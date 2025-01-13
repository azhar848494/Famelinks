const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

//This is ONLY for brand created challenges

module.exports = mongoose.model(
  "fametrendzs",
  new Schema(
    {
      hashTag: {
        type: String,
        index: "text",
      },
      sponsor: {
        type: ObjectId,
        default: null,
      },
      description: {
        type: String,
        default: null,
      },
      rewardWinner: {
        type: [String],
        default: ['3K'],
      },
      rewardRunnerUp: {
        type: [String],
        default: ['1K'],
      }, 
      startDate: {
        type: Date,
        required: true,
      },
      category: {
        type: String,
        enum: ["impression", "post", "participants"],
        required: true,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      totalImpressions: {
        type: Number,
        default: 0,
      },
      requiredImpressions: {
        type: Number,
        default: 0,
      },
      totalPost: {
        type: Number,
        default: 0,
      },
      requiredPost: {
        type: Number,
        default: 0,
      },
      totalParticipants: {
        type: Number,
        default: 0,
      },
      requiredParticipants: {
        type: Number,
        default: 0,
      },
      type: {
        type: String,
        required: true,
        enum: ["famelinks"],
      },
      for: {
        type: [String],
        default: ['all'],
      },
      mediaPreference: [
        {
          type: String,
          required: true,
          enum: ["video", "photo"],
        },
      ],
      images: {
        type: [String],
        default: null,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      winner: {
        type: [ObjectId],
        required: false,
      },
      challengeCompleteAt: {
        type: Date,
        required: false,
      },
      time: {
        type: String,
        required: false,
      },
      ageGroup: {
        type: [String],
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
      location: { type: [ObjectId], default: [] },
      milestoneAggrement: {
        type: Object,
        required: false,
      },
      status: {
        type: String,
        required: false,
      },
      paymentId: {
        type: ObjectId,
        default: null,
      },
      trendzCategory: {
        type: [String],
        default: null,
      },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
