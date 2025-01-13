const mongoose = require('mongoose')

const Schema = mongoose.Schema;

module.exports = mongoose.model('clubs', new Schema({
    name: { type: String },
    minRange: { type: Number },
    maxRange: { type: Number },
    minCost: { type: Number },
    maxCost: { type: Number },
    type: { type: String, enum: ['followlinks', 'funlinks'] }
}, {
    versionKey: false,
    timestamps: true
}))