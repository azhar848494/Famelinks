const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

//MasterIdMigration
module.exports = mongoose.Schema(
  {
    name: { type: String, default: null },
    bio: { type: String, default: null },
    profession: { type: String, default: "" },
    profileImage: { type: String, default: null },
    restrictedList: { type: [ObjectId] },
    isRegistered: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    url: { type: String, default: null },
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