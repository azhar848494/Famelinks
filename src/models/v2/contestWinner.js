const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('contestwinner', new Schema({
    title: { type: String },
    level: { type: String },
    location: { type: ObjectId, default: null },
    year: { type: String },
    season: { type: String, enum: ['H1', 'H2'] },
    ageGroup: {
        type: String,
        default: "groupD", //grp18
        enum: [
            "groupA", //grp0
            "groupB", //grp4
            "groupC", //grp12
            "groupD", //grp18 
            "groupE", //grp28
            "groupF", //grp40
            "groupG", //grp50
            "groupH", //grp60+
        ],
    },
    gender: {
        type: String,
        enum: ["male", "female", "others"],
    },
    winner: {
        type: [{
            postCount: { type: Number },
            userId: { type: ObjectId, required: true },
            position: { type: Number, required: true },//winner, 1st and 2nd runnerUp
            hearts: { type: Number }
        }]
    }
}, {
    versionKey: false,
    timestamps: true
}))
