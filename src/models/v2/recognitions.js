const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('recognitions', new Schema({
    userId: { type: ObjectId, required: true },
    video: { type: String, default: null },
}, {
    versionKey: false,
    timestamps: true
}));