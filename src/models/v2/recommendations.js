const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('recommendations', new Schema({
    data: { type: String, required: true },
    recommendedBy: { type: ObjectId, required: true },
    recommendedTo: { type: ObjectId, required: true },
}, {
    versionKey: false,
    timestamps: true
}));