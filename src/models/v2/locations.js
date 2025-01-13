const mongoose = require('mongoose');

const Schema = mongoose.Schema;

module.exports = mongoose.model('locations', new Schema({
    district: { type: String, required: true, index: 'asc' },
    state: { type: String, required: true },
    country: { type: String, required: true },
    continent: { type: String, required: true }
}, {
    versionKey: false,
    timestamps: true
}));