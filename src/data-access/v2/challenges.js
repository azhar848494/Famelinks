const mongoose = require("mongoose");

const ChallengeDB = require("../../models/v2/challenges");
const fameTrendzDB = require("../../models/v2/fametrendzs");
const FunlinksDB = require("../../models/v2/funlinks");
const famelinks = require("../../models/v2/famelinks");
const FollowlinksDB = require("../../models/v2/followlinks");
const FameContestDB = require("../../models/v2/fameContest")

const ObjectId = mongoose.Types.ObjectId;

exports.addFunChallenge = (payload) => {
  return ChallengeDB.create(payload);
};

exports.getOpenFametrendzs = (search, page, userId) => {
  console.log('userId ::: ', userId)
  return fameTrendzDB.aggregate([
    {
      $match: {
        $and: [
          { hashTag: { $regex: `^.*?${search}.*?$`, $options: "i" } },
          { isDeleted: false },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sponsor",
        pipeline: [
          { $project: { _id: 1, type: 1, username: 1, name: 1, profileImage: '$profileImageX50', profileImageType: 1 } },
          {
            $set: {
              profileImageType: {
                $cond: [
                  { $ifNull: ["$profileImageType", false] },
                  "$profileImageType",
                  "",
                ],
              },
            },
          },
          { $addFields: { followStatus: 0 } },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
              pipeline: [
                {
                  $match: {
                    followerId: userId,
                    $expr: { $eq: ["$followeeId", "$$followeeId"] },
                    acceptedDate: { $eq: null },
                    type: "user",
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "requested",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
              },
            },
          },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
              pipeline: [
                {
                  $match: {
                    followerId: userId,
                    $expr: { $eq: ["$followeeId", "$$followeeId"] },
                    acceptedDate: { $ne: null },
                    type: "user",
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "following",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
              },
            },
          },
          {
            $addFields: {
              followStatus: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
                    { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
                    { case: { $eq: ["$followStatus", 2] }, then: "Following" },
                  ],
                  default: "Follow",
                },
              },
            },
          },
        ],
        as: "sponsor",
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                ],
              },
            },
          },
          {
            $addFields: {
              likesCount: { $add: ["$likes1Count", "$likes2Count"] },
            },
          },
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
          { $project: { _id: 1, likesCount: 1 } },
          { $sort: { likesCount: -1 } },
          { $limit: 10 },
        ],
        as: "posts",
      },
    },
    {
      $lookup: {
        from: "ratings",
        let: { trendId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$trendId", "$$trendId"] } },
                { userId: userId },
              ],
            },
          },
        ],
        as: "rating",
      },
    },
    {
      $set: {
        rating: {
          $cond: [
            { $eq: [0, { $size: "$rating" }] },
            null,
            { $first: "$rating.rating" },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$userId',
            }
          },
          {
            $lookup: {
              from: "users",
              let: { userId: "$_id" },
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
                    profileImageType: 1,
                    profileImage: '$profileImageX50',
                  },
                },
              ],
              as: "masterUser",
            },
          },
          {
            $project: {
              _id: '$_id',
              username: { $first: "$masterUser.username" },
              profileImageType: { $first: "$masterUser.profileImageType" },
              profileImage: { $first: "$masterUser.profileImageX50" },
            },
          },
        ],
        as: "participants",
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$userId',
            }
          },
        ],
        as: "participantsCount",
      },
    },
    {
      $set: {
        participantsCount: {
          $size: "$participantsCount"
        },
      },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
    { $sort: { createdAt: -1 } },
  ]);
};


exports.getAlltrendzs = (page, userId, sponsorId) => {
  return fameTrendzDB.aggregate([
    {
      $match: {
        sponsor: ObjectId(sponsorId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sponsor",
        pipeline: [
          { $project: { _id: 1, type: 1, username: 1, name: 1, profileImage: '$profileImageX50', profileImageType: 1 } },
          {
            $set: {
              profileImageType: {
                $cond: [
                  { $ifNull: ["$profileImageType", false] },
                  "$profileImageType",
                  "",
                ],
              },
            },
          },
          { $addFields: { followStatus: 0 } },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
              pipeline: [
                {
                  $match: {
                    followerId: userId,
                    $expr: { $eq: ["$followeeId", "$$followeeId"] },
                    acceptedDate: { $eq: null },
                    type: "user",
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "requested",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
              },
            },
          },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
              pipeline: [
                {
                  $match: {
                    followerId: userId,
                    $expr: { $eq: ["$followeeId", "$$followeeId"] },
                    acceptedDate: { $ne: null },
                    type: "user",
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "following",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
              },
            },
          },
          {
            $addFields: {
              followStatus: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
                    { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
                    { case: { $eq: ["$followStatus", 2] }, then: "Following" },
                  ],
                  default: "Follow",
                },
              },
            },
          },
        ],
        as: "sponsor",
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                ],
              },
            },
          },
          {
            $addFields: {
              likesCount: { $add: ["$likes1Count", "$likes2Count"] },
            },
          },
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
          { $project: { _id: 1, likesCount: 1 } },
          { $sort: { likesCount: -1 } },
          { $limit: 10 },
        ],
        as: "posts",
      },
    },
    { $addFields: { winnerIds: "$posts._id" } },
    {
      $lookup: {
        from: "famelinks",
        let: { winnerIds: "$winnerIds" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$winnerIds"] } } },
          {
            $project: {
              _id: 1,
              userId: 1,
              country: 1,
              likes1Count: 1,
              likes2Count: 1,
              likesCount: {
                $add: ["$likes1Count", "$likes2Count"],
              },
            },
          },
          { $sort: { likesCount: -1 } },
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "userId",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    type: 1,
                    profileImage: '$profileImageX50',
                    profileImageType: 1,
                  },
                },

              ],
              as: "users",
            },
          },
          {
            $addFields: {
              masterId: { $first: "$users._id" },
              name: { $first: "$users.name" },
              username: { $first: "$users.username" },
              type: { $first: "$users.type" },
              profileImage: { $first: "$users.profileImageX50" },
              profileImageType: { $first: "$users.profileImageType" },
            },
          },
          {
            $group: {
              _id: "$masterId",
              name: { $first: "$name" },
              username: { $first: "$username" },
              type: { $first: "$type" },
              country: { $first: "$country" },
              profileImage: { $first: ".profileImageX50" },
              profileImageType: { $first: "$profileImageType" },
              likes1Count: { $first: "$likes1Count" },
              likes2Count: { $first: "$likes2Count" },
              likesCount: { $first: "$likesCount" },
              postId: { $first: "$_id" },
            },
          },
          { $sort: { likesCount: -1 } },
          { $limit: 5 },
        ],
        as: "winner",
      },
    },
    {
      $lookup: {
        from: "ratings",
        let: { trendId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$trendId", "$$trendId"] } },
                { userId: userId },
              ],
            },
          },
        ],
        as: "rating",
      },
    },
    {
      $set: {
        rating: {
          $cond: [
            { $eq: [0, { $size: "$rating" }] },
            null,
            { $first: "$rating.rating" },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$userId',
            }
          },
          {
            $lookup: {
              from: "users",
              let: { userId: "$_id" },
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
                    profileImageType: 1,
                    profileImage: '$profileImageX50',
                  },
                },
              ],
              as: "masterUser",
            },
          },
          {
            $project: {
              _id: '$_id',
              username: { $first: "$masterUser.username" },
              profileImageType: { $first: "$masterUser.profileImageType" },
              profileImage: { $first: "$masterUser.profileImageX50" },
            },
          },
        ],
        as: "participants",
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$userId',
            }
          },
        ],
        as: "participantsCount",
      },
    },
    {
      $set: {
        participantsCount: {
          $size: "$participantsCount"
        },
      },
    },
    {
      $lookup: {
        from: 'fametrendzs',
        pipeline: [
          { $match: { $expr: { $eq: ['$sponsor', ObjectId(sponsorId)] } } }
        ],
        as: 'trendzSets',
      },
    },
    {
      $addFields: { trendzSets: { $size: '$trendzSets', }, },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
    { $sort: { createdAt: -1 } },
  ]);
};

exports.getTrend = (data) => {
  return famelinks.aggregate([
    {
      $match: {
        userId: ObjectId(data.sponsorId),
        challengeId: { $ne: [] },
      },
    },
    {
      $project: {
        _id: 0,
        challengeId: 1,
      },
    },
    {
      $lookup: {
        from: "fametrendzs",
        let: { value: "$challengeId" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$value"] },
            },
          },
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "sponsor",
              pipeline: [
                { $project: { _id: 1, type: 1, username: 1, name: 1, profileImage: '$profileImageX50', profileImageType: 1 } },
                {
                  $set: {
                    profileImageType: {
                      $cond: [
                        { $ifNull: ["$profileImageType", false] },
                        "$profileImageType",
                        "",
                      ],
                    },
                  },
                },
                { $addFields: { followStatus: 0 } },
                {
                  $lookup: {
                    from: "followers",
                    let: { followeeId: "$_id" }, //master user Id
                    pipeline: [
                      {
                        $match: {
                          followerId: ObjectId(data.userId),
                          $expr: { $eq: ["$followeeId", "$$followeeId"] },
                          acceptedDate: { $eq: null },
                          type: "user",
                        },
                      },
                      { $project: { _id: 1 } },
                    ],
                    as: "requested",
                  },
                },
                {
                  $addFields: {
                    followStatus: {
                      $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "followers",
                    let: { followeeId: "$_id" }, //master user Id
                    pipeline: [
                      {
                        $match: {
                          followerId: ObjectId(data.userId),
                          $expr: { $eq: ["$followeeId", "$$followeeId"] },
                          acceptedDate: { $ne: null },
                          type: "user",
                        },
                      },
                      { $project: { _id: 1 } },
                    ],
                    as: "following",
                  },
                },
                {
                  $addFields: {
                    followStatus: {
                      $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
                    },
                  },
                },
                {
                  $addFields: {
                    followStatus: {
                      $switch: {
                        branches: [
                          { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
                          { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
                          { case: { $eq: ["$followStatus", 2] }, then: "Following" },
                        ],
                        default: "Follow",
                      },
                    },
                  },
                },
                { $project: { _id: 1, type: 1, username: 1, name: 1, profileImage: '$profileImageX50', profileImageType: 1, followStatus: 1 } },
              ],
              as: "sponsor",
            },
          },
          {
            $addFields: { sponsor: { $first: '$sponsor' } },
          },
          {
            $lookup: {
              from: "famelinks",
              let: { challengeId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$$challengeId", "$challengeId"] },
                  },
                },
                {
                  $group: {
                    _id: '$userId',
                  }
                },
              ],
              as: "participantsCount",
            },
          },
          {
            $set: {
              participantsCount: {
                $size: "$participantsCount"
              },
            },
          },
          {
            $lookup: {
              from: "famelinks",
              let: { challengeId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$$challengeId", "$challengeId"] },
                  },
                },
                {
                  $addFields: {
                    likesCount: { $max: ["$likes2Count", 0] },
                  },
                },
                { $project: { _id: 1, likesCount: 1 } },
              ],
              as: "posts",
            },
          },
          {
            $addFields: { likesCount: { $first: '$posts.likesCount' } },
          },
          {
            $set: {
              postCount: {
                $size: "$posts"
              },
            },
          },
          // {
          //   $set: {
          //     posts: {
          //       $size: "$posts"
          //     },
          //   },
          // },
          {
            $project: {
              _id: 1,
              hashTag: 1,
              images: 1,
              sponsor: 1,
              startDate: 1,
              participantsCount: 1,
              postCount: 1,
              likesCount: 1,
              isCompleted: 1,
              category: 1,
              totalParticipants: 1,
              totalImpressions: 1,
              totalPost: 1,
              milestoneValue: '$milestoneAggrement.milestoneValue',
            },
          },
        ],
        as: "trend",
      },
    },
    {
      $addFields: { trend: { $first: '$trend' } },
    },
    {
      $lookup: {
        from: 'fametrendzs',
        pipeline: [
          { $match: { $expr: { $eq: ['$sponsor', ObjectId(data.sponsorId)] } } }
        ],
        as: 'trendzSets',
      },
    },
    {
      $addFields: { trendzSets: { $size: '$trendzSets', }, },
    },
    {
      $facet: {
        data: [
          {
            $project: {
              _id: '$trend._id',
              hashTag: '$trend.hashTag',
              images: '$trend.images',
              sponsor: '$trend.sponsor',
              startDate: '$trend.startDate',
              participantsCount: '$trend.participantsCount',
              postCount: '$trend.postCount',
              likesCount: '$trend.likesCount',
              category: '$trend.category',
              totalParticipants: '$trend.totalParticipants',
              totalImpressions: '$trend.totalImpressions',
              totalPost: '$trend.totalPost',
              milestoneValue: '$trend.milestoneValue',
              trendzSets: 1,
              isCompleted: '$trend.isCompleted',
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: (data.page - 1) * 10 },
          { $limit: 10 },
        ],
        participateCount: [
          { $count: "total" },
        ],
      }
    },
    {
      $addFields: { participateCount: { $first: '$participateCount.total' } },
    },
    {
      $addFields: { setCount: { $first: '$data.trendzSets' } },
    },
  ]);
};

exports.getOpenChallenges = (search, page, userId) => {
  return ChallengeDB.aggregate([
    {
      $match: {
        $and: [
          { isDeleted: false },
          { type: 'funlinks' },
          { hashTag: { $regex: `^.*?${search}.*?$`, $options: "i" } },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        let: { createdBy: "$createdBy" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$createdBy"] },
              isDeleted: false,
            },
          },
          {
            $project: {
              type: 1,
              name: 1,
              username: 1,
              profileImageType: 1,
              profileImage: '$profileImageX50',
              profile: {
                name: "$profileFunlinks.name",
                profileImageType: "$profileFunlinks.profileImageType",
                profileImage: "$profileFunlinks.profileImageX50",
              },
            },
          },
        ],
        as: "createdBy",
      },
    },
    { $addFields: { createdBy: { $first: "$createdBy" } } },
    {
      $lookup: {
        from: "users",
        // let: { userId: "$userId", },
        pipeline: [
          { $match: { _id: ObjectId(userId) } },
          { $project: { blockList: 1 } },
        ],
        as: "selfUser",
      },
    },
    { $addFields: { blockedUserIds: { $first: "$selfUser.blockList" } } },
    // Fetch the FunLinks profile ids of blockeduser list
    {
      $lookup: {
        from: "users",
        let: { blockedUserIds: "$blockedUserIds" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$blockedUserIds"] } } },
          { $project: { profileFunlinks: 1, _id: 0 } },
        ],
        as: "blockedUserIds",
      },
    },
    // { $addFields: { blockedUserIds: { $first: "[$blockedUserIds.profileFunlinks]" } } },
    {
      $lookup: {
        from: "funlinks",
        let: { challengeId: "$_id", blockedUserIds: "$blockedUserIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                  {
                    $not: [
                      { $in: ["$userId", "$$blockedUserIds.profileFunlinks"] },
                    ],
                  },
                ],
              },
            },
          },
          // { $project: { _id: 1, likesCount: 1, media: 1 } },
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
        ],
        as: "posts",
      },
    },
    { $addFields: { participantsCount: { $size: "$posts" } } },
    { $match: { participantsCount: { $gt: 0 } } },
    {
      $project: {
        selfUser: 0,
        blockedUserIds: 0,
        // postCount: 0,
      },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
    { $sort: { createdAt: -1 } },
  ]);
};

exports.getOpenChallengesHashTag = (search, page, type) => {
  return ChallengeDB.aggregate([
    {
      $match: {
        $and: [
          { isDeleted: false },
          { type: { $in: type } },
          { hashTag: { $regex: `^.*?${search}.*?$`, $options: "i" } },
        ],
      },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
    { $sort: { createdAt: -1 } },
  ]);
};

exports.getOpenFametrendzsHashTag = (search, page, type) => {
  const currentDate = new Date();
  return fameTrendzDB.aggregate([
    {
      $match: {
        $and: [
          { isDeleted: false },
          { type: { $in: type } },
          { startDate: { $lt: currentDate } },
          { hashTag: { $regex: `^.*?${search}.*?$`, $options: "i" } },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sponsor",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1 } }],
        as: "sponsor",
      },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
    { $sort: { createdAt: -1 } },
  ]);
};

exports.getOpenFametrendzsBySearch = (search, type) => {
  const currentDate = new Date();
  return fameTrendzDB
    .aggregate([
      {
        $match: {
          $and: [
            { isDeleted: false },
            { type: { $in: type } },
            { startDate: { $lt: currentDate } },
            { hashTag: { $regex: `^.*?${search}.*?$`, $options: "x" } },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sponsor",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1 } }],
          as: "sponsor",
        },
      },
    ])
    .sort({
      startDate: "desc",
    });
};

exports.getOpenChallengesBySearch = (search, type) => {
  const currentDate = new Date();
  return fameTrendzDB
    .aggregate([
      {
        $match: {
          $expr: {
            $and: [{ $lt: ["$startDate", currentDate] }],
          },
          isDeleted: false,
          type: { $in: type },
          hashTag: { $regex: `^.*?${search}.*?$`, $options: "x" },
        },
      },
    ])
    .sort({
      startDate: "desc",
    });
};

exports.getUpcomingFametrendzs = (page, type, filterObj, userId) => {
  const currentDate = new Date();
  return fameTrendzDB.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $gt: ["$startDate", currentDate] }],
        },
        isDeleted: false,
        isCompleted: false,
        type: "famelinks",
        // status: 'paid',
      },
    },
    { $match: filterObj },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sponsor",
        pipeline: [

          { $project: { _id: 1, username: 1, name: 1, profileImage: '$profileImageX50', profileImageType: 1 } },

          {
            $set: {
              profileImageType: {
                $cond: [
                  { $ifNull: ["$profileImageType", false] },
                  "$profileImageType",
                  "",
                ],
              },
            },
          },
          { $addFields: { followStatus: 0 } },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
              pipeline: [
                {
                  $match: {
                    followerId: userId,
                    $expr: { $eq: ["$followeeId", "$$followeeId"] },
                    acceptedDate: { $eq: null },
                    type: "user",
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "requested",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
              },
            },
          },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
              pipeline: [
                {
                  $match: {
                    followerId: userId,
                    $expr: { $eq: ["$followeeId", "$$followeeId"] },
                    acceptedDate: { $ne: null },
                    type: "user",
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "following",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
              },
            },
          },
          {
            $addFields: {
              followStatus: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
                    { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
                    { case: { $eq: ["$followStatus", 2] }, then: "Following" },
                  ],
                  default: "Follow",
                },
              },
            },
          },
        ],
        as: "sponsor",
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sponsor",
        pipeline: [{ $project: { name: 1, type: 1 } }],
        as: "users",
      },
    },
    { $sort: { startDate: -1 } },
  ])
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getUpcomingChallenges = (page, type) => {
  const currentDate = new Date();
  return fameTrendzDB.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $gt: ["$startDate", currentDate] }],
        },
        isDeleted: false,
        isCompleted: false,
        type: "famelinks" || "funlinks",
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sponsor",
        pipeline: [{ $project: { name: 1, type: 1 } }],
        as: "users",
      },
    },
    { $sort: { startDate: -1 } },
  ]);
};

exports.getFameChallengeDetails = (data) => {
  return fameTrendzDB.aggregate([
    {
      $match: {
        _id: ObjectId(data.challengeId),
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sponsor",
        pipeline: [
          { $project: { type: 1, username: 1, name: 1, profileImageType: 1, profileImageX50: 1 } },
        ],
        as: "sponsor",
      },
    },
    {
      $addFields: { sponsor: { $first: '$sponsor' } },
    },
    {
      $lookup: {
        from: "ratings",
        let: { value: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$trendId", "$$value"] } },
                { userId: data.userId },
              ],
            },
          },
        ],
        as: "rating",
      },
    },
    {
      $set: {
        rating: {
          $cond: [
            { $eq: [0, { $size: "$rating" }] },
            null,
            { $first: "$rating.rating" },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { value: "$_id" },
        pipeline: [
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
              pipeline: [
                { $match: { _id: ObjectId(data.userId) } },
                { $project: { blockList: 1 } },
              ],
              as: "selfUser",
            },
          },
          { $addFields: { blockedUserIds: { $first: "$selfUser.blockList" } } },
          {
            $match: {
              $expr: {
                $and: [
                  { $in: [ObjectId(data.challengeId), "$challengeId"] },
                  { $not: [{ $in: ["$userId", "$blockedUserIds"] }] },
                ],
              },
            },
          },
          {
            $project: {
              type: { $cond: [{ $ne: ["$video", null] }, 'video', 'image'] },
              path: {
                $switch: {
                  branches: [
                    { case: { $ne: ["$video", null] }, then: "$video" },
                    { case: { $ne: ["$closeUp", null] }, then: "$closeUp" },
                    { case: { $ne: ["$medium", null] }, then: "$medium" },
                    { case: { $ne: ["$long", null] }, then: "$long" },
                    { case: { $ne: ["$pose1", null] }, then: "$pose1" },
                    { case: { $ne: ["$pose2", null] }, then: "$pose2" },
                  ],
                  default: "$additional"
                },
              },
              userId: 1,
            },
          },
          {
            $facet: {
              data: [
                { $sort: { createdAt: -1 } },
                { $skip: (data.page - 1) * 15 },
                { $limit: 15 },
              ],
              count: [
                { $count: "total" },
              ],
            }
          },
          {
            $project: { data: 1, count: { $ifNull: [{ $first: '$count.total' }, 0] } },
          },
        ],
        as: "posts",
      },
    },
    {
      $project: {
        hashTag: 1,
        category: 1,
        totalParticipants: 1,
        totalImpressions: 1,
        totalPost: 1,
        milestoneValue: '$milestoneAggrement.milestoneValue',
        isCompleted: { $ifNull: ["$isCompleted", false] },
        rewardWinner: 1,
        rewardRunnerUp: 1,
        sponsor: 1,
        rating: 1,
        posts: { $first: '$posts' },
      },
    },
  ]);
};

exports.getFunChallengeDetails = (data) => {
  return ChallengeDB.aggregate([
    {
      $match: {
        _id: ObjectId(data.challengeId),
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "createdBy",
        pipeline: [
          { $project: { type: 1, username: 1, name: 1, profileImageType: 1, profileImageX50: 1 } },
        ],
        as: "sponsor",
      },
    },
    {
      $addFields: { sponsor: { $first: '$sponsor' } },
    },
    {
      $lookup: {
        from: "ratings",
        let: { value: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$trendId", "$$value"] } },
                { userId: data.userId },
              ],
            },
          },
        ],
        as: "rating",
      },
    },
    {
      $set: {
        rating: {
          $cond: [
            { $eq: [0, { $size: "$rating" }] },
            null,
            { $first: "$rating.rating" },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "funlinks",
        let: { value: "$_id" },
        pipeline: [
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
              pipeline: [
                { $match: { _id: ObjectId(data.userId) } },
                { $project: { blockList: 1 } },
              ],
              as: "selfUser",
            },
          },
          { $addFields: { blockedUserIds: { $first: "$selfUser.blockList" } } },
          {
            $match: {
              $expr: {
                $and: [
                  { $in: [ObjectId(data.challengeId), "$challengeId"] },
                  { $not: [{ $in: ["$userId", "$blockedUserIds"] }] },
                ],
              },
            },
          },
          {
            $project: { video: 1, userId: 1, musicName: 1 },
          },
          {
            $facet: {
              data: [
                { $sort: { createdAt: -1 } },
                { $skip: (data.page - 1) * 15 },
                { $limit: 15 },
              ],
              count: [
                { $count: "total" },
              ],
            }
          },
          {
            $project: { data: 1, count: { $ifNull: [{ $first: '$count.total' }, 0] } },
          },
        ],
        as: "posts",
      },
    },
    {
      $project: {
        hashTag: 1,
        giftCoins: 1,
        sponsor: 1,
        rating: 1,
        posts: { $first: '$posts' },
      },
    },
  ]);
};

exports.getOneFamelinksChallenge = (challengeId, userId) => {
  return fameTrendzDB.aggregate([
    {
      $match: { _id: ObjectId(challengeId), isDeleted: false },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sponsor",
        pipeline: [
          { $project: { _id: 1, type: 1, username: 1, name: 1, profileImage: '$profileImageX50', profileImageType: 1 } },
          {
            $set: {
              profileImageType: {
                $cond: [
                  { $ifNull: ["$profileImageType", false] },
                  "$profileImageType",
                  "",
                ],
              },
            },
          },
          { $addFields: { followStatus: 0 } },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
              pipeline: [
                {
                  $match: {
                    followerId: ObjectId(userId),
                    $expr: { $eq: ["$followeeId", "$$followeeId"] },
                    acceptedDate: { $eq: null },
                    type: "user",
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "requested",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
              },
            },
          },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
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
              as: "following",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
              },
            },
          },
          {
            $addFields: {
              followStatus: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
                    { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
                    { case: { $eq: ["$followStatus", 2] }, then: "Following" },
                  ],
                  default: "Follow",
                },
              },
            },
          },
        ],
        as: "sponsor",
      },
    },
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
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id", blockedUserIds: "$blockedUserIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                  { $not: [{ $in: ["$userId", "$$blockedUserIds"] }] },
                ],
              },
            },
          },
          {
            $addFields: {
              likesCount: { $add: ["$likes1Count", "$likes2Count"] },
            },
          },
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
          { $project: { _id: 1, likesCount: 1 } },
          { $sort: { likesCount: -1 } },
          { $limit: 10 },
        ],
        as: "posts",
      },
    },
    {
      $lookup: {
        from: "ratings",
        let: { trendId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$trendId", "$$trendId"] } },
                { userId: userId },
              ],
            },
          },
        ],
        as: "rating",
      },
    },
    {
      $set: {
        rating: {
          $cond: [
            { $eq: [0, { $size: "$rating" }] },
            null,
            { $first: "$rating.rating" },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id", blockedUserIds: "$blockedUserIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                  { $not: [{ $in: ["$userId", "$$blockedUserIds"] }] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$userId',
            }
          },
          {
            $lookup: {
              from: "users",
              let: { userId: "$_id" },
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
                    profileImageType: 1,
                    profileImage: '$profileImageX50',
                  },
                },
              ],
              as: "masterUser",
            },
          },
          {
            $project: {
              _id: '$_id',
              username: { $first: "$masterUser.username" },
              profileImageType: { $first: "$masterUser.profileImageType" },
              profileImage: { $first: "$masterUser.profileImageX50" },
            },
          },
        ],
        as: "participants",
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id", blockedUserIds: "$blockedUserIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                  { $not: [{ $in: ["$userId", "$$blockedUserIds"] }] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$userId',
            }
          },
        ],
        as: "participantsCount",
      },
    },
    {
      $set: {
        participantsCount: {
          $size: "$participantsCount"
        },
      },
    },
    { $project: { selfUser: 0, blockedUserIds: 0, profileFamelinks: 0 } },
  ]);
};

exports.getOneChallenge = (challengeId) => {
  return ChallengeDB.findOne({ _id: challengeId, isDeleted: false });
};

exports.getChallengeByName = (challengeName) => {
  return ChallengeDB.findOne({ name: challengeName, isDeleted: false });
};

exports.getChallengeImage = (challengeImage) => {
  return fameTrendzDB.find({
    isDeleted: false,
    images: challengeImage,
  });
};

exports.getChallengeFamelinks = (challengeId, page, userId, profileId) => {
  return famelinks.aggregate([
    // Self User
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
    // {
    //   $set: {
    //     video: {
    //       $cond: {
    //         if: { $eq: [null, "$video"] },
    //         then: null,
    //         else: { $concat: ["$video", "-", "xs"] },
    //       },
    //     },
    //   },
    // },
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
        $expr: {
          $and: [
            { $in: [ObjectId(challengeId), "$challengeId"] },
            { $not: [{ $in: ["$userId", "$blockedUserIds"] }] },
          ],
        },
      },
    },
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
              dob: 1,
              profile: {
                name: "$profileFamelinks.name",
                bio: "$profileFamelinks.bio",
                profession: "$profileFamelinks.profession",
                profileImage: "$profileFamelinks.profileImageX50",
                profileImageType: "$profileFamelinks.profileImageType",
              }
            },
          },
        ],
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },
    { $match: { $expr: { $ne: ["$user._id", null] } } },
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
          {
            $lookup: {
              from: "ratings",
              let: { trendId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$trendId", "$$trendId"] } },
                      { userId: userId },
                    ],
                  },
                },
              ],
              as: "rating",
            },
          },
          {
            $set: {
              rating: {
                $cond: [
                  { $eq: [0, { $size: "$rating" }] },
                  null,
                  { $first: "$rating.rating" },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              sponsor: 1,
              hashTag: 1,
              for: 1,
              rewardWinner: 1,
              rewardRunnerUp: 1,
              description: 1,
              startDate: 1,
              category: 1,
              isCompleted: 1,
              totalImpressions: 1,
              requiredImpressions: 1,
              totalPost: 1,
              requiredPost: 1,
              requiredParticipants: 1,
              totalParticipants: 1,
              milestoneAggrement: 1,
              rating: 1,
            },
          },
          {
            $lookup: {
              from: "users",
              let: { name: "$sponsor" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$name"] },
                    isDeleted: false,
                  },
                },
                { $project: { name: 1, _id: 0 } },
              ],
              as: "sponsor",
            },
          },
        ],
        as: "challenges",
      },
    },
    {
      $lookup: {
        from: "likes",
        let: { mediaId: "$_id" },
        pipeline: [
          {
            $match: {
              userId: ObjectId(profileId),
              $expr: { $eq: ["$mediaId", "$$mediaId"] },
            },
          },
          { $project: { status: 1, _id: 0 } },
        ],
        as: "likeStatus",
      },
    },
    { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },
    { $addFields: { followStatus: 0 } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$userId" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: ObjectId(userId),
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $eq: null },
              type: "user",
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "requested",
      },
    },
    {
      $addFields: {
        followStatus: {
          $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
        },
      },
    },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$userId" }, //master user Id
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
        as: "following",
      },
    },
    {
      $addFields: {
        followStatus: {
          $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
        },
      },
    },
    {
      $addFields: {
        followStatus: {
          $switch: {
            branches: [
              { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
              { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
              { case: { $eq: ["$followStatus", 2] }, then: "Following" },
            ],
            default: "Follow",
          },
        },
      },
    },
    {
      $project: {
        createdAt: 1,
        updatedAt: 1,
        // name: 1,
        // profession: 1,
        // district: 1,
        // state: 1,
        // country: 1,
        gender: 1,
        challenges: 1,
        user: 1,
        description: 1,
        sponsor: 1,
        // profileImage: '$profileImageX50',
        likes0Count: 1,
        likes1Count: 1,
        likes2Count: 1,
        commentsCount: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: ["$likeStatus", null] },
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
    .sort({
      updatedAt: "desc",
    })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getChallengeFunlinks = (challengeId, page, userId) => {
  return FunlinksDB.aggregate([
    { $match: { isWelcomeVideo: { $exists: false } } },
    // {
    //   $set: {
    //     video: {
    //       $cond: {
    //         if: { $eq: [null, "$video"] },
    //         then: null,
    //         else: { $concat: ["$video", "-", "xs"] },
    //       },
    //     },
    //   },
    // },
    {
      $addFields: {
        thumbnail: {
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
        $expr: {
          $and: [
            { $in: [ObjectId(challengeId), "$challengeId"] },
            { $not: [{ $in: ["$userId", "$blockedUserIds"] }] },
          ],
        },
      },
    },
    // User   
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
              dob: 1,
              name: 1,
              profileImage: '$profileImageX50',
              profileImageType: 1,
              profile: {
                name: "$profileFamelinks.name",
                bio: "$profileFamelinks.bio",
                profession: "$profileFamelinks.profession",
                profileImage: "$profileFamelinks.profileImageX50",
                profileImageType: "$profileFamelinks.profileImageType",
              }
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
        from: "users",
        let: { profileFunlinks: "$user._id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$profileFunlinks"] },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "masterProfile",
      },
    },
    { $addFields: { masterProfile: { $first: "$masterProfile" } } },
    // Challenge
    {
      $lookup: {
        from: "challenges",
        let: { challengeId: "$challengeId" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$challengeId"] },
              isDeleted: false,
            },
          },
          {
            $project: {
              _id: 1,
              hashTag: 1,
              totalImpressions: 1,
              totalPost: 1,
              totalParticipants: 1,
              createdBy: 1,
              type: 1,
            },
          },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { createdBy: "$createdBy" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$createdBy"] },
                    isDeleted: false,
                  },
                },
                { $project: { name: "$profileFunlinks.name", _id: 0 } },
              ],
              as: "funlinkUserCreated",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { createdBy: "$createdBy" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$createdBy"] },
                    isDeleted: false,
                  },
                },
                { $project: { name: "$profileFollowlinks.name", _id: 0 } },
              ],
              as: "followlinkUserCreated",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { createdBy: "$createdBy" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$createdBy"] },
                    isDeleted: false,
                  },
                },
                { $project: { name: "$profileStorelinks.name", _id: 0 } },
              ],
              as: "brandCreated",
            },
          },
          {
            $addFields: {
              createdBy: {
                $setUnion: [
                  "$funlinkUserCreated",
                  "$brandCreated",
                  "$followlinkUserCreated",
                ],
              },
            },
          },
          {
            $project: {
              brandCreated: 0,
              followlinkUserCreated: 0,
              funlinkUserCreated: 0,
            },
          },
        ],
        as: "challenges",
      },
    },
    {
      $lookup: {
        from: "likes",
        let: { mediaId: "$_id" },
        pipeline: [
          { $match: { userId, $expr: { $eq: ["$mediaId", "$$mediaId"] } } },
          { $project: { status: 1, _id: 0 } },
        ],
        as: "likeStatus",
      },
    },
    { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },
    { $addFields: { followStatus: 0 } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$masterProfile._id" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: ObjectId(userId),
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $eq: null },
              type: "user",
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "requested",
      },
    },
    {
      $addFields: {
        followStatus: {
          $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
        },
      },
    },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$masterProfile._id" }, //master user Id
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
        as: "following",
      },
    },
    {
      $addFields: {
        followStatus: {
          $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
        },
      },
    },
    {
      $addFields: {
        followStatus: {
          $switch: {
            branches: [
              { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
              { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
              { case: { $eq: ["$followStatus", 2] }, then: "Following" },
            ],
            default: "Follow",
          },
        },
      },
    },
    {
      $project: {
        createdAt: 1,
        updatedAt: 1,
        // name: 1,
        // profession: 1,
        // district: 1,
        // state: 1,
        // country: 1,
        gender: 1,
        challenges: 1,
        user: 1,
        description: 1,
        // profileImage: '$profileImageX50',
        seen: 1,
        musicId: 1,
        musicName: 1,
        likesCount: 1,
        commentsCount: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: [{ $toBool: "$likeStatus" }, false] },
        media: [{ path: "$video", thumbnail: "$thumbnail", type: "video" }],
      },
    },
  ])
    .sort({
      updatedAt: "desc",
    })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getChallengeFollowlinks = (challengeId, page, userId) => {
  return FollowlinksDB.aggregate([
    { $match: { isWelcomeVideo: { $exists: false } } },
    // {
    //   $set: {
    //     video: {
    //       $cond: {
    //         if: { $eq: [null, "$video"] },
    //         then: null,
    //         else: { $concat: ["$video", "-", "xs"] },
    //       },
    //     },
    //   },
    // },
    // {
    //   $addFields: {
    //     thumbnail: {
    //       $cond: {
    //         if: { $eq: [null, "$video"] },
    //         then: null,
    //         else: { $concat: ["$video", "-", "xs"] },
    //       },
    //     },
    //   },
    // },
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
        $expr: {
          $and: [
            { $in: [ObjectId(challengeId), "$challengeId"] },
            { $not: [{ $in: ["$userId", "$blockedUserIds"] }] },
          ],
        },
      },
    },
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
                profileImage: "$profileFollowlinks.profileImageX50",
                profileImageType: "$profileFollowlinks.profileImageType",
              }
            },
          },
        ],
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },
    { $match: { $expr: { $ne: ["$user._id", null] } } },
    // Challenge
    {
      $lookup: {
        from: "challenges",
        let: { challengeId: "$challengeId" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$challengeId"] },
              isDeleted: false,
            },
          },
          {
            $project: {
              _id: 1,
              hashTag: 1,
              totalImpressions: 1,
              totalPost: 1,
              totalParticipants: 1,
              createdBy: 1,
              type: 1,
            },
          },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { createdBy: "$createdBy" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$createdBy"] },
                    isDeleted: false,
                  },
                },
                { $project: { name: "$profileFunlinks.name", _id: 0 } },
              ],
              as: "funlinkUserCreated",
            },
          },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { createdBy: "$createdBy" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$createdBy"] },
                    isDeleted: false,
                  },
                },
                { $project: { name: "$profileFollowlinks.name", _id: 0 } },
              ],
              as: "followlinkUserCreated",
            },
          },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { createdBy: "$createdBy" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$createdBy"] },
                    isDeleted: false,
                  },
                },
                { $project: { name: "$profileStorelinks.name", _id: 0 } },
              ],
              as: "brandCreated",
            },
          },
          {
            $addFields: {
              createdBy: {
                $setUnion: [
                  "$funlinkUserCreated",
                  "$brandCreated",
                  "$followlinkUserCreated",
                ],
              },
            },
          },
          {
            $project: {
              brandCreated: 0,
              followlinkUserCreated: 0,
              funlinkUserCreated: 0,
            },
          },
        ],
        as: "challenges",
      },
    },
    {
      $lookup: {
        from: "likes",
        let: { mediaId: "$_id" },
        pipeline: [
          { $match: { userId, $expr: { $eq: ["$mediaId", "$$mediaId"] } } },
          { $project: { status: 1, _id: 0 } },
        ],
        as: "likeStatus",
      },
    },
    { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },
    { $addFields: { followStatus: 0 } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$userId" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: ObjectId(userId),
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $eq: null },
              type: "user",
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "requested",
      },
    },
    {
      $addFields: {
        followStatus: {
          $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
        },
      },
    },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$userId" }, //master user Id
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
        as: "following",
      },
    },
    {
      $addFields: {
        followStatus: {
          $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
        },
      },
    },
    {
      $addFields: {
        followStatus: {
          $switch: {
            branches: [
              { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
              { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
              { case: { $eq: ["$followStatus", 2] }, then: "Following" },
            ],
            default: "Follow",
          },
        },
      },
    },
    {
      $project: {
        createdAt: 1,
        updatedAt: 1,
        // name: 1,
        // profession: 1,
        // district: 1,
        // state: 1,
        // country: 1,
        gender: 1,
        challenges: 1,
        user: 1,
        description: 1,
        // profileImage: '$profileImageX50',
        seen: 1,
        likesCount: 1,
        commentsCount: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: [{ $toBool: "$likeStatus" }, false] },
        media: [{ path: "$video", thumbnail: "$thumbnail", type: "video" }],
      },
    },
  ])
    .sort({
      updatedAt: "desc",
    })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getDashboardOpenChallenges = (userId, filterObj, page) => {
  const currentDate = new Date();
  return fameTrendzDB
    .aggregate([
      {
        $match: {
          isWelcomeVideo: { $exists: false },
          isDeleted: false,
          isCompleted: false,
          type: "famelinks",
          status: "paid",
        },
      },
      { $match: filterObj },
      // {
      //   $set: {
      //     images: [
      //       {
      //         $reduce: {
      //           input: "$images",
      //           initialValue: "",
      //           in: {
      //             $concat: ["$$this", "-", "xs"],
      //           },
      //         },
      //       },
      //     ],
      //   },
      // },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "sponsor",
          pipeline: [
            { $project: { _id: 1, type: 1, username: 1, name: 1, profileImage: '$profileImageX50', profileImageType: 1 } },
            {
              $set: {
                profileImageType: {
                  $cond: [
                    { $ifNull: ["$profileImageType", false] },
                    "$profileImageType",
                    "",
                  ],
                },
              },
            },
            { $addFields: { followStatus: 0 } },
            {
              $lookup: {
                from: "followers",
                let: { followeeId: "$_id" }, //master user Id
                pipeline: [
                  {
                    $match: {
                      followerId: ObjectId(userId),
                      $expr: { $eq: ["$followeeId", "$$followeeId"] },
                      acceptedDate: { $eq: null },
                      type: "user",
                    },
                  },
                  { $project: { _id: 1 } },
                ],
                as: "requested",
              },
            },
            {
              $addFields: {
                followStatus: {
                  $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
                },
              },
            },
            {
              $lookup: {
                from: "followers",
                let: { followeeId: "$_id" }, //master user Id
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
                as: "following",
              },
            },
            {
              $addFields: {
                followStatus: {
                  $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
                },
              },
            },
            {
              $addFields: {
                followStatus: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
                      { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
                      { case: { $eq: ["$followStatus", 2] }, then: "Following" },
                    ],
                    default: "Follow",
                  },
                },
              },
            },
          ],
          as: "sponsor",
        },
      },
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
        $lookup: {
          from: "famelinks",
          let: { challengeId: "$_id", blockedUserIds: "$blockedUserIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$$challengeId", "$challengeId"] },
                    { $not: [{ $in: ["$userId", "$$blockedUserIds"] }] },
                  ],
                },
              },
            },
            {
              $addFields: {
                likesCount: { $add: ["$likes1Count", "$likes2Count"] },
              },
            },
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
            { $project: { _id: 1, likesCount: 1 } },
            { $sort: { likesCount: -1 } },
            { $limit: 10 },
          ],
          as: "posts",
        },
      },
      {
        $lookup: {
          from: "ratings",
          let: { trendId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ["$trendId", "$$trendId"] } },
                  { userId: userId },
                ],
              },
            },
          ],
          as: "rating",
        },
      },
      {
        $set: {
          rating: {
            $cond: [
              { $eq: [0, { $size: "$rating" }] },
              null,
              { $first: "$rating.rating" },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "famelinks",
          let: { challengeId: "$_id", blockedUserIds: "$blockedUserIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$$challengeId", "$challengeId"] },
                    { $not: [{ $in: ["$userId", "$$blockedUserIds"] }] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$userId',
              }
            },
            {
              $lookup: {
                from: "users",
                let: { userId: "$_id" },
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
                      profileImageType: 1,
                      profileImage: '$profileImageX50',
                    },
                  },
                ],
                as: "masterUser",
              },
            },
            {
              $project: {
                _id: '$_id',
                username: { $first: "$masterUser.username" },
                profileImageType: { $first: "$masterUser.profileImageType" },
                profileImage: { $first: "$masterUser.profileImageX50" },
              },
            },
          ],
          as: "participants",
        },
      },
      {
        $lookup: {
          from: "famelinks",
          let: { challengeId: "$_id", blockedUserIds: "$blockedUserIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$$challengeId", "$challengeId"] },
                    { $not: [{ $in: ["$userId", "$$blockedUserIds"] }] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$userId',
              }
            },
          ],
          as: "participantsCount",
        },
      },
      {
        $set: {
          participantsCount: {
            $size: "$participantsCount"
          },
        },
      },
      { $project: { selfUser: 0, blockedUserIds: 0, profileFamelinks: 0 } },
    ])
    .sort({
      startDate: "desc",
    })
    .skip((page - 1) * 10)
    .limit(10);;
};

exports.getSliderChallenges = () => {
  return fameTrendzDB.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            {
              $lt: ["$startDate", new Date()],
            },
          ],
        },
        isDeleted: false,
      },
    },
    {
      $project: {
        name: 1,
        images: 1,
      },
    },
  ]);
};

exports.getSliderUpcomingChallenges = () => {
  return fameTrendzDB.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            {
              $gt: ["$startDate", new Date()],
            },
          ],
        },
        isDeleted: false,
      },
    },
    {
      $project: {
        name: 1,
        images: 1,
      },
    },
  ]);
};

exports.exploreFunlinks = (page, userId, profileId) => {
  const currentDate = new Date();
  return ChallengeDB.aggregate([
    {
      $match: {
        // $expr: { $and: [{ $lt: ["$startDate", currentDate] }] },
        isDeleted: false,
        type: "funlinks",
      },
    },
    {
      $lookup: {
        from: "users",
        let: { createdBy: "$createdBy" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$createdBy"] },
              isDeleted: false,
            },
          },
          {
            $project: {
              type: 1,
              name: 1,
              username: 1,
              profileImageType: 1,
              profileImage: '$profileImageX50',
              profile: {
                name: "$profileFunlinks.name",
                profileImageType: "$profileFunlinks.profileImageType",
                profileImage: "$profileFunlinks.profileImageX50",
              },
            },
          },
        ],
        as: "createdBy",
      },
    },
    { $addFields: { createdBy: { $first: "$createdBy" } } },
    {
      $lookup: {
        from: "users",
        // let: { userId: "$userId", },
        pipeline: [
          { $match: { _id: ObjectId(userId) } },
          { $project: { blockList: 1 } },
        ],
        as: "selfUser",
      },
    },
    { $addFields: { blockedUserIds: { $first: "$selfUser.blockList" } } },
    // Fetch the FunLinks profile ids of blockeduser list
    {
      $lookup: {
        from: "users",
        let: { blockedUserIds: "$blockedUserIds" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$blockedUserIds"] } } },
          { $project: { profileFunlinks: 1, _id: 0 } },
        ],
        as: "blockedUserIds",
      },
    },
    // { $addFields: { blockedUserIds: { $first: "[$blockedUserIds.profileFunlinks]" } } },
    {
      $lookup: {
        from: "funlinks",
        let: { challengeId: "$_id", blockedUserIds: "$blockedUserIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                  {
                    $not: [
                      { $in: ["$userId", "$$blockedUserIds.profileFunlinks"] },
                    ],
                  },
                ],
              },
            },
          },
          // { $project: { _id: 1, likesCount: 1, media: 1 } },
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
        ],
        as: "posts",
      },
    },
    { $addFields: { participantsCount: { $size: "$posts" } } },
    { $match: { participantsCount: { $gt: 0 } } },
    {
      $project: {
        selfUser: 0,
        blockedUserIds: 0,
        // postCount: 0,
      },
    },
  ])
    .sort({
      createdAt: "desc",
    })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.createChallenge = (data) => {
  return ChallengeDB.create(data);
};

exports.getFunlinksChallengesBySearch = (searchData, linkType) => {
  // let typeObj = [];
  // switch (linkType) {
  //   case "followlinks":
  //     typeObj[0] = { type: "followlinks" };
  //     break;
  //   case "funlinks":
  //     typeObj[0] = { type: "funlinks" };
  //     break;
  //   default:
  //     break;
  // }
  return ChallengeDB.find({
    $and: [
      { type: linkType },
      { hashTag: { $regex: `^.*?${searchData}.*?$`, $options: "i" } },
      { isDeleted: false },
    ],
  })
    .limit(50)
    .lean();
};

exports.getFameLinksChallengesBySearch = (searchData, linkType) => {
  // let typeObj = [{ type: "both" }];
  // switch (linkType) {
  //   case "famelinks":
  //     typeObj[1] = { type: "famelinks" };
  //     break;
  //   case "funlinks":
  //     typeObj[1] = { type: "funlinks" };
  //     break;
  //   default:
  //     break;
  // }
  const currentDate = new Date();
  return fameTrendzDB
    .find({
      $and: [
        { type: linkType },
        { hashTag: { $regex: `^.*?${searchData}.*?$`, $options: "i" } },
        { startDate: { $lt: currentDate } },
        { isCompleted: false },
        { isDeleted: false },
      ],
    })
    .limit(50)
    .lean();
};

//exports.updateImpressions = (challengeId, incBy) => {
//   return ChallengeDB.updateOne(
//     {
//       _id: challengeId,
//     },
//     {
//       $inc: {
//         totalImpressions: incBy,
//       },
//     }
//   );
// };

//exports.getChallengeWinners = () => {
//   return fameTrendzDB.aggregate([
//     { $match: { type: "famelinks", isDeleted: false, isCompleted: true } },
//     {
//       $lookup: {
//         from: "users",
//         localField: "sponsor",
//         foreignField: "_id",
//         pipeline: [
//           { $project: { name: 1, type: 1 } },
//         ],
//         as: "sponsor",
//       },
//     },
//     {
//       $lookup: {
//         from: "famelinks",
//         let: { challengeId: "$_id" },
//         pipeline: [
//           { $match: { $expr: { $in: ["$$challengeId", "$challengeId"] } } },
//           { $project: { _id: 1, userId: 1, likesCount: { $add: ["$likes1Count", "$likes2Count"] } } },
//           { $sort: { likesCount: -1 } },
//         ],
//         as: "posts",
//       },
//     },
//     { $addFields: { winnerIds: "$posts._id" } },
//     {
//       $lookup: {
//         from: "famelinks",
//         let: { winnerIds: "$winnerIds" },
//         pipeline: [
//           { $match: { $expr: { $in: ["$_id", "$$winnerIds"] } } },
//           {
//             $project: {
//               userId: 1,
//               country: 1,
//               likes1Count: 1,
//               likes2Count: 1,
//               likesCount: {
//                 $add: ["$likes1Count", "$likes2Count"],
//               },
//             },
//           },
//           {
//             $sort: { likesCount: -1 },
//           },
//           {
//             $lookup: {
//               from: "users",
//               foreignField: "_id", //v2 => profileFamelinks
//               localField: "userId",
//               pipeline: [{ $project: { _id: 0, name: 1, type: 1, profileImageX50: 1 } }],
//               as: "users",
//             },
//           },
//           {
//             $addFields: {
//               name: {
//                 $first: "$users.name",
//               },
//               type: {
//                 $first: "$users.type",
//               },
//               profileImage: {
//                 $first: "$users.profileImage",
//               },
//             },
//           },

//           {
//             $group: {
//               _id: "$userId",
//               name: { $first: "$name" },
//               type: { $first: "$type" },
//               country: { $first: "$country" },
//               profileImage: { $first: ".profileImageX50" },
//               likes1Count: { $first: "$likes1Count" },
//               likes2Count: { $first: "$likes2Count" },
//               likesCount: { $first: "$likesCount" },
//             },
//           },
//           {
//             $sort: {
//               likesCount: -1,
//             },
//           },
//           {
//             $limit: 5,
//           },
//         ],
//         as: "winner",
//       },
//     },
//     {
//       $project: {
//         winner: 1,
//         for: 1,
//         name: 1,
//         sponsor: {
//           name: 1,
//         },
//         endDate: 1,
//         createdAt: 1,
//         updatedAt: 1,
//         _id: 1,
//         description: 1,
//         reward: 1,
//         category: 1,
//         isCompleted: 1,
//         startDate: 1,
//         type: 1,
//         hashTag: 1,
//         mediaPreference: 1,
//         requiredImpressions: 1,
//         totalImpressions: 1,
//         totalPost: 1,
//         requiredPost: 1,
//         totalParticipants: 1,
//         requiredParticipants: 1,
//         images: 1,
//         posts: 1,
//       },
//     },
//   ])
//     .sort({
//       updatedAt: "desc",
//     })
//     .limit(10);
// };

//-----------------v2--------------------//

exports.getChallengeWinners = (userId) => {
  return fameTrendzDB.aggregate([
    {
      $match: {
        type: "famelinks",
        isDeleted: false,
        isCompleted: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sponsor",
        foreignField: "_id",
        pipeline: [
          { $project: { _id: 1, type: 1, username: 1, name: 1, profileImage: '$profileImageX50', profileImageType: 1 } },

          {
            $set: {
              profileImageType: {
                $cond: [
                  { $ifNull: ["$profileImageType", false] },
                  "$profileImageType",
                  "",
                ],
              },
            },
          },
          { $addFields: { followStatus: 0 } },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
              pipeline: [
                {
                  $match: {
                    followerId: ObjectId(userId),
                    $expr: { $eq: ["$followeeId", "$$followeeId"] },
                    acceptedDate: { $eq: null },
                    type: "user",
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "requested",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
              },
            },
          },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
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
              as: "following",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
              },
            },
          },
          {
            $addFields: {
              followStatus: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
                    { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
                    { case: { $eq: ["$followStatus", 2] }, then: "Following" },
                  ],
                  default: "Follow",
                },
              },
            },
          },
        ],
        as: "sponsor",
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: '$userId',
            }
          },
        ],
        as: "participantsCount",
      },
    },
    {
      $set: {
        participantsCount: {
          $size: "$participantsCount"
        },
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { challengeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$challengeId", "$challengeId"] },
                ],
              },
            },
          },
          {
            $addFields: {
              likesCount: { $add: ["$likes1Count", "$likes2Count"] },
            },
          },
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
          { $project: { _id: 1, likesCount: 1 } },
          { $sort: { likesCount: -1 } },
          { $limit: 10 },
        ],
        as: "posts",
      },
    },
    { $addFields: { winnerIds: "$posts._id" } },
    {
      $lookup: {
        from: "famelinks",
        let: { winnerIds: "$winnerIds" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$winnerIds"] } } },
          {
            $project: {
              _id: 1,
              userId: 1,
              country: 1,
              likes1Count: 1,
              likes2Count: 1,
              likesCount: {
                $add: ["$likes1Count", "$likes2Count"],
              },
            },
          },
          { $sort: { likesCount: -1 } },
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "userId",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    type: 1,
                    profileImage: '$profileImageX50',
                    profileImageType: 1,
                  },
                },

              ],
              as: "users",
            },
          },
          {
            $addFields: {
              masterId: { $first: "$users._id" },
              name: { $first: "$users.name" },
              username: { $first: "$users.username" },
              type: { $first: "$users.type" },
              profileImage: { $first: "$users.profileImageX50" },
              profileImageType: { $first: "$users.profileImageType" },
            },
          },

          {
            $group: {
              _id: "$masterId",
              name: { $first: "$name" },
              username: { $first: "$username" },
              type: { $first: "$type" },
              country: { $first: "$country" },
              profileImage: { $first: ".profileImageX50" },
              profileImageType: { $first: "$profileImageType" },
              likes1Count: { $first: "$likes1Count" },
              likes2Count: { $first: "$likes2Count" },
              likesCount: { $first: "$likesCount" },
              postId: { $first: "$_id" },
            },
          },
          { $sort: { likesCount: -1 } },
          { $limit: 5 },
        ],
        as: "winner",
      },
    },
    {
      $project: {
        _id: 1,
        hashTag: 1,
        images: 1,
        description: 1,
        for: 1,
        requiredImpressions: 1,
        totalImpressions: 1,
        totalPost: 1,
        requiredPost: 1,
        totalParticipants: 1,
        requiredParticipants: 1,
        rewardWinner: 1,
        rewardRunnerUp: 1,
        posts: 1,
        participantsCount: 1,
        sponsor: 1,
        winner: 1,
        endDate: '$updatedAt',
      },
    },
  ])
    .sort({ updatedAt: "desc" })
    .limit(10);
};
//-----------------v2--------------------//

exports.updateFunlinksImpressions = (challengeId, incBy) => {
  return ChallengeDB.updateOne(
    { _id: challengeId },
    { $inc: { totalImpressions: incBy } }
  );
};

exports.updateFamelinksImpressions = (challengeId, incBy) => {
  return fameTrendzDB.updateOne(
    { _id: challengeId },
    { $inc: { totalImpressions: incBy } }
  );
};

exports.getbrandHashTagBySearch = (searchData) => {
  return ChallengeDB.aggregate([
    {
      $match: {
        $and: [
          { type: "brand" },
          { hashTag: { $regex: `^.*?${searchData}.*?$`, $options: "x" } },
          { isDeleted: false },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        hashTag: 1,
        giftCoins: {
          $cond: [{ $ifNull: ["$giftCoins", false] }, "$giftCoins", 1],
        },
      },
    },
    { $limit: 50 },
  ]);
};

exports.getEditFametrendz = (id) => {
  return fameTrendzDB.aggregate([
    { $match: { _id: ObjectId(id) }, },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1, } },
        ],
        as: "location",
      },
    },
  ]);
}

exports.getSavedFametrendzs = (page, userId) => {
  return fameTrendzDB.aggregate([
    {
      $match: {
        sponsor: userId,
        isDeleted: false,
        type: "famelinks",
        status: "saved"
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sponsor",
        foreignField: "_id",
        pipeline: [
          { $project: { _id: 1, type: 1, username: 1, name: 1, profileImage: '$profileImageX50', profileImageType: 1 } },

          {
            $set: {
              profileImageType: {
                $cond: [
                  { $ifNull: ["$profileImageType", false] },
                  "$profileImageType",
                  "",
                ],
              },
            },
          },
          { $addFields: { followStatus: 0 } },
          {
            $lookup: {
              from: "followers",
              let: { followeeId: "$_id" }, //master user Id
              pipeline: [
                {
                  $match: {
                    followerId: ObjectId(userId),
                    $expr: { $eq: ["$followeeId", "$$followeeId"] },
                    acceptedDate: { $eq: null },
                    type: "user",
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "requested",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$requested" }, 1] }, 1, "$followStatus"],
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
                    followerId: ObjectId(userId),
                    $expr: { $eq: ["$followeeId", "$$followeeId"] },
                    acceptedDate: { $ne: null },
                    type: "user",
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "following",
            },
          },
          {
            $addFields: {
              followStatus: {
                $cond: [{ $eq: [{ $size: "$following" }, 1] }, 2, "$followStatus"],
              },
            },
          },
          {
            $addFields: {
              followStatus: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$followStatus", 0] }, then: "Follow" },
                    { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
                    { case: { $eq: ["$followStatus", 2] }, then: "Following" },
                  ],
                  default: "Follow",
                },
              },
            },
          },
        ],
        as: "sponsor",
      },
    },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1, } },
        ],
        as: "location",
      },
    },
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getUpcomingFamecontest = (
  page,
  gender,
  ageGroup,
  location
) => {
  const currentDate = new Date();
  return FameContestDB.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $gt: ["$startDate", currentDate] }],
        },
        started: true,
        ageGroup: ageGroup,
        gender: gender,
        location: location,
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "sponsoredBy",
        pipeline: [
          {
            $project: { _id: 0, name: 1, profileImage: '$profileImageX50', profileImageType: 1 },
          },

          {
            $set: {
              profileImageType: {
                $cond: [
                  { $ifNull: ["$profileImageType", false] },
                  "$profileImageType",
                  "",
                ],
              },
            },
          },
        ],
        as: "sponsoredBy",
      },
    },
    { $sort: { startDate: -1 } },
  ]).limit(2);
};


exports.getParticipatedTrendz = (data) => {
  return famelinks.aggregate([
    {
      $match: {
        $expr: { $eq: ["$userId", data.userId] },
        challengeId: { $ne: [] },
      },
    },
    { $group: { _id: "$challengeId" } },
    {
      $lookup: {
        from: "fametrendzs",
        let: { value: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$value"] },
            },
          },
        ],
        as: "trendz",
      },
    },
  ]);
};