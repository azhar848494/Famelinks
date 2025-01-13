const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const heightSchema = new Schema({
    foot: { type: Number, required: true },
    inch: { type: Number, required: true },
}, {
    _id: false,
    versionKey: false
})

module.exports = mongoose.model('jobs', new Schema({
    createdBy: { type: ObjectId, required: true },
    jobType: { type: String, required: true, enum: ['faces', 'crew'] },
    title: { type: String, required: true },
    jobLocation: { type: ObjectId, default: null },
    description: { type: String, default: '' },
    experienceLevel: { type: String, enum: ['fresher', 'experienced', 'any'] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
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
        ]
    },
    height: { type: heightSchema, default: { foot: 0, inch: 0 } },
    gender: { type: String, enum: ["male", "female", "all"], },
    jobCategory: { type: [ObjectId], required: true, default: [] },
    isClosed: { type: Boolean, default: false },
    shortlistedApplicants: { type: [ObjectId], default: [] },
    hiredApplicants: { type: [ObjectId], default: [] },
    lastVisited: { type: Date, default: null }
}, {
    versionKey: false,
    timestamps: true
}))