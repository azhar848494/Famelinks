const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const mediaSchema = new Schema({
    type: { type: String, required: true, enum: ['image', 'video'] },
    media: { type: String, required: true }
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('cluboffers', new Schema({
    title: { type: String, default: "" },
    createdBy: { type: ObjectId, required: true },
    offer: { type: String, enum: ['posting'], default: 'posting' },
    club: { type: String, enum: ['Bud', 'Rising', 'Known', 'Celebrity', 'Star', 'Superstar'], required: true },
    type: { type: String, enum: ['followlinks', 'funlinks'], required: true },
    startDate: { type: Date, required: true, default: null },
    // totalMilestone: { type: Number, required: true, default: 0 }, //Capture this directly from post's document
    requiredMilestone: { type: Number, required: true, default: 0 },
    days: { type: Number, required: true, default: 0 },
    category: { type: [String], default: [] },
    location: { type: [ObjectId], required: true, default: [] },
    ageGroup: {
        type: [String],
        enum: [
            "groupA",
            "groupB",
            "groupC",
            "groupD",
            "groupE",
            "groupF",
            "groupG",
            "groupH",
        ],
        default: ['groupD'] 
    },
    gender: {
      type: [String],
      default: ["male", "female", "other"],
    },
    media: { type: [mediaSchema], default: [] },
    message: { type: String, default: "" },
    influencerCost: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    selectedPromoter: { type: ObjectId, default: null },
    postId: { type: ObjectId, default: null }, // This is the post used in any club offer,
    savedPromoters: { type: [ObjectId], default: [] },
    isClosed: { type: Boolean, default: false }, //=>Offer is closed for new applications and offer has been granted and is waiting for completion
    isDeleted: { type: Boolean, default: false },
    isSafe: { type: Boolean, default: true },
    isCompleted: { type: Boolean, default: false }, //=>Offer is completed
    offerCode: { type: String, default: null },
    completedAt: { type: Date },
    paymentId: { type: String, default: null },
}, {
    versionKey: false,
    timestamps: true
}))