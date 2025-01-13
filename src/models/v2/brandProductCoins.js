const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "brandProductCoins",
  new Schema(
    {
      productId: { type: ObjectId, required: true },
      totalAllotedCoins: { type: Number, default: 0 },
      perTagCoins: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
