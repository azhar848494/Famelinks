const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const heightSchema = new Schema({
    foot: { type: Number },
    inch: { type: Number },
}, {
    _id: false,
    versionKey: false
})

module.exports = mongoose.model(
    "hiringprofiles",
    new Schema(
        {
            type: { type: String, enum: ['faces', 'crew'], required: true },
            userId: { type: ObjectId, required: true },
            experienceLevel: { type: String, enum: ["fresher", "experienced"], default: 'fresher' },
            workExperience: { type: String, default: '' },
            achievements: { type: String, default: '' },
            interestedLoc: { type: [ObjectId], default: [] },
            interestCat: { type: [ObjectId], default: [] },
            height: { type: heightSchema, default: { foot: 0, inch: 0 } },
            weight: { type: Number, default: 0 },
            bust: { type: Number, default: 0 },
            waist: { type: Number, default: 0 },
            hip: { type: Number, default: 0 },
            eyeColor: { type: String, default: '' },
            complexion: {
                type: String,
                default: ''
            },
        },
        {
            versionKey: false,
            timestamps: true,
        }
    )
);