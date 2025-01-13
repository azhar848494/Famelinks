const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

module.exports = mongoose.model('winners', new Schema({
    userId: { type: ObjectId },
    contestId: { type: ObjectId },
    district: { type: ObjectId },
    state: { type: ObjectId },
    country: { type: ObjectId },
    ageGroup: { type: String },
    year: { type: String },
}, {
    versionKey: false,
    timestamps: true
}))