const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Schema = mongoose.Schema;

module.exports = mongoose.model('musics', new Schema({
    music: { type: String, required: true },
    by: { type: String, required: true },
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    addedBy: { type: String, required: true, enum: ['admin', 'user'] },
    thumbnail: { type: String },
    uploadedBy: { type: ObjectId, default: null }
}, {
    versionKey: false,
    timestamps: true
}));