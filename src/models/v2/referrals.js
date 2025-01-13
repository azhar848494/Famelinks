const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('referrals', new Schema({
    referralCode: { type: String, required: true },
    referredTo: { type: ObjectId, required: true },
    referrerRewardsPoints: { type: Number, required: true, default: 0 },
    referreeRewardsPoints: { type: Number, required: true, default: 0 }
}, {
    versionKey: false,
    timestamps: true
}));