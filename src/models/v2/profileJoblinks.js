const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

//MasterIdMigration
module.exports = new Schema(
    {
        name: { type: String, default: null },
        bio: { type: String, default: '' },
        profession: { type: String, default: '' },
        isRegistered: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        profileImage: { type: String, default: null },
        savedJobs: { type: [ObjectId], default: [] },
        profileImageType: {
            type: String,
            default: null,
            enum: ["avatar", "image", null],
        },
        url: { type: String, default: '' }, //This is only for Agency
        savedTalents: { type: [ObjectId], default: [] }, //this is only for brand & agency
        greetText: { type: String, default: '' },
        greetVideo: { type: String, default: '' },
        profileFaces: { type: ObjectId, default: null },
        profileCrew: { type: ObjectId, default: null },
        isSuspended: { type: Boolean, default: false },
    },
    {
        versionKey: false,
        timestamps: true,
    }
)