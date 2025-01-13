const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('locatns', new Schema({
    type: { type: String, required: true },
    value: { type: String, required: true, },
    parentId: { type: ObjectId, default: null },
    scopes: { type: [ObjectId], default: null },
}, {
    versionKey: false,
    timestamps: true
}));