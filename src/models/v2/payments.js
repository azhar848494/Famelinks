const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "payments",
  new Schema(
    {
      userId: { type: ObjectId, default: null },
      purposeId: { type: ObjectId, default: null },
      amount: { type: Number, required: true, default: null },
      paymentPurpose: { type: String, default: null },
      paymentRef: { type: String, default: null },
      currency: { type: String, default: "INR" },
      txType: { type: String, default: "send", enum: ["received", "send"] },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
