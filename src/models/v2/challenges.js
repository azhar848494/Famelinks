const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

//This is ONLY for user created challenges

module.exports = mongoose.model(
  "challenges",
  new Schema(
    {
      type: {
        type: String,
        required: true,
        enum: ["followlinks", "funlinks", "brand"],
      },
      hashTag: {
        type: String,
        default: null,
        index: "text",
      },
      createdBy: {
        type: ObjectId,
        default: null,
      },
      startDate: {
        type: Date,
        required: false,
        default: new Date(),
      },
      time: {
        type: String,
        required: false,
        default: function() {
          return new Date().toLocaleTimeString('en-US', { hour12: true });
        }
      },    
      totalCoin: { type: Number },
      totalUser: { type: Number },
      giftCoins: { type: Number },
      isDeleted: { type: Boolean, default: false },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
