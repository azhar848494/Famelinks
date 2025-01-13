const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('messages', new Schema({
    senderId: { type: ObjectId, required: true },
    body: { type: String, required: true },
    quote: { type: ObjectId, default: null },
    type: { type: String, required: true, default: 'regular', enum: ['regular', 'job'] },
    chatId: { type: ObjectId, required: true }
}, {
    versionKey: false,
    timestamps: true
}));