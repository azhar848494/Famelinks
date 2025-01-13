const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "jobcategories",
  new Schema(
    {
      jobName: { type: String, required: true },
      jobType: { type: String, required: true, enum: ["faces", "crew"] },
      // userType: { type: [String], required: true, enum: ['individual', 'brand', 'agency'] },
      jobCategory: { type: [String], default: null },
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);