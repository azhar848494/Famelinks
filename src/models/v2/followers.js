const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('followers', new Schema({
    followeeId: { type: ObjectId, required: true },
    followerId: { type: ObjectId, required: true },
    postId: { type: ObjectId },//Used this for recommendation
    // accept: { type: Boolean, default: false },
    acceptedDate: { type: Date, default: null },
    type: { type: String, enum: ['user', 'channel'], required: true },
    isSeen: { type: Boolean, default: false },
}, {
    versionKey: false,
    timestamps: true
}));