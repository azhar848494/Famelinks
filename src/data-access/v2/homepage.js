const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const appConfig = require("../../../configs/app.config");

const FamelinksDB = require("../../models/v2/famelinks");
const FametrendzsDB = require("../../models/v2/fametrendzs");
const UsersDB = require("../../models/v2/users");

exports.getMostLikedPosts = (
  userId,
  limit,
) => {
  return FamelinksDB.aggregate([
    { $match: { challengeId: { $ne: [] }, video: null } },
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          { $match: { _id: ObjectId(userId) } },
          { $project: { blockList: 1 } },
        ],
        as: "selfUser",
      },
    },
    { $addFields: { blockedUserIds: { $first: "$selfUser.blockList" } } },
    {
      $match: {
        isDeleted: false,
        isSafe: true,
        isBlocked: false,
        userId: { $ne: ObjectId(appConfig.famelinks.officialId) },
        $expr: { $not: [{ $in: ["$userId", "$blockedUserIds"] }] },
      },
    },
    // User
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          {
            $project: {
              name: 1,
              dob: 1,
              bio: 1,
              profession: 1,
              profileImage: '$profileImageX50',
              profileImageType: 1,
              username: 1,
              _id: 1,
              type: 1,
            },
          },
        ],
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },
    // Challenge
    {
      $lookup: {
        from: "fametrendzs",
        let: { challengeId: "$challengeId" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$challengeId"] },
              isDeleted: false,
            },
          },
          { $project: { hashTag: 1 } },
        ],
        as: "challenges",
      },
    },
    { $addFields: { cardTitle: { $first: "$challenges.hashTag" } } },
    {
      $set: {
        closeUp: {
          $cond: {
            if: { $eq: [null, "$closeUp"] },
            then: null,
            else: { $concat: ["$closeUp", "-", "xs"] },
          },
        },
      },
    },
    {
      $set: {
        medium: {
          $cond: {
            if: { $eq: [null, "$medium"] },
            then: null,
            else: { $concat: ["$medium", "-", "xs"] },
          },
        },
      },
    },
    {
      $set: {
        long: {
          $cond: {
            if: { $eq: [null, "$long"] },
            then: null,
            else: { $concat: ["$long", "-", "xs"] },
          },
        },
      },
    },
    {
      $set: {
        pose1: {
          $cond: {
            if: { $eq: [null, "$pose1"] },
            then: null,
            else: { $concat: ["$pose1", "-", "xs"] },
          },
        },
      },
    },
    {
      $set: {
        pose2: {
          $cond: {
            if: { $eq: [null, "$pose2"] },
            then: null,
            else: { $concat: ["$pose2", "-", "xs"] },
          },
        },
      },
    },
    {
      $set: {
        additional: {
          $cond: {
            if: { $eq: [null, "$additional"] },
            then: null,
            else: { $concat: ["$additional", "-", "xs"] },
          },
        },
      },
    },
    {
      $set: {
        video: {
          $cond: {
            if: { $eq: [null, "$video"] },
            then: null,
            else: { $concat: ["$video", "-", "xs"] },
          },
        },
      },
    },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1, } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        cardTitle: 1,
        createdAt: 1,
        name: 1,
        location: { $first: "$location" },
        gender: 1,
        challenges: 1,
        user: 1,
        description: 1,
        likes1Count: 1,
        likes2Count: 1,
        media: [
          {
            path: "$video",
            type: "video",
          },
          {
            path: "$closeUp",
            type: "closeUp",
          },
          {
            path: "$medium",
            type: "medium",
          },
          {
            path: "$long",
            type: "long",
          },
          {
            path: "$pose1",
            type: "pose1",
          },
          {
            path: "$pose2",
            type: "pose2",
          },
          {
            path: "$additional",
            type: "additional",
          },
        ],
      },
    },
  ])
    .addFields({ likes: { $add: ["$likes1Count", "$likes2Count"] } })
    .sort({ likes: "desc" })
    .limit(limit);
};

exports.getTopTrendzs = (limit) => {
  return FametrendzsDB.aggregate([
    {
      $match: {
        $and: [
          { isCompleted: false }
        ]
      }
    },
    { $addFields: { cardTitle: "$hashTag" } },
    { $sort: { createdAt: -1 } },
    { $limit: limit }
  ])
  // return FametrendzsDB.find().sort({ createdAt: "desc" }).limit(limit);
};

exports.getRecentUsers = (limit) => {
  return UsersDB.aggregate([
    {
      $match: {
        $and: [
          { type: 'individual' },
          { isRegistered: true },
          { isDeleted: false },
          { isSuspended: false }
        ]
      }
    },
    { $addFields: { cardTitle: "$name" } },
    { $project: { _id: 1, name:1, username:1, profileImage: '$profileImageX50', profileImageType: 1, type: 1, cardTitle: 1 } },
    { $set: { profileImageType: { $cond: [{ $ifNull: ["$profileImageType", false] }, '$profileImageType', ""] } } },
    { $sort: { createdAt: -1 } },
    { $limit: limit }
  ])
};
