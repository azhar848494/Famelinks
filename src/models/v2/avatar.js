const mongoose = require('mongoose')

module.exports = mongoose.model('avatar', new mongoose.Schema({
    name: { type: String, default: null },
    gender: { type: String, default: null, enum: ["male", "female", "others", null] },
    ageGroup: {
        type: String,
        default: "groupD",
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
    },
}, {
    versionKey: false,
    timestamps: true,
}))