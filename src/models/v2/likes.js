const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('likes', new Schema({
    userId: { type: ObjectId, required: true },
    mediaId: { type: ObjectId, required: true },
    status: { type: Number, required: true, enum: [0, 1, 2, 3] },
    parentId: { type: ObjectId, default: null }
}, {
    versionKey: false,
    timestamps: true
}));