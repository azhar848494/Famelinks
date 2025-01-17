const mongoose = require("mongoose");
const appConfig = require("../../../configs/app.config");
const ObjectId = mongoose.Types.ObjectId;

const FamelinksDB = require("../../models/v2/famelinks");
const BrandProductDB = require("../../models/v2/brandProducts");
const likesDB = require("../../models/v2/likes");
const commentsDB = require("../../models/v2/comments");
const UsersDB = require("../../models/v2/users");
const NotificationDB = require("../../models/v2/notifications");
const FametrendzDB = require("../../models/v2/fametrendzs");

exports.addPost = (data) => {
  return FamelinksDB.create(data);
};

exports.updatePost = (postId, post) => {
  return FamelinksDB.updateOne({ _id: postId }, post);
};

exports.getFollowLinks = (userId, page) => {
  return FamelinksDB.aggregate([
    {
      $lookup: {
        from: "followers",
        let: { userId: "$userId" },
        pipeline: [
          {
            $match: {
              followerId: ObjectId(userId),
              $expr: {
                $eq: ["$followeeId", "$$userId"],
              },
            },
          },
          {
            $project: { followerId: 1, _id: 0 },
          },
        ],
        as: "userData",
      },
    },
    { $unwind: { path: "$userData" } },
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          {
            $match: { $expr: { $eq: ["$_id", "$$userId"] } },
          },
          {
            $project: {
              name: 1,
              dob: 1,
              bio: 1,
              profession: 1,
              profileImage: 1,
              profileImageType: 1,
            },
          },
        ],
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },
    {
      $lookup: {
        from: "challenges",
        let: { challengeId: "$challengeId" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$challengeId"] } } },
          { $project: { name: 1 } },
        ],
        as: "challenges",
      },
    },
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
          {
            $lookup: {
              from: "locatns",
              let: { value: "$scopes" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                { $project: { type: 1, value: 1, } },
                { $sort: { _id: -1 } },
              ],
              as: "scopes",
            },
          },
          {
            $project: {
              type: 1, value: {
                $concat: [
                  '$value',
                  ', ',
                  {
                    $reduce: {
                      input: "$scopes",
                      initialValue: "",
                      in: {
                        $concat: [
                          "$$value",
                          { $cond: { if: { $eq: ["$$value", ""] }, then: "", else: ", " } },
                          "$$this.value"
                        ]
                      }
                    }
                  },
                ],
              },
            }
          },
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
        location: 1,
        gender: 1,
        challenges: 1,
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        maleSeen: 1,
        femaleSeen: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likes0Count: 1,
        likes1Count: 1,
        likes2Count: 1,
        commentsCount: 1,
        likeStatus: { $ifNull: ["$likeStatus", null] },
        media: [
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
          {
            path: "$video",
            type: "video",
          },
        ],
        tags: 1,
      },
    },
  ])
    .sort({ updatedAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

//exports.getFunLinks = (user, page) => {
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

//exports.getMyFunLinks = (userId, page) => {
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

exports.getMyFameLinks = (
  profileId,
  page,
  childProfileId,
  selfMasterId,
  filterObj,
  sorted
) => {
  return (
    FamelinksDB.aggregate([
      { $match: filterObj },
      { $sort: sorted },
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
                profileImage:1,
                profileImageType:1,
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
                userId: childProfileId,
                $expr: { $eq: ["$mediaId", "$$mediaId"] },
              },
            }, //childProfileId => the one who is visting someone else's profile/posts
            { $project: { status: 1, _id: 0 } },
          ],
          as: "likeStatus", //0,1,2
        },
      },
      { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },
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
      { $addFields: { followStatus: 0 } },
      {
        $lookup: {
          from: "followers",
          let: { followeeId: "$userId" },
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
          let: { followeeId: "$userId" },
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
          isWelcomeVideo: 1,
          name: 1,
          profession: 1,
          location: { $first: "$location" },
          buttonName: 1,
          gender: 1,
          challenges: 1,
          likes0Count: 1,
          likes1Count: 1,
          likes2Count: 1,
          commentsCount: 1,
          description: 1,
          profileImage: 1,
          profileImageType: 1,
          likeStatus: { $ifNull: ["$likeStatus", null] },
          isWelcomeVideo: {
            $cond: [{ $ifNull: ["$isWelcomeVideo", false] }, 1, 0],
          },
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
      // { $sort: { createdAt: -1 } },
    ])
      // .sort({ createdAt: -1, isWelcomeVideo: -1 })
      .skip((page - 1) * 10)
      .limit(10)
  );
};

//exports.getFameLinks = (userId, page) => {
//   return FamelinksDB.aggregate([
//     {
//       $lookup: {
//         from: "users",
//         let: { userId: "$userId" },
//         pipeline: [
//           { $match: { _id: ObjectId(userId) } },
//           { $project: { blockList: 1 } },
//         ],
//         as: "selfUser",
//       },
//     },
//     { $addFields: { blockedUserIds: { $first: "$selfUser.blockList" } } },
//     {
//       $match: {
//         isDeleted: false,
//         isSafe: true,
//         isBlocked: false,
//         userId: { $ne: ObjectId(appConfig.famelinks.officialId) },
//         $expr: { $not: [{ $in: ["$userId", Array.isArray("$blockedUserIds") ? "$blockedUserIds" : []] }] },
//       },
//     },
//     // User
//     {
//       $lookup: {
//         from: "users",
//         let: { userId: "$userId" },
//         pipeline: [
//           { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
//           {
//             $project: {
//               name: 1,
//               dob: 1,
//               bio: 1,
//               profession: 1,
//               profileImage: 1,
//               username: 1,
//               _id: 1,
//               type: 1,
//               // ambassador: 1,
//             },
//           },
//         ],
//         as: "user",
//       },
//     },
//     { $addFields: { user: { $first: "$user" } } },
//     // Challenge
//     {
//       $lookup: {
//         from: "challenges",
//         let: { challengeId: "$challengeId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: { $in: ["$_id", "$$challengeId"] },
//               isDeleted: false,
//             },
//           },
//           { $project: { name: 1 } },
//         ],
//         as: "challenges",
//       },
//     },
//     {
// $lookup: {
//   from: "likes",
//   let: { mediaId: "$_id" },
//   pipeline: [
//     {
//       $match: {
//         userId: ObjectId(userId),
//         $expr: { $eq: ["$mediaId", "$$mediaId"] },
//       },
//     },
//     { $project: { status: 1, _id: 0 } },
//   ],
//   as: "likeStatus",
// },
//     },
//     { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },
//     {
//       $lookup: {
//         from: "followers",
//         let: { followeeId: "$user._id" },
//         pipeline: [
//           {
//             $match: {
//               followerId: ObjectId(userId),
//               $expr: { $eq: ["$followeeId", "$$followeeId"] },
//             },
//           },
//           { $project: { _id: 1 } },
//         ],
//         as: "followStatus",
//       },
//     },
//     { $addFields: { followStatus: { $first: "$followStatus._id" } } },
//     {
//       $project: {
//         type: "famelinks",
//         createdAt: 1,
//         updatedAt: 1,
//         name: 1,
//         profession: 1,
//         district: 1,
//         state: 1,
//         country: 1,
//         gender: 1,
//         challenges: 1,
//         user: 1,
//         description: 1,
//         profileImage: 1,
//         // maleSeen: 1,
//         // femaleSeen: 1,
//         likes0Count: 1,
//         likes1Count: 1,
//         likes2Count: 1,
//         commentsCount: 1,
//         followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
//         likeStatus: { $ifNull: ["$likeStatus", null] },
//         media: [
//           {
//             path: "$video",
//             type: "video",
//           },
//           {
//             path: "$closeUp",
//             type: "closeUp",
//           },
//           {
//             path: "$medium",
//             type: "medium",
//           },
//           {
//             path: "$long",
//             type: "long",
//           },
//           {
//             path: "$pose1",
//             type: "pose1",
//           },
//           {
//             path: "$pose2",
//             type: "pose2",
//           },
//           {
//             path: "$additional",
//             type: "additional",
//           },
//         ],
//         // winnerTitles: ['FameLinks Ambassador - Mumbai'],
//         winnerTitles: [],
//       },
//     },
//   ])
//     .sort({ createdAt: "desc" })
//     .skip((page - 1) * 10)
//     .limit(10);
// };

//---------------------------------v2------------------------------------//

exports.getFameLinks = (profileId, masterUserId, page, filterObj, limit) => {
  return FamelinksDB.aggregate([
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
              dob: 1,
              name: 1,
              profileImage:1,
              profileImageType:1,
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
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        likes0Count: 1,
        likes1Count: 1,
        likes2Count: 1,
        commentsCount: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: ["$likeStatus", null] },
        participation: 1,
        districtLevel: {
          $ifNull: [{ $toBool: "$districtLevel" }, false],
        },
        stateLevel: {
          $ifNull: [{ $toBool: "$stateLevel" }, false],
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
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * limit)
    .limit(limit);
};
//---------------------------------v2------------------------------------//

exports.getAdFameLinks = (userId, page) => {
  return FamelinksDB.aggregate([
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
              // ambassador: 1,
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
              $expr: { $in: ["$_id", "$$challengeId"] },
              isDeleted: false,
            },
          },
          { $project: { name: 1 } },
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
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$user._id" },
        pipeline: [
          {
            $match: {
              followerId: ObjectId(userId),
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "followStatus",
      },
    },
    { $addFields: { followStatus: { $first: "$followStatus._id" } } },
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
        typeOf: "Normal Post",
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
        // maleSeen: 1,
        // femaleSeen: 1,
        likes0Count: 1,
        likes1Count: 1,
        likes2Count: 1,
        commentsCount: 1,
        followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
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
        // winnerTitles: ['FameLinks Ambassador - Mumbai'],
        winnerTitles: [],
      },
    },
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 10)
    .limit(6);
};

exports.getFameLinksFollowlinks = (fameLinksId, userId, page, filterObj ) => {
  return FamelinksDB.aggregate([
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
              dob: 1,
              name: 1,
              profileImage:1,
              profileImageType:1,
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
              // type: 'funlinks'
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
              userId: ObjectId(fameLinksId),
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
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
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
        type: "famelinks",
        winnerTitles: [],
      },
    },
    { $match: { followStatus: "Following" } },
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 4)
    .limit(4);
};

exports.getOnePost = (postId) => {
  return FamelinksDB.findOne({ _id: postId }).lean();
};

//exports.getUserMediaById = (mediaId, userId) => {
//     return MediaDB.findOne({ _id: mediaId, userId });
// };

//exports.getMyChallenges = (userId, page) => {
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
//                 let: { mediaId: '$_id' },c
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

exports.updatePostLikeCounter = (postId, obj) => {
  return FamelinksDB.updateOne({ _id: postId }, { $inc: obj });
};

exports.updatePostCommentCounter = (postId, incBy) => {
  return FamelinksDB.updateOne(
    { _id: postId },
    { $inc: { commentsCount: incBy } }
  );
};

exports.deletePost = (postId, userId) => {
  return FamelinksDB.findOneAndDelete({ _id: postId, userId });
};

exports.deleteLike = (postId) => {
  return likesDB.deleteMany({ mediaId: postId });
};

exports.deleteComment = (postId) => {
  return commentsDB.deleteMany({ mediaId: postId });
};

exports.decreaseCount = (challengeId) => {
  return FametrendzDB.updateMany(
    { _id: challengeId },
    { $inc: { totalPost: -1 } }
  );
};

exports.updatePostMedia = (postId, userId, post) => {
  return FamelinksDB.updateOne(
    { _id: postId, userId },
    {
      $set: { ...post },
    }
  );
};

exports.getChallengeParticipantsCount = (challengeId) => {
  return FamelinksDB.find({
    challengeId: { $in: [ObjectId(challengeId)] },
  }).count();
};

exports.getUserMostLikedPost = (userId) => {
  return FamelinksDB.aggregate()
    .match({ userId })
    .addFields({ likesCount: { $add: ["$likes1Count", "$likes2Count"] } })
    .sort({ likesCount: "desc" })
    .limit(1);
};

//exports.getFameLinksById = (userId, postId) => {
//   return FamelinksDB.aggregate([
//     { $match: { _id: ObjectId(postId) } },
//     // User
//     {
//       $lookup: {
//         from: "users",
//         localField: "userId",
//         foreignField: "_id",
//         as: "user",
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "userId",
//         foreignField: "_id",
//         pipeline: [
//           { $project: { name: 1 } },
//           { $sort: { likesCount: -1 } },
//           { $limit: 1 },
//         ],
//         as: "winnerTitle",
//       },
//     },

//     { $addFields: { user: { $first: "$user" } } },
//     // Challenge
//     {
//       $lookup: {
//         from: "challenges",
//         let: { challengeId: "$challengeId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: { $in: ["$_id", "$$challengeId"] },
//               isDeleted: false,
//             },
//           },
//           { $project: { name: 1 } },
//         ],
//         as: "challenges",
//       },
//     },
//     {
//       $lookup: {
//         from: "likes",
//         let: { mediaId: "$_id" },
//         pipeline: [
//           {
//             $match: {
//               userId: ObjectId(userId),
//               $expr: { $eq: ["$mediaId", "$$mediaId"] },
//             },
//           },
//           { $project: { status: 1, _id: 0 } },
//         ],
//         as: "likeStatus",
//       },
//     },
//     { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },
//     {
//       $lookup: {
//         from: "followers",
//         let: { followeeId: "$user._id" },
//         pipeline: [
//           {
//             $match: {
//               followerId: ObjectId(userId),
//               $expr: { $eq: ["$followeeId", "$$followeeId"] },
//             },
//           },
//           { $project: { _id: 1 } },
//         ],
//         as: "followStatus",
//       },
//     },
//     { $addFields: { followStatus: { $first: "$followStatus._id" } } },
//     {
//       $project: {
//         createdAt: 1,
//         winnerTitle: 1,
//         updatedAt: 1,
//         name: 1,
//         profession: 1,
//         district: 1,
//         state: 1,
//         country: 1,
//         gender: 1,
//         challenges: 1,
//         user: {
//           name: 1,
//           dob: 1,
//           bio: 1,
//           profession: 1,
//           profileImage: 1,
//           _id: 1,
//           username: 1,
//           type: 1,
//         },
//         description: 1,
//         profileImage: 1,
//         likes0Count: 1,
//         likes1Count: 1,
//         likes2Count: 1,
//         commentsCount: 1,
//         followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
//         likeStatus: { $ifNull: ["$likeStatus", null] },
//         media: [
//           {
//             path: "$video",
//             type: "video",
//           },
//           {
//             path: "$closeUp",
//             type: "closeUp",
//           },
//           {
//             path: "$medium",
//             type: "medium",
//           },
//           {
//             path: "$long",
//             type: "long",
//           },
//           {
//             path: "$pose1",
//             type: "pose1",
//           },
//           {
//             path: "$pose2",
//             type: "pose2",
//           },
//           {
//             path: "$additional",
//             type: "additional",
//           },
//         ],
//       },
//     },
//   ]);
// };

//------------------v2--------------------//

exports.getFameLinksById = (profileId, userId, postId) => {
  return FamelinksDB.aggregate([
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
              dob: 1,
              name: 1,
              profileImage:1,
              profileImageType:1,
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
    //MasterIdMigration
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              name: "$profileFamelinks.name",
              likesCount: { $add: ["$profileFamelinks.likes1Count", "$profileFamelinks.likes2Count"] },
            },
          },
          { $sort: { likesCount: -1 } },
          { $limit: 1 },
        ],
        as: "winnerTitle",
      },
    },
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
        winnerTitle: 1,
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
  ]);
};
//-------------------v2-------------------//

exports.getFameLinksOfficialPosts = (userId, page) => {
  return BrandProductDB.aggregate([
    {
      $match: {
        isDeleted: false,
        isSafe: true,
        isBlocked: false,
        userId: ObjectId(appConfig.famelinks.officialId),
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
    // {
    //     $lookup: {
    //         from: 'challenges',
    //         let: { challengeId: '$challengeId' },
    //         pipeline: [
    //             { $match: {
    //                 $expr: { $in: ['$_id', '$$challengeId'], },
    //                 isDeleted: false
    //             } },
    //             { $project: { name: 1 } }
    //         ],
    //         as: 'challenges'
    //     }
    // },
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
        // challenges: 1,
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        type: "brand",
        buttonName: 1,
        // maleSeen: 1,
        // femaleSeen: 1,
        likes0Count: 1,
        likes1Count: 1,
        likes2Count: 1,
        commentsCount: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: ["$likeStatus", null] },
        media: 1,
        winnerTitles: [],
        tags: 1,
      },
    },
  ])
    .sort({ updatedAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getAdFameLinksOfficialPosts = (userId, page) => {
  return BrandProductDB.aggregate([
    {
      $match: {
        isDeleted: false,
        isSafe: true,
        isBlocked: false,
        userId: ObjectId(appConfig.famelinks.officialId),
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
    // {
    //     $lookup: {
    //         from: 'challenges',
    //         let: { challengeId: '$challengeId' },
    //         pipeline: [
    //             { $match: {
    //                 $expr: { $in: ['$_id', '$$challengeId'] },
    //                 isDeleted: false
    //             } },
    //             { $project: { name: 1 } }
    //         ],
    //         as: 'challenges'
    //     }
    // },
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
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$user._id" },
        pipeline: [
          {
            $match: {
              followerId: ObjectId(userId),
              acceptedDate: { $ne: null },
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              type: "user",
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "followStatus",
      },
    },
    { $addFields: { followStatus: { $first: "$followStatus._id" } } },
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
        gender: 1,
        // challenges: 1,
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        type: "brand",
        typeOf: "Normal Post",
        buttonName: 1,
        // maleSeen: 1,
        // femaleSeen: 1,
        likes0Count: 1,
        likes1Count: 1,
        likes2Count: 1,
        commentsCount: 1,
        followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: ["$likeStatus", null] },
        media: 1,
        winnerTitles: [],
      },
    },
  ])
    .sort({ updatedAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getTodaysPosts = (userId) => {
  const todaysDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  return FamelinksDB.find({ userId, createdAt: { $gte: todaysDate } }).count();
};

exports.getUnseenCount = (userId) => {
  return NotificationDB.find({ userId, isSeen: false }).count();
};

exports.getFameLinksByUserId = (userId, challengeId) => {
  return FamelinksDB.find({ userId: userId, challengeId: challengeId }).lean();
};

exports.getWelcomeVideo = (profileId) => {
  return FamelinksDB.aggregate([
    { $match: { userId: profileId, isWelcomeVideo: { $ne: null } } },
  ]);
};

exports.updateFamelinksPost = (postId, data) => {
  return FamelinksDB.updateOne({ _id: postId }, { $set: data });
};

// const getTodaysTrendzPost = (userId) =>{
//   const todaysDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
//   console.log(todaysDate);
//   return FamelinksDB.aggregate([
//     {
//       $match: {
//         userId: userId,
//         createdAt: { $eq: todaysDate },
//         $or: [{ ambassadorTrendz: true }, { famelinksContest: true }],
//       },
//     },
//   ]);
// };

exports.getTodaysfamelinksContestPost = (userId, famelinksContest) => {
  const todaysDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  return FamelinksDB.find({
    userId,
    createdAt: { $gte: todaysDate },
    famelinksContest: famelinksContest,
  }).count();
};

exports.getTodaysambassadorTrendzPost = (userId, ambassadorTrendz) => {
  const todaysDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  return FamelinksDB.find({
    userId,
    createdAt: { $gte: todaysDate },
    ambassadorTrendz: ambassadorTrendz,
  }).count();
};

exports.getLatestPosts = (date) => {
  return FamelinksDB.find({ createdAt: { $gte: date }, isDeleted: false }).count();
};