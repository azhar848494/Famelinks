const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

//Agents=>Collab, brand=>product, user=>null

const tagSchema = new Schema({
  tagId: { type: ObjectId },
  accepted: { type: Boolean, default: false }
})

const funlinksSchema = new Schema(
  {
    video: { type: String, required: true },
    challengeId: { type: [ObjectId], default: [] },
    description: { type: String, default: null },
    location: { type: ObjectId, default: null },
    userId: { type: ObjectId, required: true },
    seen: { type: Number, default: 0 },
    musicName: { type: String, default: null },
    musicId: { type: ObjectId, default: null },
    audio: { type: String, default: null },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isSafe: { type: Boolean, default: false },
    tags: { type: [tagSchema], default: [] }, //field added=>v2
    talentCategory: {
      type: [String],
      enum: [
        "Singing",
        "Dancing",
        "Sports",
        "Athlete",
        "Acting",
        "Music",
        "Pranks",
        null,
      ],
      default: null,
    },
    offerId: { type: ObjectId, default: null }
  },
  {
    versionKey: false,
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model('funlinks', funlinksSchema);