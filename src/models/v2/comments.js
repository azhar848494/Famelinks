const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('comments', new Schema({
    userId: { type: ObjectId, required: true },
    mediaId: { type: ObjectId, required: true },
    body: { type: String, required: true },
    parentId: { type: ObjectId, default: null },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
}, {
    versionKey: false,
    timestamps: true
}));