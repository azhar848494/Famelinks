const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = mongoose.model('clubcategories', new Schema({
    name: { type: String, default: '' }
}, {
    versionKey: false,
    timestamps: true
}))