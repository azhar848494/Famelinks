const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "chats",
  new Schema(
    {
      title: { type: String, default: null },
      members: { type: [ObjectId], required: true },
      isGroup: { type: Boolean, required: true, default: false },
      requests: { type: [ObjectId] },
      readBy: { type: [ObjectId] },
      category: {
        type: String,
        enum: ["conversation", "jobChat"],
        default: "conversation",
      },
      jobId: { type: ObjectId, default: null },
      isClosed: { type: Boolean, default: false },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);