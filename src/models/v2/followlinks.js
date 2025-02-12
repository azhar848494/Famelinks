const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

//Agents=>Collab, brand=>product, user=>null

const tagSchema = new Schema({
  tagId: { type: ObjectId },
  accepted: { type: Boolean, default: false }
})

// const mediaSchema = new Schema({
//   type: { type: String, required: true, enum: ['image', 'video'] },
//   media: { type: String, required: true }
// }, {
//   versionKey: false,
//   timestamps: true
// });

const followlinksSchema = new Schema(
  {
    closeUp: { type: String, default: null },
    medium: { type: String, default: null },
    long: { type: String, default: null },
    pose1: { type: String, default: null },
    pose2: { type: String, default: null },
    additional: { type: String, default: null },
    video: { type: String, default: null },
    challengeId: { type: [ObjectId], default: [] },
    description: { type: String, default: null },
    location: { type: ObjectId, default: null },
    userId: { type: ObjectId, required: true },
    seen: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isSafe: { type: Boolean, default: false },
    // tags: { type: [tagSchema], default: [] }, //field added=>v2,
    channelId: { type: ObjectId, default: null },
    offerId: { type: ObjectId, default: null },
    productId: { type: ObjectId },
    reachIds: { type: [ObjectId], default: [] },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model('followlinks', followlinksSchema);