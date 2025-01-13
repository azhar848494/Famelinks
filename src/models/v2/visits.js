const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('visits', new mongoose.Schema({
    type: { type: String, enum: ['profile', 'url'] },
    count: { type: Number, default: 0 },
    brandId: { type: ObjectId, required: true },
    profileId: { type: ObjectId, required: true },
    lastVisited: { type: Date, required: true }
}, {
    versionKey: false,
    timestamps: true,
}
)) 