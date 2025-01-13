const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('reports', new Schema({
    body: { type: String, default: null },
    name: { type: String, default: null },
    type: { type: String, required: true, enum: ['famelinks', 'funlinks', 'followlinks', 'comment', 'issue', 'user', 'joblinks'] },
    userId: { type: ObjectId, default: null },
    mobileNumber: { type: String, default: null },
    email: { type: String, default: null },
    targetId: { type: ObjectId, default: null },
    category: { type: String, default: null, enum: ['nudity', 'spam', 'vulgarity', 'abusive', 'rasicm', 'copyright', 'other', 'fake', null] }
}, {
    versionKey: false,
    timestamps: true
}));