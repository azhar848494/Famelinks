const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const famelinksSchema = new Schema(
  {
    closeUp: { type: String, default: null },
    medium: { type: String, default: null },
    long: { type: String, default: null },
    pose1: { type: String, default: null },
    pose2: { type: String, default: null },
    additional: { type: String, default: null },
    video: { type: String, default: null },
    challengeId: { type: [ObjectId], default: [] }, //it's a fameTrendz Id
    description: { type: String, default: null },
    location: { type: ObjectId, default: null },
    userId: { type: ObjectId, required: true },
    maleSeen: { type: Number, default: 0 },
    femaleSeen: { type: Number, default: 0 },
    likes0Count: { type: Number, default: 0 },
    likes1Count: { type: Number, default: 0 },
    likes2Count: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isSafe: { type: Boolean, default: false },
    districtLevel: { type: Boolean, default: false },
    stateLevel: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model('famelinks', famelinksSchema);