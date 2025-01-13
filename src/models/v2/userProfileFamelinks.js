const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

//MasterIdMigration
module.exports = new Schema(
  {
    name: { type: String, default: null },
    // hearts: { type: Number, default: 0 },
    //currentScore: { type: Number, default: 0 },
    // titlesWon: { type: [String] },
    bio: { type: String, default: null },
    profession: { type: String, default: null },
    profileImage: { type: String, default: null },
    likes0Count: { type: Number, default: 0 },
    likes1Count: { type: Number, default: 0 },
    likes2Count: { type: Number, default: 0 },
    restrictedList: { type: [ObjectId] },
    isRegistered: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    trendWinner: { type: [], required: false },
    presentDates: { type: [Date] },
    //ambassador: { type: [ObjectId] },
    //contestWon: { type: [ObjectId] } fetch from contestWinner collection while aggregation
    profileImageType: {
      type: String,
      default: "",
      enum: ["avatar", "image", ""],
    },
    isSuspended: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

