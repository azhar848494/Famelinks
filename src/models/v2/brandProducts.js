const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const mediaSchema = new Schema({
    type: { type: String, required: true, enum: ['image', 'video'] },
    media: { type: String, required: true }
}, {
    versionKey: false,
    timestamps: true
});

const brandProductSchema = new Schema({
    media: { type: [mediaSchema] },
    challengeId: { type: ObjectId, default: [] },
    description: { type: String, default: null },
    location: { type: ObjectId, default: null },
    purchaseUrl: { type: String, default: null },
    buttonName: { type: String, default: null },
    name: { type: String, default: null },
    hashTag: { type: String, default: null }, //@=>tag
    userId: { type: ObjectId, required: true },
    price: { type: Number, default: 0 },
    maleSeen: { type: Number, default: 0 },
    femaleSeen: { type: Number, default: 0 },
    // likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isSafe: { type: Boolean, default: false },
    tags: { type: [ObjectId], default: [] },
    // allotedCoins: { type: Number, default: 0 },
    // giftCoins: { type: Number, default: 0 }
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('brandproducts', brandProductSchema);