const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;


module.exports = mongoose.model('ambassadors', new Schema({
    title: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    level: { type: String },
    type: { type: String, enum: ['famelinks', 'funlinks'] },
    location: { type: ObjectId, default: null },
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
    ambassador: { type: ObjectId } //this is famelinks/funlinks profile id
}))
