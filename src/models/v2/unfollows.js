const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('unfollows', new Schema({
    type: { type: String, enum: ['user', 'channel'], required: true },
    followeeId: { type: ObjectId, required: true },
    followerId: { type: ObjectId, required: true },
    postId: { type: ObjectId },//Used this for recommendation
}, {
    versionKey: false,
    timestamps: true
}));