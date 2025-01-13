const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

//MasterIdMigration
module.exports = new Schema(
  {
    // totalLikes: { type: Number, default: 0 },
    // totalViews: { type: Number, default: 0 },
    bio: { type: String },
    name: { type: String, default: null },
    profession: { type: String, default: null },
    restrictedList: { type: [ObjectId] },
    isRegistered: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    profileImage: { type: String, default: null },
    savedMusic: { type: [ObjectId] },
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