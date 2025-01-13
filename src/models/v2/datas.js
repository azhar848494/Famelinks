const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = mongoose.model(
  "datas",
  new Schema(
    {
      type: { type: String },
      array: { type: []},
    },
    {
      versionKey: false,
      timestamps: true,
    }
  )
);
