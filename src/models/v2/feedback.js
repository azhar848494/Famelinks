const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('feedbacks', new Schema({
    body: { type: String, required: true },
    userId: { type: ObjectId, requied: true }
}, {
    versionKey: false,
    timestamps: true
}));