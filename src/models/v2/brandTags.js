const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "brandTags",
  new Schema(
    {
      productId: { type: ObjectId, default: null },
      postId: { type: ObjectId, default: null },
      giftCoins: { type: Number, default: 0 },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
