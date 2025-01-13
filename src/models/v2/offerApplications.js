const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('offerapplications', new Schema({
    userId: { type: ObjectId, required: true },
    offerId: { type: ObjectId, required: true },
    status: { type: String, enum: ['applied', 'selected'], default: 'applied' },
    selectedDate: { type: Date, default: null }
},
    {
        versionKey: false,
        timestamps: true,
    }
))