const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

//MasterIdMigration
module.exports = new Schema(
  {
    // followers: { type: Number, default: 0 },
    // following: { type: Number, default: 0 },
    // followRequests: { type: [ObjectId] },
    name: { type: String, default: null },
    bio: { type: String, default: null },
    profession: { type: String, default: null },
    profileImage: { type: String, default: null },
    profileImageX50: { type: String, default: null },
    profileImageX300: { type: String, default: null },
    restrictedList: { type: [ObjectId] },
    isRegistered: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    profileImageType: {
      type: String,
      default: null,
      enum: ["avatar", "image", null],
    },
    isSuspended: { type: Boolean, default: false },
    clubCategory: { type: [ObjectId], default: [] }
  },
  {
    versionKey: false,
    timestamps: true,
  }
)