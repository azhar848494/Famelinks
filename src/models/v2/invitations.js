const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
  "invitations",
  new Schema(
    {
      jobId: { type: ObjectId, required: true },
      jobType: { type: String, required: true, enum: ["faces", "crew"]  },
      from: { type: ObjectId, required: true },
      to: { type: ObjectId, required: true },
      status: { type: String, required: true, enum: ["invited", "withdrawn"] },
      category: { type: String, enum: ["job", "follow"] }, // follow => A user invites other user to follow him/her. job => brand/agency invites user for the job.
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);