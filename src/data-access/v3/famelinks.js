const mongoose = require("mongoose");
const appConfig = require("../../../configs/app.config");
const ObjectId = mongoose.Types.ObjectId;

const FamelinksDB = require("../../models/v2/famelinks");
const BrandProductDB = require("../../models/v2/brandProducts");

const getFamelinks = (
  page,
  location,
  ageGroup,
  gender,
  filterObj
) => {
  let pagination = (page - 1) * 6;
  return FamelinksDB.aggregate([
    { $match: { isWelcomeVideo: { $exists: false } } },
    { $sort: { createdAt: -1 } },
    { $match: filterObj },   
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
              username: 1, //this is present master user table
              type: 1, //this is present master user table
              _id: 1,
              dob: 1,
              location: { $first: "$location" },
              ageGroup: 1,
              gender: 1,
              profile: {
                name: "$profileFamelinks.name",
                bio: "$profileFamelinks.bio",
                profession: "$profileFamelinks.profession",
                profileImage: "$profileFamelinks.profileImage",
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
      $match: {
        isDeleted: false,
        isSafe: true,
        isBlocked: false,
        userId: { $ne: ObjectId(appConfig.famelinks.officialId) },
      },
    },
    // Challenge
    {
      $lookup: {
        from: "fametrendzs", //fametrendzs=>v2
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
    {
      $set: {
        districtWeight: {
          $cond: [{ $eq: ["$user.location.type", 'district'] }, 0.1, 0],
        },
      },
    },
    {
      $set: {
        stateWeight: { $cond: [{ $eq: ["$user.location.type", 'state'] }, 0.1, 0] },
      },
    },
    {
      $set: {
        countryWeight: {
          $cond: [{ $eq: ["$user.location.type", 'country'] }, 0.1, 0],
        },
      },
    },
    {
      $set: {
        ageGroupWeight: {
          $cond: [{ $eq: ["$user.ageGroup", ageGroup] }, 0.1, 0],
        },
      },
    },
    {
      $set: {
        genderWeight: {
          $cond: [
            { $eq: ["$user.gender", gender] },
            0,
            { $cond: [{ $eq: ["$user.gender", "other"] }, 0.15, 0.25] },
          ],
        },
      },
    },
    {
      $set: {
        totalWeight: {
          $sum: [
            "$districtWeight",
            "$stateWeight",
            "$countryWeight",
            "$ageGroupWeight",
            "$genderWeight",
          ],
        },
      },
    },
    { $sort: { totalWeight: -1 } },
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
        type: "famelinks",
        createdAt: 1,
        updatedAt: 1,
        name: 1,
        profession: 1,
        location: { $first: "$location" },
        gender: 1,
        challenges: 1,
        user: {
          _id: 1,
          name: 1,
          type: 1,
          username: 1,
          dob: 1,
          bio: 1,
          profession: 1,
          profileImage: 1,
          profileImageType: 1,
        },
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        likes0Count: 1,
        likes1Count: 1,
        likes2Count: 1,
        commentsCount: 1,
        participation: 1,
        ambassadorTrendz: {
          $ifNull: [{ $toBool: "$ambassadorTrendz" }, false],
        },
        famelinksContest: {
          $ifNull: [{ $toBool: "$famelinksContest" }, false],
        },
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
    { $sort: { createdAt: -1 } },
    { $skip: pagination },
    { $limit: 6 },
  ]);
  // .sort({ createdAt: "desc" });
};

const getFameLinksOfficialPosts = (page) => {
  let pagination = (page - 1) * 6;
  return BrandProductDB.aggregate([
    {
      $match: {
        isDeleted: false,
        isSafe: true,
        isBlocked: false,
        userId: ObjectId(appConfig.famelinks.officialId),
      },
    },
    { $sort: { createdAt: -1 } },
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
              profileImage: 1,
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
    {
      $addFields: {
        tags: {
          $cond: {
            if: { $isArray: "$tags" },
            then: { $size: "$tags" },
            else: 0,
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
        createdAt: 1,
        updatedAt: 1,
        name: 1,
        profession: 1,
        location: { $first: "$location" },
        price: 1,
        hashTag: 1,
        purchaseUrl: 1,
        gender: 1,
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        type: "brand",
        buttonName: 1,
        likes0Count: 1,
        likes1Count: 1,
        likes2Count: 1,
        commentsCount: 1,
        media: 1,
        winnerTitles: [],
        tags: 1,
      },
    },
    { $skip: pagination },
    { $limit: 6 },
  ]);
};

const getFamelinksStatus = (postIds, profileId, masterUserId) => {
  return FamelinksDB.aggregate([
    { $match: { $expr: { $in: ["$_id", postIds] } } },
    { $project: { _id: 1, userId: 1 } },
    {
      $lookup: {
        from: "profilefamelinks",
        let: { userId: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          { $project: { _id: 1 } },
          {
            $lookup: {
              from: "users",
              let: { userId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$profileFamelinks", "$$userId"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "masterUser",
            },
          },
          { $addFields: { _id: { $first: "$masterUser._id" } } },
          { $group: { _id: "$_id" } },
        ],
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },
    { $match: { $expr: { $ne: ["$user._id", null] } } },
    {
      $lookup: {
        from: "likes",
        let: { mediaId: "$_id" },
        pipeline: [
          {
            $match: {
              userId: ObjectId(profileId), //FamelinksProfile=>v2
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
        let: { followeeId: "$user._id" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: ObjectId(masterUserId),
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
        let: { followeeId: "$user._id" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: ObjectId(masterUserId),
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
              { case: { $eq: ["$followStatus", 1] }, then: "Request Sent" },
              { case: { $eq: ["$followStatus", 2] }, then: "Following" },
            ],
            default: "Follow",
          },
        },
      },
    },
    {
      $project: {
        type: "famelinks",
        likeStatus: { $ifNull: ["$likeStatus", null] },
        followStatus: 1,
      },
    },
  ]);
};

const getFameLinksWelcomeVideo = (childProfileId, userId, page) => {
  return FamelinksDB.aggregate([
    { $match: { isWelcomeVideo: { $exists: true }, isDeleted: false } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "profilefamelinks",
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
                    $expr: { $eq: ["$profileFamelinks", "$$userId"] },
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
  getFamelinks,
  getFameLinksOfficialPosts,
  getFamelinksStatus,
  getFameLinksWelcomeVideo,
};