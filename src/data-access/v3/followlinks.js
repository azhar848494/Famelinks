const mongoose = require("mongoose");
const appConfig = require("../../../configs/app.config");
const ObjectId = mongoose.Types.ObjectId;

const FollowlinksDB = require("../../models/v2/followlinks");

const getFollowLinksWelcomeVideo = (childProfileId, userId, page) => {
  return FollowlinksDB.aggregate([
    { $match: { isWelcomeVideo: { $exists: true }, isDeleted: false } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "profilefollowlinks",
        let: { userId: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
          {
            $lookup: {
              from: "users",
              let: { userId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$profileFollowlinks", "$$userId"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              as: "masterUser",
            },
          },
          {
            $addFields: {
              _id: { $first: "$masterUser._id" },
              // name: { $first: "$masterUser.name" },
            },
          },
          {
            $group: {
              _id: "$_id",
              name: { $first: "$name" },
            },
          },
        ],
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },
    { $match: { $expr: { $ne: ["$user._id", null] } } },

    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$user._id" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: ObjectId(userId),
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $ne: null },
              type: "user",
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "followStatus",
      },
    },
    {
      $addFields: {
        followStatus: {
          $cond: [{ $eq: [{ $size: "$followStatus" }, 1] }, true, false],
        },
      },
    },
    {
      $match: {
        followStatus: true,
      },
    },
  ])
    .skip((page - 1) * 10)
    .limit(10);
};

module.exports = {
  getFollowLinksWelcomeVideo,
};
