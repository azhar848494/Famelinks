const mongoose = require("mongoose");
const appConfig = require("../../../configs/app.config");
const ObjectId = mongoose.Types.ObjectId;

const FunlinksDB = require("../../models/v2/funlinks");
const MusicDB = require("../../models/v2/music");

exports.addPost = (data) => {
  return FunlinksDB.create(data);
};

exports.updatePost = (postId, post) => {
  return FunlinksDB.updateOne({ _id: postId }, { $set: post });
};

exports.getFunLinks = (masterUserId, page, profileId, filterObj) => {
  return FunlinksDB.aggregate([
    { $match: { isWelcomeVideo: { $exists: false } } },
    { $sort: { createdAt: -1 } },
    { $match: filterObj },
    {
      $lookup: {
        from: "users",
        pipeline: [
          { $match: { _id: ObjectId(masterUserId) } },
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
        $expr: { $not: [{ $in: ["$userId", Array.isArray("$blockedUserIds") ? "$blockedUserIds" : []] }] },
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
                name: "$profileFunlinks.name",
                bio: "$profileFunlinks.bio",
                profession: "$profileFunlinks.profession",
                profileImage: "$profileFunlinks.profileImage",
                profileImageType: "$profileFunlinks.profileImageType",
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
              $expr: { $in: ["$_id", Array.isArray("$$challengeId") ? "$$challengeId" : []] },
              isDeleted: false,
            },
          },
          { $project: { hashTag: 1 } },
        ],
        as: "challenges",
      },
    },
    // {
    //   $lookup: {
    //     from: "fametrendzs",
    //     let: { challengeId: "$challengeId" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: { $in: ["$_id", Array.isArray("$$challengeId") ? "$$challengeId" : []] },
    //           isDeleted: false,
    //           type: "funlinks",
    //         },
    //       },
    //       { $project: { hashTag: 1 } },
    //     ],
    //     as: "fametrendzs",
    //   },
    // },
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
              $expr: { $in: ["$_id", Array.isArray("$$userId") ? "$$userId" : []] } ,
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
              $expr: { $in: ["$_id", Array.isArray("$$userId") ? "$$userId" : []] },
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
        gender: 1,
        challenges: 1,
        // fametrendzs: 1,
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        seen: 1,
        likesCount: 1,
        commentsCount: 1,
        musicId: 1,
        musicName: 1,
        audio: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: ["$likeStatus", null] },
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
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 6)
    .limit(10);
};

exports.getFunlinksFollowlinks = (funLinksId, userId, page, filterObj) => {
  return FunlinksDB.aggregate([
    { $sort: { createdAt: -1 } },
    { $match: filterObj },
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
        $expr: { $not: [{ $in: ["$userId", Array.isArray("$blockedUserIds") ? "$blockedUserIds" : []] }] },
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
                name: "$profileFunlinks.name",
                bio: "$profileFunlinks.bio",
                profession: "$profileFunlinks.profession",
                profileImage: "$profileFunlinks.profileImage",
                profileImageType: "$profileFunlinks.profileImageType",
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
              $expr: { $in: ["$_id", Array.isArray("$$challengeId") ? "$$challengeId" : []] },
              isDeleted: false,
            },
          },
          { $project: { hashTag: 1 } },
        ],
        as: "challenges",
      },
    },
    // {
    //   $lookup: {
    //     from: "fametrendzs",
    //     let: { challengeId: "$challengeId" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: { $in: ["$_id", Array.isArray("$$challengeId") ? "$$challengeId" : []] },
    //           isDeleted: false,
    //           type: "funlinks",
    //         },
    //       },
    //       { $project: { hashTag: 1 } },
    //     ],
    //     as: "fametrendzs",
    //   },
    // },
    {
      $lookup: {
        from: "likes",
        let: { mediaId: "$_id" },
        pipeline: [
          {
            $match: {
              userId: ObjectId(funLinksId),
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
              $expr: { $in: ["$_id", Array.isArray("$$userId") ? "$$userId" : []] }
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
              $expr: { $in: ["$_id", Array.isArray("$$userId") ? "$$userId" : []] },
            },
          },
          { $project: { name: 1 } },
        ],
        as: "productTags",
      },
    },
    { $addFields: { tags: { $setUnion: ["$userTags", "$productTags"] } } },
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
        gender: 1,
        challenges: 1,
        // fametrendzs: 1,
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        seen: 1,
        likesCount: 1,
        commentsCount: 1,
        musicId: 1,
        musicName: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: ["$likeStatus", null] },
        tags: 1,
        talentCategory: 1,
        media: [
          {
            path: "$video",
            type: "video",
          },
        ],
        type: "funlinks",
      },
    },
    { $match: { followStatus: "Following" } },
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 4)
    .limit(4);
};

exports.getMyFunLinks = (
  userId,
  userProfileId,
  selfMasterId,
  filterObj
) => {
  return FunlinksDB.aggregate([
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
            $project: {
              username: 1,
              type: 1,
              _id: 1,
              dob: 1,
              profile: {
                name: "$profileFunlinks.name",
                bio: "$profileFunlinks.bio",
                profession: "$profileFunlinks.profession",
                profileImage: "$profileFunlinks.profileImage",
                profileImageType: "$profileFunlinks.profileImageType",
              }
            },
          },
        ],
        as: "users",
      },
    },
    { $addFields: { users: { $first: "$users" } } },

    // Like Status
    {
      $lookup: {
        from: "likes",
        let: { mediaId: "$_id" },
        pipeline: [
          {
            $match: {
              userId: userProfileId,
              $expr: { $eq: ["$mediaId", "$$mediaId"] },
            },
          },
          { $project: { status: 1, _id: 0 } },
        ],
        as: "likeStatus",
      },
    },
    { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },
    // Challenge
    {
      $lookup: {
        from: "challenges",
        let: { challengeId: "$challengeId" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", Array.isArray("$$challengeId") ? "$$challengeId" : []] },
              isDeleted: false,
            },
          },
          { $project: { hashTag: 1 } },
        ],
        as: "challenges",
      },
    },
    {
      $lookup: {
        from: "users",
        let: { profileFunlinks: ObjectId(userId) },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$profileFunlinks"],
              },
              isDeleted: false,
              isSuspended: false,
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },
    { $addFields: { followStatus: 0 } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$user._id" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: selfMasterId,
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $eq: null },
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
              followerId: selfMasterId,
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $ne: null },
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
        followStatus: 1,
        users: 1,
        createdAt: 1,
        updatedAt: 1,
        name: 1,
        profession: 1,
        location: { $first: "$location" },
        gender: 1,
        challenges: 1,
        likesCount: 1,
        commentsCount: 1,
        musicId: 1,
        musicName: 1,
        audio: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        likeStatus: { $ifNull: ["$likeStatus", null] },
        media: [
          {
            path: "$video",
            type: "video",
          },
        ],
      },
    },
  ])
    .sort({ createdAt: "desc" })
    // .skip((page - 1) * 10)
    // .limit(10)
    ;
};

// exports.getFollowLinks = (userId, page) => {
//     return FunlinksDB.aggregate([
//         {
//             $lookup: {
//                 from: 'followers',
//                 let: { userId: "$userId" },
//                 pipeline: [{
//                     $match: {
//                         followerId: ObjectId(userId),
//                         $expr: {
//                             $eq: ["$followeeId", "$$userId"]
//                         }
//                     }
//                 }, {
//                     $project: { followerId: 1, _id: 0 }
//                 }],
//                 as: 'userData'
//             }
//         },
//         { $unwind: { path: "$userData" } },
//         {
//             $lookup: {
//                 from: 'users',
//                 let: { userId: "$userId" },
//                 pipeline: [{
//                     $match: { $expr: { $eq: ["$_id", "$$userId"] } }
//                 }, {
//                     $project: { name: 1, dob: 1, bio: 1, profession: 1, profileImage: 1 }
//                 }],
//                 as: 'user'
//             }
//         },
//         { $addFields: { 'user': { $first: '$user' } } },
//         {
//             $lookup: {
//                 from: 'challenges',
//                 let: { challengeId: '$challengeId' },
//                 pipeline: [
//                     { $match: { $expr: { $in: ['$_id', '$$challengeId'] } } },
//                     { $project: { name: 1 } }
//                 ],
//                 as: 'challenges'
//             }
//         },
//         { $project: {
//             createdAt: 1,
//             updatedAt: 1,
//             name: 1,
//             profession: 1,
//             district: 1,
//             state: 1,
//             country: 1,
//             gender: 1,
//             challenges: 1,
//             user: 1,
//             description: 1,
//             profileImage: 1,
//             maleSeen: 1,
//             femaleSeen: 1,
//             likes0Count: 1,
//             likes1Count: 1,
//             likes2Count: 1,
//             commentsCount: 1,
//             likeStatus: { $ifNull: ['$likeStatus', null] },
//             media: [
//                 {
//                     path: '$closeUp',
//                     type: 'closeUp'
//                 },
//                 {
//                     path: '$medium',
//                     type: 'medium'
//                 },
//                 {
//                     path: '$long',
//                     type: 'long'
//                 },
//                 {
//                     path: '$pose1',
//                     type: 'pose1'
//                 },
//                 {
//                     path: '$pose2',
//                     type: 'pose2'
//                 },
//                 {
//                     path: '$additional',
//                     type: 'additional'
//                 },
//                 {
//                     path: '$video',
//                     type: 'video'
//                 }
//             ],
//         } }
//     ]).sort({ updatedAt: 'desc' }).skip((page - 1) * 10).limit(10);
// };

// exports.getFunLinks = (user, page) => {
//     return MediaDB.aggregate([
//         { $match: { type: 'funlink' } },
//         {
//             $lookup: {
//                 from: 'comments',
//                 let: { mediaId: "$_id" },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $eq: ["$mediaId", "$$mediaId"]
//                             }
//                         },
//                     },
//                     { $count: 'comments' }
//                 ],
//                 as: 'commentsCount'
//             }
//         },
//         { $unwind: { path: '$commentsCount', preserveNullAndEmptyArrays: true } },
//         { $addFields: { commentsCount: '$commentsCount.comments'} },
//         {
//             $lookup: {
//                 from: 'likes',
//                 let: { mediaId: "$_id" },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $eq: ["$mediaId", "$$mediaId"]
//                             }
//                         },
//                     },
//                     { $count: 'likes' }
//                 ],
//                 as: 'likesCount'
//             }
//         },
//         { $unwind: { path: '$likesCount', preserveNullAndEmptyArrays: true } },
//         { $addFields: { likesCount: '$likesCount.likes'} },
//         {
//             $lookup: {
//                 from: 'likes',
//                 let: { mediaId: '$_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             userId: user._id,
//                             $expr: {
//                                 $eq: ["$mediaId", "$$mediaId"]
//                             }
//                         }
//                     },
//                     { $project: { status: 1, _id: 0 } }
//                 ],
//                 as: 'likeStatus'
//             }
//         },
//         { $unwind: { path: '$likeStatus', preserveNullAndEmptyArrays: true } },
//         { $addFields: { 'likeStatus': '$likeStatus.type' } },
//         {
//             $lookup: {
//                 from: 'users',
//                 let: { userId: "$userId" },
//                 pipeline: [{
//                     $match: {
//                         $expr: {
//                             $eq: ["$_id", "$$userId"]
//                         }
//                     }
//                 }],
//                 as: 'user'
//             }
//         },
//         { $unwind: { path: '$user' } },
//         { $project: {
//             _id: 1,
//             maleSeen: 1,
//             femaleSeen: 1,
//             challengeId: 1,
//             path: 1,
//             createdAt: 1,
//             updatedAt: 1,
//             commentsCount: 1,
//             likesCount: 1,
//             likeStatus: 1,
//             user: {
//                 _id: 1,
//                 name: 1,
//                 profession: 1,
//                 district: 1,
//                 state: 1,
//                 country: 1,
//                 gender: 1,
//                 profileImage: null,
//             }
//         } }
//     ]).sort({ updatedAt: 'desc' }).skip((page - 1) * 10).limit(10);
// };

// exports.getMyFunLinks = (userId, page) => {
//     return MediaDB.aggregate([
//         { $match: { type: 'funlink', userId: ObjectId(userId) } },
//         {
//             $lookup: {
//                 from: 'comments',
//                 let: { mediaId: "$_id" },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $eq: ["$mediaId", "$$mediaId"]
//                             }
//                         },
//                     },
//                     { $count: 'comments' }
//                 ],
//                 as: 'commentsCount'
//             }
//         },
//         { $unwind: { path: '$commentsCount', preserveNullAndEmptyArrays: true } },
//         { $addFields: { commentsCount: '$commentsCount.comments'} },
//         {
//             $lookup: {
//                 from: 'likes',
//                 let: { mediaId: "$_id" },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $eq: ["$mediaId", "$$mediaId"]
//                             }
//                         },
//                     },
//                     { $count: 'likes' }
//                 ],
//                 as: 'likesCount'
//             }
//         },
//         { $unwind: { path: '$likesCount', preserveNullAndEmptyArrays: true } },
//         { $addFields: { likesCount: '$likesCount.likes'} }
//     ]).sort({ updatedAt: 'desc' }).skip((page -1) * 10).limit(10);
// };

// exports.getUserMediaById = (mediaId, userId) => {
//     return MediaDB.findOne({ _id: mediaId, userId });
// };

// exports.getMyChallenges = (userId, page) => {
//     return MediaDB.aggregate([
//         { $match: { userId: ObjectId(userId) } },
//         {
//             $lookup: {
//                 from: 'comments',
//                 let: { mediaId: "$_id" },
//                 pipeline: [
//                     { $match: { $expr: { $eq: ["$mediaId", "$$mediaId"] } } },
//                     { $count: 'comments' }
//                 ],
//                 as: 'commentsCount'
//             }
//         },
//         { $addFields: { commentsCount: { $first: '$commentsCount.comments' } } },
//         {
//             $lookup: {
//                 from: 'likes',
//                 let: { mediaId: "$_id" },
//                 pipeline: [
//                     { $match: { $expr: { $eq: ["$mediaId", "$$mediaId"] } } },
//                     { $group: { _id: null, likes: { $sum: { $divide: ['$status', 2] } } } }
//                 ],
//                 as: 'likesCount'
//             }
//         },
//         { $addFields: { likesCount: { $first: '$likesCount.likes' } } },
//         {
//             $lookup: {
//                 from: 'likes',
//                 let: { mediaId: '$_id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             userId: ObjectId(userId),
//                             $expr: { $eq: ["$mediaId", "$$mediaId"] }
//                         }
//                     },
//                     { $project: { status: 1, _id: 0 } }
//                 ],
//                 as: 'likeStatus'
//             }
//         },
//         { $addFields: { 'likeStatus': { $first: '$likeStatus.status' } } },
//         {
//             $lookup: {
//                 from: 'users',
//                 let: { userId: '$userId'},
//                 pipeline: [
//                     { $match: { $expr: { $eq: ["$$userId", "$_id"] } } },
//                     {
//                         $project: {
//                             name: 1,
//                             profession: 1,
//                             district: 1,
//                             state: 1,
//                             country: 1,
//                             gender: 1,
//                             profileImage: 1
//                         }
//                     }
//                 ],
//                 as: 'user'
//             }
//         },
//         { $addFields: { user: { $first: '$user' } } },
//         {
//             $lookup: {
//                 from: 'challenges',
//                 let: { challengeId: '$challengeId' },
//                 pipeline: [
//                     { $match: { $expr: { $eq: ['$$challengeId', '$_id'] } } },
//                     { $project: { name: 1, _id: 0 } }
//                 ],
//                 as: 'challenge'
//             }
//         },
//         { $addFields: { challengeName: { $first: '$challenge.name' } } },
//         { $project: {
//             _id: 1,
//             path: 1,
//             user: 1,
//             maleSeen: 1,
//             femaleSeen: 1,
//             district: 1,
//             state: 1,
//             country: 1,
//             description: 1,
//             challengeId: 1,
//             createdAt: 1,
//             updatedAt: 1,
//             challengeName: 1,
//             likeStatus: { $ifNull: ['$likeStatus', null] },
//             likesCount: { $ifNull: ['$likesCount', 0] },
//             commentsCount: { $ifNull: ['$commentsCount', 0] }
//         } }
//     ]).sort({ updatedAt: 'desc' }).skip((page -1) * 10).limit(10);
// };

exports.getOnePost = (postId) => {
  return FunlinksDB.findOne({ _id: postId }).lean();
};

exports.updatePostLikeCounter = (postId, obj) => {
  return FunlinksDB.updateOne({ _id: postId }, { $inc: obj });
};

exports.updatePostCommentCounter = (postId, incBy) => {
  return FunlinksDB.updateOne(
    { _id: postId },
    { $inc: { commentsCount: incBy } }
  );
};

exports.getMusic = (page, search, type, savedMusic) => {
  const obj = {};
  if (savedMusic && savedMusic.length) {
    obj._id = { $in: savedMusic };
  }
  if (search) {
    obj.name = { $regex: `^.*?${search}.*?$`, $options: "gi" };
  }
  if (type) {
    obj.addedBy = type;
  }
  return MusicDB.find(obj)
    .lean()
    .sort({ updatedAt: "desc" })
    .skip((page - 1) * 10)
    .limit(25);
};

exports.getFunLinksById = (userId, postId, profileId) => {
  return FunlinksDB.aggregate([
    { $match: { _id: ObjectId(postId) } },
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
                name: "$profileFunlinks.name",
                bio: "$profileFunlinks.bio",
                profession: "$profileFunlinks.profession",
                profileImage: "$profileFunlinks.profileImage",
                profileImageType: "$profileFunlinks.profileImageType",
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
              $expr: { $in: ["$_id", Array.isArray("$$challengeId") ? "$$challengeId" : []] },
              isDeleted: false,
            },
          },
          { $project: { hashTag: 1 } },
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
              userId: ObjectId(profileId), //FunlinksProfileId
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
        gender: 1,
        challenges: 1,
        user: 1, //{ name: 1, dob: 1, bio: 1, profession: 1, profileImage: 1, _id: 1, username: 1, type: 1 },
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        likesCount: 1,
        commentsCount: 1,
        musicId: 1,
        musicName: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: ["$likeStatus", null] },
        media: [
          {
            path: "$video",
            type: "video",
          },
        ],
        tags: 1,
      },
    },
  ]);
};

exports.getChallengeParticipantsCount = (challengeId) => {
  return FunlinksDB.find({
    challengeId: { $in: [ObjectId(challengeId)] },
  }).count();
};

exports.deletePost = (postId, userId) => {
  return FunlinksDB.findOneAndDelete({ _id: postId, userId });
};

exports.addMusic = (music, name, duration, thumbnail) => {
  return MusicDB.create({
    music,
    by: "Unknown",
    name,
    duration,
    addedBy: "user",
    thumbnail,
  });
};

exports.getFunlinksMusicPosts = (userId, musicId, page) => {
  return FunlinksDB.aggregate([
    // Self User
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
            { $eq: [ObjectId(musicId), "$musicId"] },
            { $not: [{ $in: ["$userId", Array.isArray("$blockedUserIds") ? "$blockedUserIds" : []] }] },
          ],
        },
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
    // Challenge
    {
      $lookup: {
        from: "challenges",
        let: { challengeId: "$challengeId" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", Array.isArray("$$challengeId") ? "$$challengeId" : []] },
              isDeleted: false,
            },
          },
          // { $project: { name: 1 } }
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
              userId: ObjectId(userId),
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
              followerId: ObjectId(userId),
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $eq: null },
              type: 'user'
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "requested",
      },
    },
    { $addFields: { followStatus: { $cond: [{ $eq: [{ $size: '$requested' }, 1] }, 1, '$followStatus'] } } },
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
              type: 'user'
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "following",
      },
    },
    { $addFields: { followStatus: { $cond: [{ $eq: [{ $size: '$following' }, 1] }, 2, '$followStatus'] } } },
    {
      $addFields: {
        followStatus: {
          $switch: {
            branches: [
              { case: { $eq: ['$followStatus', 0] }, then: 'Follow' },
              { case: { $eq: ['$followStatus', 1] }, then: 'Request Sent' },
              { case: { $eq: ['$followStatus', 2] }, then: 'Following' }
            ],
            default: 'Follow'
          }
        }
      }
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
        gender: 1,
        challenges: 1,
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        // seen: 1,
        likesCount: 1,
        commentsCount: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: [{ $toBool: "$likeStatus" }, false] },
        // video: 1,
        media: [
          {
            path: "$video",
            type: "video",
          },
        ],
      },
    },
  ])
    .sort({ updatedAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getMusicById = (musicId) => {
  return MusicDB.findById(musicId).lean();
};

exports.getTotalVideos = (profileId) => {
  return FunlinksDB.aggregate([
    { $match: { userId: profileId } },
    { $project: { _id: 1 } },
  ]);
};

exports.getTotalLikesViews = async (profileId) => {
  return FunlinksDB.aggregate([
    { $match: { userId: profileId } },
    {
      $group: {
        _id: "$userId",
        totalLikes: { $sum: "$likesCount" },
        totalViews: { $sum: "$seen" },
      },
    },
    { $project: { totalLikes: 1, totalViews: 1, _id: 0 } },
  ]);
};

exports.getWelcomeVideo = (profileId) => {
  return FunlinksDB.aggregate([
    { $match: { userId: profileId, isWelcomeVideo: { $ne: null } } },
  ]);
};

exports.searchFunlinksById = (postId) => {
  return FunlinksDB.find({ _id: postId }).lean();
};

exports.updatePostFunlinks = (postId, post) => {
  return FunlinksDB.updateOne({ _id: postId }, { $set: post });
};

exports.updateViews = (mediaId, obj) => {
  return FunlinksDB.updateOne({ _id: mediaId }, { $inc: obj })
}

exports.getTodaysOfferPosts = (userId) => {
  const todaysDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  return FunlinksDB.find({ userId, createdAt: { $gte: todaysDate }, offerId: { $ne: null } }).count()
}

exports.getLatestPosts = (date) => {
  return FunlinksDB.find({
    createdAt: { $gte: date },
    isDeleted: false,
  }).count();
};
