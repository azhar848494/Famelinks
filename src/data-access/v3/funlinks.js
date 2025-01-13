const mongoose = require("mongoose");
const appConfig = require("../../../configs/app.config");
const ObjectId = mongoose.Types.ObjectId;

const FunlinksDB = require("../../models/v2/funlinks");

const getFunlinks = (page, ageGroup, gender, filterObj) => {
    let pagination = ((page - 1) * 6)
    return FunlinksDB.aggregate([
      { $match: { isWelcomeVideo: { $exists: false } } },
      { $sort: { createdAt: -1 } },
      { $match: filterObj },
      {
        $lookup: {
          from: "profilefunlinks",
          let: { userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            {
              $project: {
                name: 1,
                // dob: 1,
                bio: 1,
                profession: 1,
                profileImage: 1,
                profileImageType: 1,
                // username: 1, //this is present master user table
                _id: 1,
                // type: 1, //this is present master user table
              },
            },
            {
              $lookup: {
                from: "users",
                let: { userId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$profileFunlinks", "$$userId"] },
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
                      profileFunlinks: 1,
                      location: { $first: "$location" },
                      ageGroup: 1,
                      gender: 1,
                    },
                  },
                ],
                as: "masterUser",
              },
            },
            {
              $addFields: {
                username: { $first: "$masterUser.username" },
                type: { $first: "$masterUser.type" },
                dob: { $first: "$masterUser.dob" },
                _id: { $first: "$masterUser._id" },
                location: { $first: "$masterUser.location" },
                ageGroup: { $first: "$masterUser.ageGroup" },
                gender: { $first: "$masterUser.gender" },
              },
            },
            {
              $group: {
                _id: "$_id",
                name: { $first: "$name" },
                type: { $first: "$type" },
                username: { $first: "$username" },
                dob: { $first: "$dob" },
                bio: { $first: "$bio" },
                profession: { $first: "$profession" },
                profileImage: { $first: "$profileImage" },
                profileImageType: { $first: "$profileImageType" },
                location: { $first: "$location" },
                ageGroup: { $first: "$ageGroup" },
                gender: { $first: "$gender" },
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
          from: "challenges",
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
        $addFields: {
          tags: {
            $filter: {
              input: "$tags",
              as: "tag",
              cond: { $eq: [true, "$$tag.accepted"] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$tags.tagId", accepted: "$tags.accepted" },
          pipeline: [
            {
              $match: {
                $or: [
                  { $expr: { $in: ["$_id", "$$userId"] } },
                  { $expr: { $in: ["$profileCollablinks", "$$userId"] } },
                ],
              },
            },
            { $project: { username: 1 } },
          ],
          as: "userTags",
        },
      },
      {
        $lookup: {
          from: "brandproducts",
          let: { userId: "$tags.tagId", accepted: "$tags.accepted" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$userId"] },
              },
            },
            { $project: { name: 1 } },
          ],
          as: "productTags",
        },
      },
      {
        $addFields: {
          tags: {
            $setUnion: ["$userTags", "$productTags"],
          },
        },
      },
      {
        $set: {
          districtWeight: {
            $cond: [{ $eq: ["$user.district", location] }, 0.1, 0],
          },
        },
      },
      {
        $set: {
          stateWeight: { $cond: [{ $eq: ["$user.state", location] }, 0.1, 0] },
        },
      },
      {
        $set: {
          countryWeight: {
            $cond: [{ $eq: ["$user.country", location] }, 0.1, 0],
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
          createdAt: 1,
          updatedAt: 1,
          name: 1,
          profession: 1,
          location: {$first: "$location" },
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
          seen: 1,
          likesCount: 1,
          commentsCount: 1,
          musicId: 1,
          musicName: 1,
          audio: 1,
          tags: { username: 1 },
          talentCategory: 1,
          media: [
            {
              path: "$video",
              type: "video",
            },
          ],
          tags: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: pagination },
      { $limit: 6 },
    ]);
}

const getFunlinksStatus = (postIds, profileId, masterUserId) => {
    return FunlinksDB.aggregate([
        { $match: { $expr: { $in: ['$_id', postIds] } } },
        { $project: { _id: 1, userId: 1 } },
        {
            $lookup: {
                from: "profilefunlinks",
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
                                        $expr: { $eq: ["$profileFunlinks", "$$userId"] },
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
                type: "funlinks",
                likeStatus: { $ifNull: ["$likeStatus", null] },
                followStatus: 1
            }
        }
    ])
}

const getFunlinksWelcomeVideo = (childProfileId, userId, page) => {
  return FunlinksDB.aggregate([
    { $match: { isWelcomeVideo: { $exists: true }, isDeleted: false } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "profilefunlinks",
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
  getFunlinks,
  getFunlinksStatus,
  getFunlinksWelcomeVideo,
};