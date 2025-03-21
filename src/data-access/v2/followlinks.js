const mongoose = require("mongoose");
const appConfig = require("../../../configs/app.config");
const ObjectId = mongoose.Types.ObjectId;

const FollowlinksDB = require("../../models/v2/followlinks");
const followersDB = require("../../models/v2/followers");

exports.addPost = (data) => {
  return FollowlinksDB.create(data);
};

exports.updatePost = (postId, post) => {
  return FollowlinksDB.updateOne({ _id: postId }, { $set: post });
};

exports.deletePostMedia = (postId, userId, mediaName) => {
  return FollowlinksDB.updateOne(
    { _id: postId, userId },
    {
      $pull: { media: mediaName },
    }
  );
};

//exports.getFollowLinks = (userId, page) => {
//     return FollowlinksDB.aggregate([
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
//         {
//             $lookup: {
//                 from: 'followers',
//                 let: { followeeId: '$user._id' },
//                 pipeline: [
//                     {
//                         $match: {
//                             followerId: ObjectId(userId),
//                             $expr: { $eq: ["$followeeId", "$$followeeId"] }
//                         }
//                     },
//                     { $project: { _id: 1 } }
//                 ],
//                 as: 'followStatus'
//             }
//         },
//         { $addFields: { 'followStatus': { $first: '$followStatus._id' } } },
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
//             followStatus: { $ifNull: [{ $toBool: '$followStatus' }, false] },
//             likesCount: 1,
//             commentsCount: 1,
//             likeStatus: { $ifNull: ['$likeStatus', null] },
//             media: 1,
//         } }
//     ]).sort({ updatedAt: 'desc' }).skip((page - 1) * 10).limit(10);
// };

//exports.getFunLinks = (user, page) => {
// //     return MediaDB.aggregate([
// //         { $match: { type: 'funlink' } },
// //         {
// //             $lookup: {
// //                 from: 'comments',
// //                 let: { mediaId: "$_id" },
// //                 pipeline: [
// //                     {
// //                         $match: {
// //                             $expr: {
// //                                 $eq: ["$mediaId", "$$mediaId"]
// //                             }
// //                         },
// //                     },
// //                     { $count: 'comments' }
// //                 ],
// //                 as: 'commentsCount'
// //             }
// //         },
// //         { $unwind: { path: '$commentsCount', preserveNullAndEmptyArrays: true } },
// //         { $addFields: { commentsCount: '$commentsCount.comments'} },
// //         {
// //             $lookup: {
// //                 from: 'likes',
// //                 let: { mediaId: "$_id" },
// //                 pipeline: [
// //                     {
// //                         $match: {
// //                             $expr: {
// //                                 $eq: ["$mediaId", "$$mediaId"]
// //                             }
// //                         },
// //                     },
// //                     { $count: 'likes' }
// //                 ],
// //                 as: 'likesCount'
// //             }
// //         },
// //         { $unwind: { path: '$likesCount', preserveNullAndEmptyArrays: true } },
// //         { $addFields: { likesCount: '$likesCount.likes'} },
// //         {
// //             $lookup: {
// //                 from: 'likes',
// //                 let: { mediaId: '$_id' },
// //                 pipeline: [
// //                     {
// //                         $match: {
// //                             userId: user._id,
// //                             $expr: {
// //                                 $eq: ["$mediaId", "$$mediaId"]
// //                             }
// //                         }
// //                     },
// //                     { $project: { status: 1, _id: 0 } }
// //                 ],
// //                 as: 'likeStatus'
// //             }
// //         },
// //         { $unwind: { path: '$likeStatus', preserveNullAndEmptyArrays: true } },
// //         { $addFields: { 'likeStatus': '$likeStatus.type' } },
// //         {
// //             $lookup: {
// //                 from: 'users',
// //                 let: { userId: "$userId" },
// //                 pipeline: [{
// //                     $match: {
// //                         $expr: {
// //                             $eq: ["$_id", "$$userId"]
// //                         }
// //                     }
// //                 }],
// //                 as: 'user'
// //             }
// //         },
// //         { $unwind: { path: '$user' } },
// //         { $project: {
// //             _id: 1,
// //             maleSeen: 1,
// //             femaleSeen: 1,
// //             challengeId: 1,
// //             path: 1,
// //             createdAt: 1,
// //             updatedAt: 1,
// //             commentsCount: 1,
// //             likesCount: 1,
// //             likeStatus: 1,
// //             user: {
// //                 _id: 1,
// //                 name: 1,
// //                 profession: 1,
// //                 district: 1,
// //                 state: 1,
// //                 country: 1,
// //                 gender: 1,
// //                 profileImage: null,
// //             }
// //         } }
// //     ]).sort({ updatedAt: 'desc' }).skip((page - 1) * 10).limit(10);
// // };

// // exports.getMyFunLinks = (userId, page) => {
// //     return MediaDB.aggregate([
// //         { $match: { type: 'funlink', userId: ObjectId(userId) } },
// //         {
// //             $lookup: {
// //                 from: 'comments',
// //                 let: { mediaId: "$_id" },
// //                 pipeline: [
// //                     {
// //                         $match: {
// //                             $expr: {
// //                                 $eq: ["$mediaId", "$$mediaId"]
// //                             }
// //                         },
// //                     },
// //                     { $count: 'comments' }
// //                 ],
// //                 as: 'commentsCount'
// //             }
// //         },
// //         { $unwind: { path: '$commentsCount', preserveNullAndEmptyArrays: true } },
// //         { $addFields: { commentsCount: '$commentsCount.comments'} },
// //         {
// //             $lookup: {
// //                 from: 'likes',
// //                 let: { mediaId: "$_id" },
// //                 pipeline: [
// //                     {
// //                         $match: {
// //                             $expr: {
// //                                 $eq: ["$mediaId", "$$mediaId"]
// //                             }
// //                         },
// //                     },
// //                     { $count: 'likes' }
// //                 ],
// //                 as: 'likesCount'
// //             }
// //         },
// //         { $unwind: { path: '$likesCount', preserveNullAndEmptyArrays: true } },
// //         { $addFields: { likesCount: '$likesCount.likes'} }
// //     ]).sort({ updatedAt: 'desc' }).skip((page -1) * 10).limit(10);
// // };

exports.getMyFollowLinks = (
  profileId,
  page,
  selfProfileId,
  selfMasterId,
  filterObj,
  sortObj
) => {
  return FollowlinksDB.aggregate([
    { $match: { ...filterObj, isWelcomeVideo: { $exists: false } } },
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
              userId: selfProfileId,
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
              { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
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
      $lookup: {
        from: "agencytags",
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$postId", "$$postId"] },
              status: "accepted"
            },
          },
          {
            $project: {
              receiverId: 1,
              _id: 0,
            },
          },
          {
            $lookup: {
              from: "users",
              let: { userId: "$receiverId" },
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
                    _id: 1,
                    username: 1,
                    name: 1,
                  },
                },
              ],
              as: "User",
            },
          },
          {
            $addFields: {
              User: { $first: "$User" },
            },
          },
          {
            $project: {
              receiverId: 0,
            },
          },
        ],
        as: "tag",
      },
    },
    { $addFields: { tag: "$tag.User" } },
    {
      $lookup: {
        from: "channels",
        let: { channelId: "$channelId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$channelId"] },
              isDeleted: false,
            },
          },
          { $project: { name: 1 } },
        ],
        as: "channels",
      },
    },
    { $addFields: { channels: { $first: "$channels" } } },
    {
      $lookup: {
        from: "brandproducts",
        let: { value: "$productId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$value"] },
              isDeleted: false,
            },
          },
          { $project: { hashTag: 1 } },
        ],
        as: "product",
      },
    },
    { $addFields: { product: { $first: "$product" } } },
    {
      $project: {
        channels: 1,
        product: 1,
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
        viewCount: { $size: '$reachIds' },
        commentsCount: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        likeStatus: { $ifNull: ["$likeStatus", null] },
        tag: { $ifNull: ["$tag", null] },
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
      },
    },
    {
      $sort: { ...sortObj },
    }
  ])
    // .sort({ createdAt: 1 })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getFollowLinks = (followLinksId, userId, page, filterObj) => {
  return (
    FollowlinksDB.aggregate([
      { $match: { isWelcomeVideo: { $exists: false } } },
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
        $lookup: {
          from: "channels",
          let: { channelId: "$channelId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$channelId"] },
                isDeleted: false,
              },
            },
            { $project: { name: 1 } },
          ],
          as: "channels",
        },
      },
      { $addFields: { channels: { $first: "$channels" } } },
      {
        $match: {
          isDeleted: false,
          isSafe: true,
          isBlocked: false,
          userId: { $ne: ObjectId(appConfig.famelinks.officialId) },
          $expr: { $not: [{ $in: ["$userId", "$blockedUserIds"] }] },
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
                userId: ObjectId(followLinksId),
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
                { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
                { case: { $eq: ["$followStatus", 2] }, then: "Following" },
              ],
              default: "Follow",
            },
          },
        },
      },
      {
        $lookup: {
          from: "agencytags",
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$postId", "$$postId"] },
                status: "accepted"
              },
            },
            {
              $project: {
                receiverId: 1,
                _id: 0,
              },
            },
            {
              $lookup: {
                from: "users",
                let: { userId: "$receiverId" },
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
                      _id: 1,
                      username: 1,
                      name: 1,
                    },
                  },
                ],
                as: "User",
              },
            },
            {
              $addFields: {
                User: { $first: "$User" },
              },
            },
            {
              $project: {
                receiverId: 0,
              },
            },
          ],
          as: "tag",
        },
      },
      { $addFields: { tag: "$tag.User" } },
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
        $lookup: {
          from: "brandproducts",
          let: { value: "$productId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$value"] },
                isDeleted: false,
              },
            },
            { $project: { hashTag: 1 } },
          ],
          as: "product",
        },
      },
      { $addFields: { product: { $first: "$product" } } },
      {
        $project: {
          createdAt: 1,
          updatedAt: 1,
          name: 1,
          profession: 1,
          location: { $first: "$location" },
          gender: 1,
          challenges: 1,
          channels: 1,
          product: 1,
          user: 1,
          description: 1,
          profileImage: 1,
          profileImageType: 1,
          likesCount: 1,
          commentsCount: 1,
          followStatus: 1,
          // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
          isWelcomeVideo: {
            $cond: [{ $ifNull: ["$isWelcomeVideo", false] }, 1, 0],
          },
          likeStatus: { $ifNull: ["$likeStatus", null] },
          type: "followlinks",
          tag: { $ifNull: ["$tag", null] },
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
      {
        $match: {
          $or: [
            { followStatus: "Following" },
            { $expr: { $eq: ["$user._id", userId] } },
          ],
        },
      },
      { $sort: { isWelcomeVideo: -1, createdAt: -1 } },
    ])
      .skip((page - 1) * 12)
      .limit(12)
  );
};

exports.getOnePost = (postId) => {
  return FollowlinksDB.findOne({ _id: postId }).lean();
};

//exports.getUserMediaById = (mediaId, userId) => {
// //     return MediaDB.findOne({ _id: mediaId, userId });
// // };

//exports.getMyChallenges = (userId, page) => {
// //     return MediaDB.aggregate([
// //         { $match: { userId: ObjectId(userId) } },
// //         {
// //             $lookup: {
// //                 from: 'comments',
// //                 let: { mediaId: "$_id" },
// //                 pipeline: [
// //                     { $match: { $expr: { $eq: ["$mediaId", "$$mediaId"] } } },
// //                     { $count: 'comments' }
// //                 ],
// //                 as: 'commentsCount'
// //             }
// //         },
// //         { $addFields: { commentsCount: { $first: '$commentsCount.comments' } } },
// //         {
// //             $lookup: {
// //                 from: 'likes',
// //                 let: { mediaId: "$_id" },
// //                 pipeline: [
// //                     { $match: { $expr: { $eq: ["$mediaId", "$$mediaId"] } } },
// //                     { $group: { _id: null, likes: { $sum: { $divide: ['$status', 2] } } } }
// //                 ],
// //                 as: 'likesCount'
// //             }
// //         },
// //         { $addFields: { likesCount: { $first: '$likesCount.likes' } } },
// //         {
// //             $lookup: {
// //                 from: 'likes',
// //                 let: { mediaId: '$_id' },
// //                 pipeline: [
// //                     {
// //                         $match: {
// //                             userId: ObjectId(userId),
// //                             $expr: { $eq: ["$mediaId", "$$mediaId"] }
// //                         }
// //                     },
// //                     { $project: { status: 1, _id: 0 } }
// //                 ],
// //                 as: 'likeStatus'
// //             }
// //         },
// //         { $addFields: { 'likeStatus': { $first: '$likeStatus.status' } } },
// //         {
// //             $lookup: {
// //                 from: 'users',
// //                 let: { userId: '$userId'},
// //                 pipeline: [
// //                     { $match: { $expr: { $eq: ["$$userId", "$_id"] } } },
// //                     {
// //                         $project: {
// //                             name: 1,
// //                             profession: 1,
// //                             district: 1,
// //                             state: 1,
// //                             country: 1,
// //                             gender: 1,
// //                             profileImage: 1
// //                         }
// //                     }
// //                 ],
// //                 as: 'user'
// //             }
// //         },
// //         { $addFields: { user: { $first: '$user' } } },
// //         {
// //             $lookup: {
// //                 from: 'challenges',
// //                 let: { challengeId: '$challengeId' },
// //                 pipeline: [
// //                     { $match: { $expr: { $eq: ['$$challengeId', '$_id'] } } },
// //                     { $project: { name: 1, _id: 0 } }
// //                 ],
// //                 as: 'challenge'
// //             }
// //         },
// //         { $addFields: { challengeName: { $first: '$challenge.name' } } },
// //         { $project: {
// //             _id: 1,
// //             path: 1,
// //             user: 1,
// //             maleSeen: 1,
// //             femaleSeen: 1,
// //             district: 1,
// //             state: 1,
// //             country: 1,
// //             description: 1,
// //             challengeId: 1,
// //             createdAt: 1,
// //             updatedAt: 1,
// //             challengeName: 1,
// //             likeStatus: { $ifNull: ['$likeStatus', null] },
// //             likesCount: { $ifNull: ['$likesCount', 0] },
// //             commentsCount: { $ifNull: ['$commentsCount', 0] }
// //         } }
// //     ]).sort({ updatedAt: 'desc' }).skip((page -1) * 10).limit(10);
// // };

exports.updatePostLikeCounter = (postId, obj) => {
  return FollowlinksDB.updateOne({ _id: postId }, { $inc: obj });
};

exports.updatePostCommentCounter = (postId, incBy) => {
  return FollowlinksDB.updateOne(
    { _id: postId },
    { $inc: { commentsCount: incBy } }
  );
};

exports.deletePost = (postId, userId) => {
  return FollowlinksDB.findOneAndDelete({ _id: postId, userId });
};

//exports.updatePostMedia = (postId, userId, post) => {
//     return FollowlinksDB.updateOne({ _id: postId, userId }, {
//         $set: { ...post }
//     });
// };

exports.getChallengeParticipantsCount = (challengeId) => {
  return FollowlinksDB.find({
    challengeId: { $in: [ObjectId(challengeId)] },
  }).count();
};

//exports.getUserMostLikedPost = (userId) => {
//     return FollowlinksDB.aggregate()
//         .match({ userId })
//         .addFields({ likesCount: { $add: ['$likes1Count', '$likes2Count'] } })
//         .sort({ likesCount: 'desc' })
//         .limit(1);
// };

exports.getFollowLinksById = (profileId, userId, postId) => {
  return FollowlinksDB.aggregate([
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
          { $project: { hashTag: 1 } },
        ],
        as: "challenges",
      },
    },
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
        as: "fametrendzs",
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
              { case: { $eq: ["$followStatus", 1] }, then: "Requested" },
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
        media: 1,
        winnerTitles: [],
        tags: 1,
      },
    },
  ]);
};

exports.getWelcomeVideo = (profileId) => {
  return FollowlinksDB.aggregate([
    { $match: { userId: profileId, isWelcomeVideo: { $ne: null } } },
  ]);
};

exports.searchFollowlinksById = (postId) => {
  return FollowlinksDB.find({ _id: postId }).lean();
};

exports.updatePostFollowlinks = (postId, post) => {
  return FollowlinksDB.updateOne({ _id: postId }, { $set: post });
};

exports.updateViews = (mediaId, userId) => {
  return FollowlinksDB.updateOne({ _id: mediaId }, { $push: { reachIds: userId } });
};

//MasterIdMigration
exports.getWelcomeVideoFollowees = (followerId, page) => {
  let pagination = page ? page : 1;
  return followersDB.aggregate([
    {
      $match: {
        $and: [{ followerId }, { acceptedDate: { $ne: null } }],
      },
    },
    { $project: { _id: 0, followeeId: 1 } },
    {
      $lookup: {
        from: "users",
        let: { userId: "$followeeId" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$_id", "$$userId"] } },
                { isDeleted: false },
                { isSuspended: false },
                { isSafe: true },
              ],
            },
          },
          {
            $lookup: {
              from: "followlinks",
              let: { userId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$userId", "$$userId"] } },
                      { isWelcomeVideo: true },
                    ],
                  },
                },
                { $project: { media: 1 } },
              ],
              as: "welcomeVideo",
            },
          },
          {
            $group: {
              _id: { $first: "$welcomeVideo._id" },
              media: { $first: { $first: { $first: "$welcomeVideo.media" } } },
              name: { $first: { $first: "$profileFollowlinks.name" } },
            },
          },
        ],
        as: "followee",
      },
    },
    { $addFields: { followee: { $first: "$followee" } } },
    { $match: { followee: { $exists: true } } },
    { $match: { $expr: { $ne: ["$followee._id", null] } } },
    { $addFields: { welcomeVideo: "$followee" } },
    { $project: { followeeId: 1, welcomeVideo: 1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.getTodaysOfferPosts = (userId) => {
  const todaysDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  return FollowlinksDB.find({
    userId,
    createdAt: { $gte: todaysDate },
    offerId: { $ne: null },
  }).count();
};

exports.getLatestPosts = (date) => {
  return FollowlinksDB.find({
    createdAt: { $gte: date },
    isDeleted: false,
  }).count();
};