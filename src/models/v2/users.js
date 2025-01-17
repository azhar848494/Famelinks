const mongoose = require('mongoose');

const softDelete = require('../../utils/softDelete');
//MasterIdMigration
const fameSchema = require('./userProfileFamelinks');
const funSchema = require('./userProfileFunlinks');
const followSchema = require('./userProfileFollowlinks');
const jobSchema = require('./profileJoblinks');
const collabSchema = require('./profileCollablinks');
const storeSchema = require('./profileStorelinks');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

// const tokenSchema = new Schema({
//     access_token: { type: String },
//     expiry_date: { type: String },
//     id_token: { type: String },
//     refresh_token: { type: String },
//     scope: { type: String },
//     token_type: { type: String },
// }, {
//     _id: false,
//     versionKey: false
// });

// const contestSchema = new Schema({
//     closeUp: { type: String, default: null },
//     medium: { type: String, default: null },
//     long: { type: String, default: null },
//     pose1: { type: String, default: null },
//     pose2: { type: String, default: null },
//     additional: { type: String, default: null },
//     video: { type: String, default: null },
//     challengeId: { type: ObjectId, default: null },
//     description: { type: String, default: null },
//     isRegistered: { type: Boolean, default: false },
//     location: { type: ObjectId, default: null },
// }, {
//     _id: false,
//     versionKey: false
// });

const NotificationSettingSchema = new Schema({
  comments: { type: Boolean, default: true },
  likes: { type: Boolean, default: true },
  trendingPosts: { type: Boolean, default: true },
  requestAccepted: { type: Boolean, default: true },
  followRequest: { type: Boolean, default: true },
  newFollower: { type: Boolean, default: true },
  sponser: { type: Boolean, default: true },
  liveEvents: { type: Boolean, default: true },
  upcomingChallenges: { type: Boolean, default: true },
  endingChallenges: { type: Boolean, default: true }
}, {
  _id: false,
  versionKey: false
});

const SettingSchema = new Schema({
  notification: { type: NotificationSettingSchema, default: {} }
}, {
  _id: false,
  versionKey: false
});

const BrandSchema = new Schema({
  websiteUrl: { type: String },
  verificationDoc: { type: [String] },
  bannerMedia: { type: [String] }
}, {
  _id: false,
  versionKey: false
});

const AgencySchema = new Schema({
  websiteUrl: { type: String },
  verificationDoc: { type: [String] },
  bannerMedia: { type: [String] }
}, {
  _id: false,
  versionKey: false
});

module.exports = mongoose.model(
  "users", softDelete(
    new Schema(
      {
        name: { type: String, default: null },
        appleId: { type: String, default: null },
        mobileNumber: { type: String, unique: true, sparse: true },
        gender: {
          type: String,
          default: null,
          enum: ["male", "female", "others", null],
        },
        type: {
          type: String,
          default: "individual",
          enum: ["individual", "brand", "agency"],
        },
        bio: { type: String, default: null },
        location: { type: ObjectId, default: null },
        email: { type: String, unique: true, sparse: true },
        dob: { type: Date, default: null },
        isRegistered: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        verificationDoc: { type: [String] },
        ageGroup: {
          type: String,
          default: "groupD",
          enum: [
            "groupA",
            "groupB",
            "groupC",
            "groupD",
            "groupE",
            "groupF",
            "groupG",
            "groupH",
          ],
        },
        profileImage: { type: String, default: null },
        profileImageType: {
          type: String,
          default: null,
          enum: ["avatar", "image", null],
        },
        settings: { type: SettingSchema, default: {} },
        isVerified: { type: Boolean, default: false },
        followersCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
        // likes0Count: { type: Number, default: 0 },
        // likes1Count: { type: Number, default: 0 },
        // likes2Count: { type: Number, default: 0 },
        pushToken: { type: String, default: null },
        username: { type: String, unique: true, sparse: true },
        verificationVideo: { type: String, default: null },
        referralCode: { type: String, unique: true, sparse: true },
        referredBy: { type: ObjectId, default: null },
        blockList: { type: [ObjectId] },
        restrictedList: { type: [ObjectId] },
        fameCoins: { type: Number, default: 0 },
        // brand: { type: BrandSchema, default: {} },
        // agency: { type: AgencySchema, default: {} },
        // savedMusic: { type: [ObjectId] },
        verificationStatus: {
          type: String,
          enum: ["Submitted", "Verified", "Rejected", "Pending"],
          default: "Pending",
        },
        // trendWinner: { type: [], required: false },
        //MasterIdMigration
        profileFamelinks: { type: fameSchema, default: {} },
        profileFunlinks: { type: funSchema, default: {} },
        profileFollowlinks: { type: followSchema, default: {} },
        profileJoblinks: { type: jobSchema, default: {} },
        profileStorelinks: { type: storeSchema, default: {} },
        profileCollablinks: { type: collabSchema, default: {} },
        savedProducts: { type: [ObjectId], default: [] },
        isSuspended: { type: Boolean, default: false },
        deleteDate: { type: Date, default: null },
        profile_type: {
          type: String,
          default: "public",
          enum: ["public", "private", "licvate"],
        },
        inChat: { type: ObjectId, default: null },
        isSeenContest: false,
      },
      {
        versionKey: false,
        useNestedStrict: true,
        timestamps: true,
      }
    ),
  ),
);

// challenges: { type: [ ObjectId ] },
// achievements: {
//     winner:
// }
// • Current Title:
// • Winners
// • Runner Ups
// • Challenges Won
// • Winner Badge on profile