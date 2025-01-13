const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

//Agents=>Collab, brand=>product, user=>null


const mediaSchema = new Schema(
  {
    type: { type: String, required: true, enum: ["image", "video"] },
    media: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const collablinksSchema = new Schema(
  {
    media: { type: [mediaSchema] },
    description: { type: String, default: null },
    location: { type: ObjectId, default: null },
    userId: { type: ObjectId, required: true },
    seen: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isSafe: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("collablinks", collablinksSchema);
