const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "beautycontestwinners",
  new Schema(
    {
      contestId: { type: ObjectId, required: true },
      winners: {
        type: [
          {
            type: {
              userId: { type: ObjectId, required: true },
              score: { type: Number, default: null },
            }
          }
        ],
        default: [],
      },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);