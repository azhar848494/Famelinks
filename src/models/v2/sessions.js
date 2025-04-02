const mongoose = require('mongoose')

const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model(
    'sessions',
    new mongoose.Schema(
        {
            type: { type: String, enum: ["in", "out"], required: true },
            userId: { type: ObjectId, required: true },
        },
        {
            versionKey: false,
            timestamps: true,
        },
    ),
)