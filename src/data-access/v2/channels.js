const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const ChannelsDB = require("../../models/v2/channels");
const FollowerDB = require("../../models/v2/followers");
const UnFollowDB = require("../../models/v2/unfollows");

exports.createChannel = (payload) => {
  return ChannelsDB.create(payload);
};

exports.getChannelSuggestion = (selfMasterId, page) => {
  let pagination = page ? page : 1;
  return ChannelsDB.aggregate([
    { $match: { isDeleted: false, isSafe: true } },
    { $sort: { updatedAt: -1 } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$followeeId", "$$followeeId"] } },
                { followerId: selfMasterId },
                { acceptedDate: { $ne: null } },
                { type: "channel" },
              ],
            },
          },
        ],
        as: "followStatus",
      },
    },
    { $match: { $expr: { $eq: [0, { $size: "$followStatus" }] } } },
    {
      $lookup: {
        from: "followlinks",
        let: { channelId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$channelId", "$$channelId"] } } },
          { $sort: { updatedAt: -1 } },
          { $project: { userId: 1, media: 1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$userId"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
                {
                  $project: {
                    username: 1,
                    type: 1,
                    _id: 1,
                    dob: 1,
                    profile: {
                      name: "$profileFollowlinks.name",
                      bio: "$profileFollowlinks.bio",
                      profession: "$profileFollowlinks.profession",
                      profileImage: "$profileFollowlinks.profileImage",
                      profileImageType: "$profileFollowlinks.profileImageType",
                    }
                  },
                },
              ],
              as: "user",
            },
          },
          { $addFields: { user: { $first: "$user" } } },
          {
            $project: {
              media: 1,
              user: 1,
            },
          },
        ],
        as: "posts",
      },
    },
    { $project: { name: 1, posts: 1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.followUnfollow = async (masterId, channelId, action, acceptedDate, type) => {
  if (action == "follow") {
    return FollowerDB.updateOne(
      {
        followerId: masterId,
        followeeId: channelId,
      },
      {
        followerId: masterId,
        followeeId: channelId,
        acceptedDate,
        type,
      },
      {
        upsert: true,
      }
    );
  }

  if (action == "unfollow") {
    await UnFollowDB.updateOne(
      {
        followerId: masterId,
        followeeId: channelId,
      },
      {
        followerId: masterId,
        followeeId: channelId,
        type,
      },
      {
        upsert: true,
      }
    )
    return FollowerDB.deleteOne({
      followerId: masterId,
      followeeId: channelId,
      type,
    });
  }
};

exports.searchChannel = (userId, data, page) => {
  let pagination = page ? page : 1;
  return ChannelsDB.aggregate([
    {
      $match: {
        $and: [
          { name: { $regex: `^.*?${data}.*?$`, $options: "i" } },
          { isDeleted: false },
          { isSafe: true },
        ],
      },
    },
    {
      $lookup: {
        from: "followlinks",
        let: { channelId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$channelId", "$$channelId"] },
              isDeleted: false,
            },
          },
          {
            $project: {
              _id: 1, likesCount: 1, media: [
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
              ], userId: 1
            }
          },
          { $sort: { likesCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                {
                  $project: {
                    name: "$profileFollowlinks.name",
                    _id: 0,
                  },
                },
              ],
              as: "user",
            },
          },
          { $addFields: { name: { $first: "$user.name" } } },
          {
            $project: {
              likesCount: 0,
              userId: 0,
              user: 0,
            },
          },
        ],
        as: "posts",
      },
    },
    {
      $lookup: {
        from: "followers",
        let: { followerId: userId, followeeId: "$userId" },
        pipeline: [
          {
            $match: {
              followerId: "$followerId",
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $ne: null },
              type: "channel",
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "following",
      },
    },
    {
      $addFields: {
        following: {
          $cond: [{ $eq: [{ $size: "$following" }, 1] }, true, false],
        },
      },
    },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $ne: null },
              type: "channel",
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "followersCount",
      },
    },
    { $addFields: { followersCount: { $size: "$followersCount" } } },
    {
      $match: {
        following: false,
      },
    },
    { $sort: { updatedAt: -1 } },
    // { $project: { name: 1,following: 1, followersCount: 1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.getChannelById = (channelId) => {
  return ChannelsDB.findOne({ _id: channelId }).lean();
};

exports.getChannelGrid = (data) => {
  return ChannelsDB.aggregate([
    {
      $match: {
        _id: ObjectId(data.channelId),
        isDeleted: false,
        isSafe: true,
      },
    },
    { $sort: { createdAt: 1 } },
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$_id" },
        pipeline: [
          {
            $match: {
              followerId: data.userId,
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $ne: null },
              type: "channel",
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
      $lookup: {
        from: "followlinks",
        let: { value: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$channelId", "$$value"] },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "postCount",
      },
    },
    { $addFields: { postCount: { $size: "$postCount" } } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $ne: null },
              type: "channel",
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "followersCount",
      },
    },
    { $addFields: { followersCount: { $size: "$followersCount" } } },
    {
      $lookup: {
        from: "followlinks",
        let: { channelId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$channelId", "$$channelId"] },
              isDeleted: false,
            },
          },
          {
            $project: {
              _id: 1,
              closeUp: 1,
              medium: 1,
              long: 1,
              pose1: 1,
              pose2: 1,
              additional: 1,
              video: 1,
              likesCount: 1,
              userId: 1,
              viewCount: { $size: '$reachIds' },
            },
          },
          { $sort: { likesCount: -1 } },
          { $skip: (data.page - 1) * 10 },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                {
                  $project: {
                    name: "$profileFollowlinks.name",
                    _id: 0,
                  },
                },
              ],
              as: "user",
            },
          },
          { $addFields: { name: { $first: "$user.name" } } },
          {
            $project: {
              likesCount: 0,
              user: 0,
            },
          },
        ],
        as: "posts",
      },
    },
  ]);
};


exports.getchannelPosts = (userId, page) => {
  return ChannelsDB.aggregate([
    {
      $match: {
        $and: [{ isDeleted: false }, { isSafe: true }],
      },
    },
    {
      $lookup: {
        from: "followlinks",
        let: { channelId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$channelId", "$$channelId"] },
              isDeleted: false,
            },
          },
          {
            $project: {
              _id: 1,
              likesCount: 1,
              closeUp: 1,
              medium: 1,
              long: 1,
              pose1: 1,
              pose2: 1,
              additional: 1,
              video: 1,
              userId: 1
            }
          },
          { $sort: { likesCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                {
                  $project: {
                    name: "$profileFollowlinks.name",
                    _id: 0,
                  },
                },
              ],
              as: "user",
            },
          },
          { $addFields: { name: { $first: "$user.name" } } },
          {
            $project: {
              likesCount: 0,
              userId: 0,
              user: 0,
            },
          },
        ],
        as: "posts",
      },
    },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$_id" },
        pipeline: [
          {
            $match: {
              followerId: ObjectId(userId),
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $ne: null },
              type: "channel",
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "following",
      },
    },
    {
      $addFields: {
        following: {
          $cond: [{ $eq: [{ $size: "$following" }, 1] }, true, false],
        },
      },
    },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $ne: null },
              type: "channel",
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "followersCount",
      },
    },
    { $addFields: { followersCount: { $size: "$followersCount" } } },
    {
      $match: {
        following: false,
      },
    },
  ])
    .sort({
      updatedAt: "desc",
    })
    .skip((page - 1) * 10)
    .limit(10);
};