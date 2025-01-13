const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

module.exports = mongoose.model('views', new Schema({
    userId: { type: ObjectId, required: true },
    mediaId: { type: ObjectId, required: true },
    type: { type: String, enum: ['funlinks', 'followlinks'] }
}, {
    versionKey: false,
    timestamps: true
}))