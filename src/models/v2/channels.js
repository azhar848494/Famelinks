const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.Schema

module.exports = mongoose.model('channels', new Schema({
    name: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    isSafe: { type: Boolean, default: true }
}, {
    versionKey: false,
    timestamps: true
}))