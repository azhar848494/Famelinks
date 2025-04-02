const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

//MasterIdMigration
module.exports = new mongoose.Schema(
  {
    name: { type: String, default: null },
    bio: { type: String, default: null },
    profession: { type: String, default: "" },
    profileImage: { type: String, default: null },
    profileImageX50: { type: String, default: null },
    profileImageX300: { type: String, default: null },
    restrictedList: { type: [ObjectId] },
    isRegistered: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    url: { type: String, default: null },
    bannerMedia: { type: [String], default: null },
    profileImageType: {
      type: String,
      default: null,
      enum: ["avatar", "image", null],
    },
    isSuspended: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)