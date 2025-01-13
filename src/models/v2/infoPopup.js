const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = mongoose.model('infoPopup', new Schema({
    image: { type: String, default: null },
    video: { type: String, default: null },
    data: { type: String, default: null },
    states: { type: [String]},
    districts: { type: [String]},
    countries: { type: [String]},
    continents: { type: [String]},
    ageGroups: { type: [String], enum: ['groupA', 'groupB', 'groupC', 'groupD', 'groupE', 'groupF', 'groupG', 'groupH'] },
    genders: { type: [String], enum: ['male', 'female', 'others'] },
}, {
    versionKey: false,
    timestamps: true
}));