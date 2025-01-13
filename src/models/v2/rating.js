const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "rating",
  new Schema(
    {
      userId: { type: ObjectId, default: null },
      trendId: { type: ObjectId, default: null },
      rating: {  type: Number, required: true, default: null,  },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
