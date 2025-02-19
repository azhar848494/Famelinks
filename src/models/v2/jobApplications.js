const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

module.exports = mongoose.model('jobapplications', new Schema({
    userId: { type: ObjectId, required: true },
    jobId: { type: ObjectId, required: true },
    jobType: { type: String, required: true, enum: ["faces", "crew"]  },
    status: { type: String, enum: ['applied', 'withdraw', 'shortlisted', 'hired'], default: 'applied' }
},
    {
        versionKey: false,
        timestamps: true,
    }
))