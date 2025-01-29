const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('messageModel', new Schema({
    conversationId: { type: ObjectId, required: true, },
    fromId: { type: ObjectId, required: true, },
    toId: { type: ObjectId, required: true, },
    body: { type: String, required: true, },
    readAt: { type: Date, default: null },
}, {
    collection: 'messages',
    versionKey: false,
    timestamps: true
}));