const mongoose = require("mongoose");

const UserDB = require("../../models/v2/users");
const recognitionDB = require("../../models/v2/recognitions");
const FollowerDB = require("../../models/v2/followers");
const UnFollowDB = require("../../models/v2/unfollows");
const ReportDB = require("../../models/v2/reports");
const FeedbackDB = require("../../models/v2/feedback");
const NotificationDB = require("../../models/v2/notifications");
const FameCoinsDB = require("../../models/v2/fameCoins");
const RecommendationDB = require("../../models/v2/recommendations");
const SettingsDB = require("../../models/v2/settings");
const DatasDB = require("../../models/v2/datas");
const profileStorelinks = require("../../models/v2/profileStorelinks");
const profileCollablinks = require("../../models/v2/profileCollablinks");
const profileJoblinks = require("../../models/v2/profileJoblinks");
const VisitDB = require("../../models/v2/visits");
const brandProductDB = require("../../models/v2/brandProducts");
const hiringprofile = require("../../models/v2/hiringProfiles");
const invitationsDB = require("../../models/v2/invitations");
const agencyTags = require("../../models/v2/agencyTags");
const WinnerDB = require("../../models/v2/winners");
const locatnsDB = require("../../models/v2/locatns");
const ObjectId = mongoose.Types.ObjectId;

exports.findUserByMobileNumber = (mobileNumber) => {
  return UserDB.findOne({ mobileNumber }).lean();
};

exports.findUserByReferralCode = (referralCode) => {
  return UserDB.findOne({ referralCode }).lean();
};

exports.insertUser = (data) => {
  return UserDB.create(data);
};

exports.insertRecognition = (userId, video) => {
  return recognitionDB.updateOne(
    { userId: userId },
    { $set: { userId: userId, video: video } },
    { upsert: true }
  );
};

exports.findUserByEmail = (email) => {
  return UserDB.findOne({ email }).lean();
};

exports.updateUser = (userId, data) => {
  if (data.location) {
    data.location = ObjectId.createFromHexString(data.location);
  }
  return UserDB.updateOne({ _id: userId }, [
    {
      $addFields: { ...data },
    },
  ]);
};

exports.findAndUpdateUser = (userId, data) => {
  return UserDB.findOneAndUpdate(
    { _id: userId },
    [
      {
        $addFields: { ...data },
      },
    ],
    { returnDocument: "after" }
  );
};

exports.updateSetting = (id, data) => {
  return UserDB.updateOne({ _id: id }, [
    {
      $set: data,
    },
  ]);
};

exports.updatePrivacy = (userId, action) => {
  return UserDB.updateOne({ _id: userId }, [
    {
      $set: { profile_type: action },
    },
  ]);
};

exports.findByAppleId = (appleId) => {
  return UserDB.findOne({ appleId: appleId }).lean();
};

exports.getUserById = (id) => {
  return UserDB.findOne({ _id: id }, { _id: 1 }).lean();
};

exports.blockUser = (userId, blockUserId) => {
  return UserDB.updateOne(
    { _id: userId },
    {
      $push: { blockList: blockUserId },
    }
  );
};

exports.unblockUser = (userId, blockUserId) => {
  return UserDB.updateOne(
    { _id: userId },
    {
      $pull: { blockList: blockUserId },
    }
  );
};

exports.restrictUser = (userId, restrictUserId) => {
  return UserDB.updateOne(
    { _id: userId },
    {
      $push: { restrictedList: restrictUserId },
    }
  );
};

exports.unrestrictUser = (userId, restrictUserId) => {
  return UserDB.updateOne(
    { _id: userId },
    {
      $pull: { restrictedList: restrictUserId },
    }
  );
};

// exports.updateUserLikeCommentsCount = (userId, likes1Count, likes2Count) => {
//     return UserDB.updateOne({ _id: userId }, { $inc: { likes1Count, likes2Count } });
// };

//-----------------------------v2----------------------------------//

//MasterIdMigration
exports.updateUserLikeCommentsCount = (userId, likes1Count, likes2Count) => {
  return UserDB.updateOne(
    { _id: userId },
    { $inc: { "profileFamelinks.likes1Count": likes1Count, "profileFamelinks.likes2Count": likes2Count } }
  );
};
//-----------------------------v2----------------------------------//

exports.getOneUser = (userId) => {
  return UserDB.findOne(
    { _id: userId },
    {
      _id: 1,
      name: 1,
      bio: 1,
      profession: 1,
      location: 1,
      gender: 1,
      profileImage: 1,
      dob: 1,
      ageGroup: 1,
      mobileNumber: 1,
      email: 1,
      type: 1,
      followingCount: 1,
      followersCount: 1,
      username: { $ifNull: ["$username", null] },
      // likesCount: { $add: ['$likes1Count', '$likes2Count'] },
      pushToken: 1,
      referralCode: 1,
      referredBy: 1,
      settings: 1,
      blockList: 1,
      fameCoins: 1,
      brand: 1,
      agency: 1,
      verificationStatus: 1,
      verificationDoc: 1,
      winnerTitles: [],
      runnerUp: [],
      level: "india",
      score: { $add: [0, 0] },
      isRegistered: 1,
      isVerified: 1,
      isBlocked: 1,
      isDeleted: 1,
      thanksGifted: { $add: [23000, 0] },
      thanksBalance: { $add: [3000, 0] },
      isFirstLogin: 1,
      profileFamelinks: {
        name: '$profileFamelinks.name',
        profileImage: '$profileFamelinks.profileImage',
        profileImageType: '$profileFamelinks.profileImageType',
      },
      profileFunlinks: {
        name: '$profileFunlinks.name',
        profileImage: '$profileFunlinks.profileImage',
        profileImageType: '$profileFunlinks.profileImageType',
      },
      profileFollowlinks: {
        name: '$profileFollowlinks.name',
        profileImage: '$profileFollowlinks.profileImage',
        profileImageType: '$profileFollowlinks.profileImageType',
      },
      profileJoblinks: {
        name: '$profileJoblinks.name',
        profileImage: '$profileJoblinks.profileImage',
        profileImageType: '$profileJoblinks.profileImageType',
        savedJobs: 1,
        savedTalents: 1,
      },
      profileStorelinks: {
        name: '$profileStorelinks.name',
        profileImage: '$profileStorelinks.profileImage',
        profileImageType: '$profileStorelinks.profileImageType',
      },
      profileCollablinks: {
        name: '$profileCollablinks.name',
        profileImage: '$profileCollablinks.profileImage',
        profileImageType: '$profileCollablinks.profileImageType',
      },
      profileImageType: 1,
      deleteDate: 1,
      isSuspended: 1,
      profile_type: 1,
      isSeenContest: 1,
    }
  ).lean();
};

exports.getUserByTag = (tag) => {
  return UserDB.findOne(
    { _id: tag },
    { _id: 1, profileImage: 1, pushToken: 1 }
  ).lean();
};

exports.getUserProfileImages = (userId) => {
  return UserDB.aggregate([
    { $match: { _id: userId } },

    {
      $set: {
        avatarImage: {
          $cond: {
            if: { $eq: [null, "$avatarImage"] },
            then: null,
            else: { $concat: ["$avatarImage", "-", "xs"] },
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
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        bio: 1,
        profession: 1,
        location: { $first: "$location" },
        gender: 1,
        profileImage: 1,
        dob: 1,
        ageGroup: 1,
        mobileNumber: 1,
        email: 1,
        type: 1,
        followingCount: 1,
        followersCount: 1,
        username: { $ifNull: ["$username", null] },
        pushToken: 1,
        referralCode: 1,
        referredBy: 1,
        settings: 1,
        blockList: 1,
        fameCoins: 1,
        brand: 1,
        agency: 1,
        verificationStatus: 1,
        verificationDoc: 1,
        winnerTitles: [],
        runnerUp: [],
        level: "india",
        score: { $add: [0, 0] },
        isRegistered: 1,
        isVerified: 1,
        isBlocked: 1,
        thanksGifted: { $add: [23000, 0] },
        thanksBalance: { $add: [3000, 0] },
        isFirstLogin: 1,
        profileFamelinks: {
          profileImage: "$profileFamelinks.profileImage",
          profileImageType: "$profileFamelinks.profileImageType",
        },
        profileFunlinks: {
          profileImage: "$profileFunlinks.profileImage",
          profileImageType: "$profileFunlinks.profileImageType",
        },
        profileFollowlinks: {
          profileImage: "$profileFollowlinks.profileImage",
          profileImageType: "$profileFollowlinks.profileImageType",
        },
        profileJoblinks: {
          profileImage: "$profileJoblinks.profileImage",
          profileImageType: "$profileJoblinks.profileImageType",
        },
        profileStorelinks: {
          profileImage: "$profileCollablinks.profileImage",
          profileImageType: "$profileCollablinks.profileImageType",
        },
        profileCollablinks: {
          profileImage: "$profileCollablinks.profileImage",
          profileImageType: "$profileCollablinks.profileImageType",
        },
        profileImageType: 1,
      },
    },
  ]);
};

// exports.getOneUserWithContest = (userId) => {
//     return UserDB.aggregate([
//         { $match: { _id: ObjectId(userId) } },
//         {
//             $lookup: {
//                 from: 'media',
//                 localField: 'contest.closeUp',
//                 foreignField: '_id',
//                 as: 'contest.closeUp'
//             }
//         },
//         { $unwind: { path: '$contest.closeUp', preserveNullAndEmptyArrays: true } },
//         {
//             $lookup: {
//                 from: 'media',
//                 localField: 'contest.medium',
//                 foreignField: '_id',
//                 as: 'contest.medium'
//             }
//         },
//         { $unwind: { path: '$contest.medium', preserveNullAndEmptyArrays: true } },
//         {
//             $lookup: {
//                 from: 'media',
//                 localField: 'contest.long',
//                 foreignField: '_id',
//                 as: 'contest.long'
//             }
//         },
//         { $unwind: { path: '$contest.long', preserveNullAndEmptyArrays: true } },
//         {
//             $lookup: {
//                 from: 'media',
//                 localField: 'contest.pose1',
//                 foreignField: '_id',
//                 as: 'contest.pose1'
//             }
//         },
//         { $unwind: { path: '$contest.pose1', preserveNullAndEmptyArrays: true } },
//         {
//             $lookup: {
//                 from: 'media',
//                 localField: 'contest.pose2',
//                 foreignField: '_id',
//                 as: 'contest.pose2'
//             }
//         },
//         { $unwind: { path: '$contest.pose2', preserveNullAndEmptyArrays: true } },
//         {
//             $lookup: {
//                 from: 'media',
//                 localField: 'contest.additional',
//                 foreignField: '_id',
//                 as: 'contest.additional'
//             }
//         },
//         { $unwind: { path: '$contest.additional', preserveNullAndEmptyArrays: true } },
//         {
//             $lookup: {
//                 from: 'media',
//                 localField: 'contest.video',
//                 foreignField: '_id',
//                 as: 'contest.video'
//             }
//         },
//         { $unwind: { path: '$contest.video', preserveNullAndEmptyArrays: true } }
//     ]);
// };

exports.followUser = (followerId, followeeId, acceptedDate, type, postId) => {
  return FollowerDB.updateOne(
    {
      followerId,
      followeeId,
    },
    {
      followerId,
      followeeId,
      acceptedDate,
      acceptedDate,
      type,
      postId,
    },
    {
      upsert: true,
    }
  );
};

exports.unfollowUser = async (followerId, followeeId, type, postId) => {
  await UnFollowDB.updateOne(
    {
      followerId,
      followeeId,
    },
    {
      followerId,
      followeeId,
      type,
      postId,
    },
    {
      upsert: true,
    }
  )
  return FollowerDB.deleteOne({
    followerId,
    followeeId,
    type,
  });
};

exports.getFollowers = (userId, page, selfUserId) => {
  return FollowerDB.aggregate([
    { $match: { followeeId: ObjectId(userId), acceptedDate: { $ne: null }, type: 'user' } },
    {
      $lookup: {
        from: "users",
        let: { followerId: "$followerId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$followerId"] },
              // isDeleted: false,
              // isSuspended: false,
            },
          },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$location" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                { $project: { type: 1, value: 1 } },
              ],
              as: "location",
            },
          },
          {
            $project: {
              type: 1,
              name: 1,
              username: 1,
              profileImage: 1,
              profileImageType: 1,
              location: { $first: "$location" },
              //MasterIdMigration
              profile: {
                name: "$profileFollowlinks.name",
                profileImage: "$profileFollowlinks.profileImage",
                profileImageType: "$profileFollowlinks.profileImageType",
              }
            },
          },
        ],
        as: "masterUser",
      },
    },
    { $addFields: { masterUser: { $first: "$masterUser" } } },
    { $addFields: { followStatus: 0 } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$followerId" },
        pipeline: [
          {
            $match: {
              followerId: selfUserId,
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
        let: { followeeId: "$followerId" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: selfUserId,
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
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        followStatus: 1,
        masterUser: 1,
      },
    },
  ])
    .skip((page - 1) * 15)
    .limit(15);
};

exports.getFollowees = (userId, page, selfUserId) => {
  return FollowerDB.aggregate([
    { $match: { followerId: ObjectId(userId), acceptedDate: { $ne: null }, type: 'user' } },
    { $addFields: { followStatus: 0 } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$followeeId" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: selfUserId,
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
        let: { followeeId: "$followeeId" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: selfUserId,
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
        from: "users",
        let: { followeeId: "$followeeId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$followeeId"] },
              // isDeleted: false,
              // isSuspended: false,
            },
          },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$location" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                { $project: { type: 1, value: 1 } },
              ],
              as: "location",
            },
          },
          {
            $project: {
              type: 1,
              name: 1,
              username: 1,
              profileImage: 1,
              profileImageType: 1,
              location: { $first: "$location" },
              //MasterIdMigration
              profile: {
                name: "$profileFollowlinks.name",
                profileImage: "$profileFollowlinks.profileImage",
                profileImageType: "$profileFollowlinks.profileImageType",
              },
            },
          },
        ],
        as: "masterUser",
      },
    },
    { $addFields: { masterUser: { $first: "$masterUser" } } },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        followStatus: 1,
        masterUser: 1,
      },
    },
  ])
    .skip((page - 1) * 15)
    .limit(15);
};

exports.submitReport = (userId, data) => {
  return ReportDB.create({ userId, ...data });
};

exports.submitFeedback = (userId, body) => {
  return FeedbackDB.create({ userId, body });
};

exports.getFollowSuggestions = (userId, page) => {
  return UserDB.aggregate([
    {
      $match: {
        isDeleted: false,
        isSuspended: false,
        isRegistered: true,
        _id: { $ne: ObjectId(userId) },
      },
    },
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
                { followerId: ObjectId(userId) },
                { type: "user" },
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
        from: "followers",
        let: { followeeId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$followeeId", "$$followeeId"] } },
                { acceptedDate: { $ne: null } },
                { type: "user" },
              ],
            },
          },
          { $project: { _id: 0, followerId: 1 } },
          {
            $lookup: {
              from: "users",
              let: { followerId: "$followerId" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$followerId"] },
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
                      { $project: { type: 1, value: 1 } },
                    ],
                    as: "location",
                  },
                },
                {
                  $project: {
                    type: 1,
                    name: 1,
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    location: { $first: "$location" },
                    //MasterIdMigration
                    profile: {
                      name: "$profileFollowlinks.name",
                      profileImage: "$profileFollowlinks.profileImage",
                      profileImageType: "$profileFollowlinks.profileImageType",
                    }
                  },
                },
              ],
              as: "masterUser",
            },
          },
          { $addFields: { masterUser: { $first: "$masterUser" } } },
        ],
        as: "followedBy",
      },
    },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        type: 1,
        name: 1,
        username: 1,
        profileImage: 1,
        profileImageType: 1,
        location: { $first: "$location" },
        followedBy: 1,
        //MasterIdMigration
        profile: {
          name: "$profileFollowlinks.name",
          profileImage: "$profileFollowlinks.profileImage",
          profileImageType: "$profileFollowlinks.profileImageType",
        },
        followStatus: 1,
      },
    },
    { $skip: (page - 1) * 15 },
    { $limit: 15 },
  ]);
};

// exports.getFollowSuggestions = (userId, page) => {
//   return FollowerDB.aggregate([
//     { $match: { followeeId: { $ne: ObjectId(userId) } } },
//     { $project: { followeeId: 1, followerId: 1, _id: 0 } },
//     // {
//     //     $lookup: {
//     //         from: 'followers',
//     //         let: { followeeId: '$followeeId', followerId: '$followerId' },
//     //         pipeline: [
//     //             {
//     //                 $match: {
//     //                     $expr: {
//     //                         $and: [
//     //                             { $eq: ['$followerId', '$$followeeId'] },
//     //                             { $ne: ['$followeeId', '$$followerId'] }
//     //                         ]
//     //                     }
//     //                 }
//     //             },
//     //             { $project: { followeeId: 1, _id: 0 } }
//     //         ],
//     //         as: 'suggested'
//     //     }
//     // },
//     // { $unwind: { path: '$suggested', preserveNullAndEmptyArrays: false } },
//     { $group: { _id: "$followeeId" } },
//     {
//       $lookup: {
//         from: "users",
//         let: { userId: "$_id" },
//         pipeline: [
//           { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
//           {
//             $project: {
//               name: 1,
//               updatedAt: 1,
//               profileImage: 1,
//               profileImageType: 1,
//               district: 1,
//               state: 1,
//               country: 1,
//               type: 1,
//               username: 1,
//             },
//           },
//         ],
//         as: "user",
//       },
//     },
//     { $addFields: { _id: { $first: "$user._id" } } },
//     { $addFields: { name: { $first: "$user.name" } } },
//     { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
//     { $sort: { "user.updatedAt": -1 } },
//     {
//       $project: {
//         _id: "$user._id",
//         name: "$user.name",
//         profileImage: "$user.profileImage",
//         profileImageType: "$user.profileImageType",
//         district: "$user.district",
//         state: "$user.state",
//         country: "$user.country",
//         type: "$user.type",
//       },
//     },
//     {
//       $lookup: {
//         from: "followers",
//         let: { followerId: "$_id" },
//         pipeline: [
//           { $match: { $expr: { $eq: ["$followerId", "$$followerId"] } } },
//           { $project: { followeeId: 1 } },
//           {
//             $lookup: {
//               from: "users",
//               let: { followeeId: "$followeeId" },
//               pipeline: [
//                 { $match: { $expr: { $eq: ["$_id", "$$followeeId"] } } },
//                 {
//                   $project: {
//                     name: 1,
//                   },
//                 },
//               ],
//               as: "user",
//             },
//           },
//           {
//             $addFields: {
//               _id: { $first: "$user._id" },
//               name: { $first: "$user.name" },
//             },
//           },
//           {
//             $group: {
//               _id: "$followeeId",
//               name: { $first: "$name" },
//             },
//           },
//         ],
//         as: "followeedBy",
//       },
//     },
//     {
//       $set: {
//         profileImageType: {
//           $cond: [
//             { $ifNull: ["$profileImageType", false] },
//             "$profileImageType",
//             "",
//           ],
//         },
//       },
//     },
//   ])
//     .skip((page - 1) * 10)
//     .limit(10);
// };

exports.getUserFollowStatus = (followerId, followeeId) => {
  return FollowerDB.findOne({ followerId, followeeId }).lean();
};

exports.updateFollowersCount = (userId, incBy) => {
  return UserDB.updateOne({ _id: userId }, { $inc: { followersCount: incBy } });
};

exports.updateFollowingCount = (userId, incBy) => {
  return UserDB.updateOne({ _id: userId }, { $inc: { followingCount: incBy } });
};

exports.updateUserLikesCount = (userId, obj) => {
  return UserDB.updateOne({ _id: userId }, { $inc: obj });
};

exports.getContestants = (search, page) => {
  return UserDB.aggregate([
    {
      $lookup: {
        from: "famelinks",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              isDeleted: false,
              isSafe: true,
              isBlocked: false,
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "famelinksPost",
      },
    },
    { $match: { $expr: { $ne: [0, { $size: "$famelinksPost" }] } } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        name: 1,
        location: { $first: "$location" },
        gender: 1,
        ageGroup: 1,
        profileImage: 1,
        profileImageType: 1,
        type: 1,
        profile: {
          name: "$profileFamelinks.name",
          profileImage: "$profileFamelinks.profileImage",
          profileImageType: "$profileFamelinks.profileImageType",
        }
      },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
  ]);
  //   name: 1,
  //   district: 1,
  //   state: 1,
  //   country: 1,
  //   continent: 1,
  //   gender: 1,
  //   ageGroup: 1,
  //   profileImage: 1,
  //   profileImageType: 1,
  //   type: 1,
  //   profileFamelinks: 1,
  //   profileStorelinks: 1,
  //   profileCollablinks: 1,
  // })
  //   .sort({ createdAt: "desc" })
  //   .lean()
  //   .skip((page - 1) * 10)
  //   .limit(10);
};

exports.getSearchContestants = (search, page) => {
  return UserDB.aggregate([
    {
      $match:
      {
        $or: [
          { name: { $regex: `^.*?${search}.*?$` } },
          { username: { $regex: `^.*?${search}.*?$` } },
        ]
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              isDeleted: false,
              isSafe: true,
              isBlocked: false,
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "famelinksPost",
      },
    },
    { $match: { $expr: { $ne: [0, { $size: "$famelinksPost" }] } } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        name: 1,
        location: { $first: "$location" },
        gender: 1,
        ageGroup: 1,
        profileImage: 1,
        profileImageType: 1,
        type: 1,
        profile: {
          name: "$profileFamelinks.name",
          profileImage: "$profileFamelinks.profileImage",
          profileImageType: "$profileFamelinks.profileImageType",
        }
      },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
  ]);
  //   name: 1,
  //   district: 1,
  //   state: 1,
  //   country: 1,
  //   continent: 1,
  //   gender: 1,
  //   ageGroup: 1,
  //   profileImage: 1,
  //   profileImageType: 1,
  //   type: 1,
  //   profileFamelinks: 1,
  //   profileStorelinks: 1,
  //   profileCollablinks: 1,
  // })
  //   .sort({ createdAt: "desc" })
  //   .lean()
  //   .skip((page - 1) * 10)
  //   .limit(10);
};

exports.getRecommendedContestants = (condition, page) => {
  return UserDB.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "famelinks",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              isDeleted: false,
              isSafe: true,
              isBlocked: false,
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "famelinksPost",
      },
    },
    { $match: { $expr: { $ne: [0, { $size: "$famelinksPost" }] } } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        name: 1,
        location: { $first: "$location" },
        gender: 1,
        ageGroup: 1,
        profileImage: 1,
        profileImageType: 1,
        type: 1,
        profileFamelinks: 1,
        profileStorelinks: 1,
        profileCollablinks: 1,
      },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.getTrendingContestants = (condition, page) => {
  // return UserDB.find(condition, {
  //   name: 1,
  //   district: 1,
  //   state: 1,
  //   country: 1,
  //   continent: 1,
  //   gender: 1,
  //   ageGroup: 1,
  //   profileImage: 1,
  //   profileImageType: 1,
  //   type: 1,
  //   profileFamelinks: 1,
  //   profileStorelinks: 1,
  //   profileCollablinks: 1,
  // })
  //   .sort({ createdAt: "desc" })
  //   .lean()
  //   .skip((page - 1) * 10)
  //   .limit(10);
  return UserDB.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: "famelinks",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              isDeleted: false,
              isSafe: true,
              isBlocked: false,
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
        ],
        as: "famelinksPost",
      },
    },
    { $match: { $expr: { $ne: [0, { $size: "$famelinksPost" }] } } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        name: 1,
        location: { $first: "$location" },
        gender: 1,
        ageGroup: 1,
        profileImage: 1,
        profileImageType: 1,
        type: 1,
        profileFamelinks: 1,
        profileStorelinks: 1,
        profileCollablinks: 1,
      },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.updateNotifications = (
  targetId,
  userId,
  type,
  sourceId,
  body,
  sourceMedia,
  sourceMediaType,
  targetMedia,
  source,
  data,
  action,
  postType,
  sourceType,
  category,
  tagId
) => {
  return NotificationDB.updateOne(
    { targetId, type },
    {
      $set: {
        userId,
        sourceId,
        body,
        sourceMedia,
        sourceMediaType,
        targetMedia,
        source,
        data,
        action,
        postType,
        sourceType,
        category,
        tagId,
      },
    },
    { upsert: true }
  );
};

exports.getFollowRequest = (userId, page) => {
  return FollowerDB.aggregate([
    {
      $match: {
        followeeId: userId,
        acceptedDate: null,
        type: "user",
      },
    },
    { $project: { createdAt: 1, followerId: 1 } },
    {
      $lookup: {
        from: "users",
        let: { userId: "$followerId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$location" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                { $project: { type: 1, value: 1 } },
              ],
              as: "location",
            },
          },
          {
            $project: {
              type: 1,
              name: 1,
              username: 1,
              profileImage: 1,
              profileImageType: 1,
              location: { $first: "$location" },
            },
          },
        ],
        as: "masterUser",
      },
    },
    {
      $addFields: {
        _id: { $first: "$masterUser._id" },
        type: { $first: "$masterUser.type" },
        name: { $first: "$masterUser.name" },
        username: { $first: "$masterUser.username" },
        location: { $first: "$masterUser.location" },
        profileImageType: { $first: "$masterUser.profileImageType" },
        profileImage: { $first: "$masterUser.profileImage" },
      },
    },
    {
      $group: {
        _id: "$_id",
        type: { $first: "$type" },
        name: { $first: "$name" },
        username: { $first: "$username" },
        location: { $first: "$location" },
        createdAt: { $first: "$createdAt" },
        profileImageType: { $first: "$profileImageType" },
        profileImage: { $first: "$profileImage" },
      },
    },
    { $skip: (page - 1) * 10 },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
  ]);
};

exports.getFollowRequestCount = (userId) => {
  return FollowerDB.aggregate([
    {
      $match: {
        followeeId: userId,
        acceptedDate: null,
        type: "user",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
};

exports.markAsRead = (userId) => {
  return NotificationDB.updateMany(
    { userId: userId, isSeen: false },
    { $set: { isSeen: true } }
  );
};

exports.getNotifications = (userId, page, type, category) => {
  if (type === "received") {
    // return NotificationDB.find({ userId, type: "receiveFameCoin" })
    //   .sort({ updatedAt: "desc" })
    //   .skip((page - 1) * 10)
    //   .limit(10)
    //   .lean();
    return NotificationDB.aggregate([
      { $match: { userId: userId, type: "receiveFameCoin" } },
      {
        $lookup: {
          from: "users",
          let: { sourceId: "$sourceId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$sourceId"] },
                isDeleted: false,
                isSuspended: false,
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "sourceDetails",
        },
      },
      { $project: { sourceDetails: 0 } },
      { $sort: { updatedAt: -1 } },
      { $skip: (page - 1) * 10 },
      { $limit: 10 },
    ]);
  }
  if (type === "gifted") {
    // return NotificationDB.find({ userId, type: "sendFameCoin" })
    //   .sort({ updatedAt: "desc" })
    //   .skip((page - 1) * 10)
    //   .limit(10)
    //   .lean();

    return NotificationDB.aggregate([
      { $match: { userId: userId, type: "sendFameCoin" } },
      {
        $lookup: {
          from: "users",
          let: { sourceId: "$sourceId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$sourceId"] },
                isDeleted: false,
                isSuspended: false,
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "sourceDetails",
        },
      },
      { $project: { sourceDetails: 0 } },
      { $sort: { updatedAt: -1 } },
      { $skip: (page - 1) * 10 },
      { $limit: 10 },
    ]);
  }
  if (!type) {
    // return NotificationDB.find({ userId })
    //   .sort({ updatedAt: "desc" })
    //   .skip((page - 1) * 10)
    //   .limit(10)
    //   .lean();
    return NotificationDB.aggregate([
      { $match: { userId: userId, category: category } },
      {
        $lookup: {
          from: "users",
          let: { sourceId: "$sourceId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$sourceId"] },
                isDeleted: false,
                isSuspended: false,
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "sourceDetails",
        },
      },
      { $match: { $expr: { $eq: [1, { $size: "$sourceDetails" }] } } },
      { $project: { sourceDetails: 0 } },
      { $sort: { updatedAt: -1 } },
      { $skip: (page - 1) * 10 },
      { $limit: 10 },
    ]);
  }
};

exports.getUserByUsername = (username) => {
  return UserDB.findOne({ username }).lean();
};

exports.bannerUpload = (profileId, bannerFiles) => {
  return UserDB.updateOne(
    { _id: profileId },
    { $push: { "profileStorelinks.bannerMedia": { $each: bannerFiles } } }
  );
};

exports.bannerDelete = (profileId, bannerFiles) => {
  return UserDB.updateOne(
    { _id: profileId },
    { $pull: { "profileStorelinks.bannerMedia": bannerFiles } }
  );
};

// exports.saveMusic = (userId, musicId) => {
//     return UserDB.updateOne({ _id: userId }, {
//         $push: {
//             savedMusic: musicId
//         }
//     });
// };


//MasterIdMigration
exports.saveMusic = (userId, musicId) => {
  return UserDB.updateOne(
    { _id: userId },
    {
      $push: {
        "profileFunlinks.savedMusic": musicId,
      },
    }
  );
};

// exports.unsaveMusic = (userId, musicId) => {
//     return UserDB.updateOne({ _id: userId }, {
//         $pull: {
//             savedMusic: musicId
//         }
//     });
// };


//MasterIdMigration
exports.unsaveMusic = (userId, musicId) => {
  return UserDB.updateOne(
    { _id: userId },
    {
      $pull: {
        "profileFamelinks.savedMusic": musicId,
      },
    }
  );
};

// exports.getSavedMusicIds = (userId) => {
//     return UserDB.findOne({ _id: userId }, { savedMusic: 1 }).lean();
// };


//MasterIdMigration
exports.getSavedMusicIds = (userId) => {
  return UserDB.findOne({ _id: userId }, { savedMusic: "$profileFunlinks.savedMusic" }).lean();
};

exports.updateVerificationDoc = (userId, verificationDoc, type) => {
  return UserDB.updateOne(
    { _id: userId },
    {
      $push: {
        [`${type}.bannerMedia`]: { $each: verificationDoc },
      },
    }
  );
};

exports.fameCoin = (toUserId, fameCoins, fromUserId) => {
  return FameCoinsDB.create({
    toUserId,
    fameCoins,
    fromUserId,
    type: "gifted",
  });
};

exports.recieveFameCoin = (type, toUserId, fameCoins) => {
  return FameCoinsDB.create({ fameCoins, toUserId, type });
};

exports.updateUserCoin = (userId, fameCoins) => {
  return UserDB.updateOne(
    { _id: userId },
    { $inc: { fameCoins } }
  );
};

exports.addRecommendation = (recommendedBy, data, recommendedTo) => {
  return RecommendationDB.create({
    data,
    recommendedBy,
    recommendedTo,
  });
};

exports.getRecommendations = (recommendedBy, agencyId) => {
  return RecommendationDB.aggregate([
    { $match: { recommendedTo: ObjectId(agencyId) } },
    {
      $lookup: {
        from: "users",
        // localField: 'recommendedBy',
        // foreignField: '_id',
        let: { userId: "$recommendedBy" },
        pipeline: [
          {
            $match: {
              // _id: '$$userId',
              $expr: { $eq: ["$_id", "$$userId"] },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              type: 1,
              bio: 1,
              profession: 1,
              dob: 1,
              profileImage: 1,
              profileImageType: 1,
              username: 1,
            },
          },
        ],
        as: "user",
      },
    },
    {
      $project: {
        data: 1,
        createdAt: 1,
        updatedAt: 1,
        user: { $first: "$user" },
      },
    },
  ]);
};

exports.getGlobalSettings = () => {
  return SettingsDB.findOne().lean();
};

exports.getMasterProfile = (childProfileId) => {
  return UserDB.find(
    {
      $or: [
        { profileFamelinks: childProfileId },
        { profileFunlinks: childProfileId },
        { profileFollowlinks: childProfileId },
        { profileJoblinks: childProfileId },
        { profileCollablinks: childProfileId },
      ],
    },
    { _id: 1 }
  ).lean();
};

exports.getstoreLinkId = (userId) => {
  return UserDB.findOne({ _id: userId }, { profileStorelinks: 1 }).lean();
};

exports.getProfileFamelinks = (profileId, followerId, page) => {
  let pagination = page ? page : 1;
  return UserDB.aggregate([
    { $match: { _id: new ObjectId(profileId) } },
    { $addFields: { trendWinner: "$profileFamelinks.trendWinner" } },
    {
      $lookup: {
        from: "fametrendzs",
        let: {
          trendId: "$trendWinner.trendId",
          masterUserId: "$_id",
          postId: "$trendWinner.postId",
        },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$trendId"] },
              winner: { $ne: null },
            },
          },
          { $addFields: { postId: "$$postId" } },
          {
            $project: {
              postId: 1,
              hashTag: 1,
              category: 1,
              totalPost: 1,
              totalParticipants: 1,
              totalImpressions: 1,
              challengeCompleteAt: 1,
              rewardWinner: 1,
              rewardRunnerUp: 1,
              winner: 1,
            },
            $project: {
              postId: 1,
              index: { $indexOfArray: ["$winner._id", "$$masterUserId"] },
              winner: 1,
              hashTag: 1,
              category: 1,
              totalPost: 1,
              totalParticipants: 1,
              totalImpressions: 1,
              challengeCompleteAt: 1,
              rewardWinner: 1,
              rewardRunnerUp: 1,
            },
          },
          {
            $project: {
              postId: 1,
              winnerDetails: { $arrayElemAt: ["$winner", "$index"] },
              hashTag: 1,
              category: 1,
              totalPost: 1,
              totalParticipants: 1,
              totalImpressions: 1,
              challengeCompleteAt: 1,
              rewardWinner: 1,
              rewardRunnerUp: 1,
            },
          },
          {
            $project: {
              postId: 1,
              position: "$winnerDetails.Position",
              totalHearts: "$winnerDetails.totalHearts",
              hashTag: 1,
              category: 1,
              totalPost: 1,
              totalParticipants: 1,
              totalImpressions: 1,
              challengeCompleteAt: 1,
              rewardWinner: 1,
              rewardRunnerUp: 1,
            },
          },
          {
            $project: {
              postId: 1,
              hashTag: 1,
              category: 1,
              totalPost: 1,
              totalParticipants: 1,
              totalImpressions: 1,
              challengeCompleteAt: 1,
              totalHearts: 1,
              rewardRunnerUp: 1,
              rewardWinner: 1,
              position: {
                $switch: {
                  branches: [
                    { case: { $eq: [1, "$position"] }, then: "Winner" },
                    {
                      case: { $eq: [2, "$position"] },
                      then: "First Runner Up",
                    },
                    {
                      case: { $eq: [3, "$position"] },
                      then: "Second Runner Up",
                    },
                    {
                      case: { $eq: [4, "$position"] },
                      then: "Third Runner Up",
                    },
                    {
                      case: { $eq: [5, "$position"] },
                      then: "Fourth Runner Up",
                    },
                  ],
                  default: "Position not specified",
                },
              },
            },
          },
          {
            $project: {
              postId: 1,
              hashTag: 1,
              category: 1,
              totalPost: 1,
              totalParticipants: 1,
              totalImpressions: 1,
              challengeCompleteAt: 1,
              totalHearts: 1,
              position: 1,
              reward: {
                $cond: {
                  if: { $eq: ["$position", "Winner"] },
                  then: "$rewardWinner",
                  else: "$rewardRunnerUp",
                },
              },
            },
          },
          {
            $lookup: {
              from: "famelinks",
              let: { postId: "$postId" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$postId"] } } },
                {
                  $project: {
                    _id: 0,
                    closeUp: 1,
                    medium: 1,
                    long: 1,
                    pose1: 1,
                    pose2: 1,
                    additional: 1,
                    video: 1,
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
              ],
              as: "media",
            },
          },
        ],
        as: "trendsWon",
      },
    },
    {
      $lookup: {
        from: "contestwinner",
        let: { userId: profileId },
        pipeline: [
          { $match: { $expr: { $in: ["$$userId", "$winner.userId"] } } },
          {
            $project: {
              _id: 0,
              title: 1,
              year: 1,
              season: 1,
              level: 1,
              position: "$winner.position",
            },
          },
          { $sort: { position: 1 } },
          {
            $project: {
              _id: 0,
              title: 1,
              year: 1,
              season: 1,
              level: 1,
              position: {
                $switch: {
                  branches: [
                    { case: { $eq: [[1], "$position"] }, then: "Winner" },
                    {
                      case: { $eq: [[2], "$position"] },
                      then: "First Runner Up",
                    },
                    {
                      case: { $eq: [[3], "$position"] },
                      then: "Second Runner Up",
                    },
                  ],
                  default: "Position not specified",
                },
              },
            },
          },
        ],
        as: "titlesWon",
      },
    },
    {
      $lookup: {
        from: "ambassadors",
        let: { userId: profileId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$userId", "$ambassador"] },
              type: "famelinks",
            },
          },
          { $project: { _id: 0, title: 1, level: 1 } },
        ],
        as: "ambassador",
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
              followerId: followerId,
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
              followerId: followerId,
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
        from: "famelinks",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              challengeId: { $ne: [] },
            },
          },
          { $group: { _id: "$challengeId" } },
        ],
        as: "trendzParticipating",
      },
    },
    {
      $addFields: {
        trendzParticipating: {
          $cond: {
            if: { $isArray: "$trendzParticipating" },
            then: { $size: "$trendzParticipating" },
            else: 0,
          },
        },
      },
    },
    {
      $lookup: {
        from: "famelinks",
        localField: "_id",
        foreignField: "userId",
        let: {
          // followStatus: "$followStatus",
          // profile_type: "$profile_type",
          masterId: "$_id",
        },
        pipeline: [
          // {
          //   $match: {
          //     $expr: {
          //       $cond: [
          //         { $eq: ["$$masterId", followerId] },
          //         true,
          //         {
          //           $cond: [
          //             { $eq: ["$$followStatus", "Following"] },
          //             true,
          //             { $eq: ["$$profile_type", "public"] },
          //           ],
          //         },
          //       ],
          //     },
          //   },
          // },
          { $sort: { isWelcomeVideo: -1, createdAt: -1 } },
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
            $project: {
              closeUp: 1,
              medium: 1,
              long: 1,
              pose1: 1,
              pose2: 1,
              additional: 1,
              video: 1,
              isWelcomeVideo: {
                $cond: [{ $ifNull: ["$isWelcomeVideo", false] }, 1, 0],
              },
            },
          },
          //{ $sort: { isWelcomeVideo: -1 } },
          { $skip: (pagination - 1) * 12 },
          { $limit: 12 },
        ],
        as: "posts",
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
        name: "$profileFamelinks.name",
        bio: "$profileFamelinks.bio",
        profession: "$profileFamelinks.profession",
        profileImage: "$profileFamelinks.profileImage",
        profileImageType: "$profileFamelinks.profileImageType",
        likes0Count: "$profileFamelinks.likes0Count",
        likes1Count: "$profileFamelinks.likes1Count",
        likes2Count: "$profileFamelinks.likes2Count",
        restrictedList: "$profileFamelinks.restrictedList",
        isRegistered: "$profileFamelinks.isRegistered",
        isBlocked: "$profileFamelinks.isBlocked",
        isDeleted: "$profileFamelinks.isDeleted",
        createdAt: "$profileFamelinks.createdAt",
        profileImage: "$profileFamelinks.profileImage",
        masterUser: {
          _id: "$_id",
          name: "$name",
          gender: "$gender",
          type: "$type",
          username: "$username",
          fameCoins: "$fameCoins",
          profileImage: "$profileImage",
          profileImageType: "$profileImageType",
          dob: "$dob",
          isVerified: "$isVerified",
          profile_type: "$profile_type",
          location: { $first: "$location" },
        },
        posts: 1,
        trendsWon: 1,
        titlesWon: 1,
        ambassador: 1,
        followStatus: 1,
        trendzParticipating: 1,
      },
    },

  ]);
};

exports.createProfileFamelinks = async (data) => {
  //MasterIdMigration
  return await UserDB.create(data);
};

exports.updateProfileFamelinks = (profileId, obj) => {
  obj = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [`profileFamelinks.${key}`, value])
  );
  //MasterIdMigration
  return UserDB.updateOne({ _id: profileId }, { $set: obj });
};

//MasterIdMigration
exports.getProfileFollowlinks = async (profileId, followerId, page) => {
  let pagination = page ? page : 1;
  return await UserDB.aggregate([
    { $match: { _id: profileId } },
    //MasterIdMigration
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    { $addFields: { Followers: "$followersCount" } },
    { $addFields: { Following: "$followingCount" } },
    {
      $lookup: {
        from: "clubs",
        let: { followers: "$Followers" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $gte: ["$$followers", "$minRange"] } },
                { $expr: { $lte: ["$$followers", "$maxRange"] } },
              ],
            },
          },
          { $project: { _id: 0, name: 1 } },
        ],
        as: "Club",
      },
    },
    {
      $set: {
        Club: {
          $cond: [
            { $ne: [0, { $size: "$Club" }] },
            { $first: "$Club.name" },
            "Bud",
          ],
        },
      },
    },
    {
      $lookup: {
        from: "clubcategories",
        let: { category: "$profileFollowlinks.clubCategory" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$category"] } } },
          { $project: { name: 1 } },
        ],
        as: "clubCategory",
      },
    },
    {
      $lookup: {
        from: "cluboffers",
        let: {
          profileFollowlinks: "$_id",
        },
        pipeline: [
          {
            $match: {
              isDeleted: false,
              isSafe: true,
              isCompleted: true,
              $or: [
                {
                  $expr: { $eq: ["$selectedPromoter", "$$profileFollowlinks"] },
                },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "offersCompleted",
      },
    },
    { $set: { offersCompleted: { $size: "$offersCompleted" } } },
    {
      $lookup: {
        from: "followers",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$followeeId", "$$userId"] },
              acceptedDate: null,
              type: "user",
            },
          },
          { $project: { createdAt: 1, followerId: 1 } },
          {
            $lookup: {
              from: "users",
              let: { userId: "$followerId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                {
                  $lookup: {
                    from: "locatns",
                    let: { value: "$location" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                      { $project: { type: 1, value: 1 } },
                    ],
                    as: "location",
                  },
                },
                {
                  $project: {
                    type: 1,
                    name: 1,
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    location: { $first: "$location" },
                  },
                },
              ],
              as: "masterUser",
            },
          },
          {
            $addFields: {
              _id: { $first: "$masterUser._id" },
              type: { $first: "$masterUser.type" },
              name: { $first: "$masterUser.name" },
              username: { $first: "$masterUser.username" },
              location: { $first: "$masterUser.location" },
              profileImageType: { $first: "$masterUser.profileImageType" },
              profileImage: { $first: "$masterUser.profileImage" },
            },
          },
          {
            $group: {
              _id: "$_id",
              type: { $first: "$type" },
              name: { $first: "$name" },
              username: { $first: "$username" },
              location: { $first: "$location" },
              createdAt: { $first: "$createdAt" },
              profileImageType: { $first: "$profileImageType" },
              profileImage: { $first: "$profileImage" },
            },
          },
        ],
        as: "requests",
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
              followerId: followerId,
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
              followerId: followerId,
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
        from: "followers",
        let: { followeeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$followeeId", "$$followeeId"] },
              acceptedDate: { $ne: null },
              type: "user",
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: "userFollowers",
      },
    },
    { $addFields: { followerCount: { $first: "$userFollowers.count" } } },
    {
      $lookup: {
        from: "followers",
        let: { followerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$followerId", "$$followerId"] },
              acceptedDate: { $ne: null },
              type: "user",
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: "userFollowing",
      },
    },
    { $addFields: { followingCount: { $first: "$userFollowing.count" } } },
    {
      $lookup: {
        from: "followlinks",
        localField: "_id",
        foreignField: "userId",
        let: {
          followStatus: "$followStatus",
          profile_type: "$profile_type",
          masterId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $cond: [
                  { $eq: ["$$masterId", followerId] },
                  true,
                  {
                    $cond: [
                      { $eq: ["$$followStatus", "Following"] },
                      true,
                      { $eq: ["$$profile_type", "public"] },
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { isWelcomeVideo: -1, createdAt: -1 } },
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
            $project: {
              closeUp: 1,
              medium: 1,
              long: 1,
              pose1: 1,
              pose2: 1,
              additional: 1,
              video: 1,
              isWelcomeVideo: {
                $cond: [{ $ifNull: ["$isWelcomeVideo", false] }, 1, 0],
              },
            },
          },
          //{ $sort: { isWelcomeVideo: -1 } },
          { $skip: (pagination - 1) * 12 },
          { $limit: 12 },
        ],
        as: "posts",
      },
    },
    {
      $project: {
        posts: 1,
        name: "$profileFollowlinks.name",
        bio: "$profileFollowlinks.bio",
        profession: "$profileFollowlinks.profession",
        profileImage: "$profileFollowlinks.profileImage",
        profileImageType: "$profileFollowlinks.profileImageType",
        restrictedList: "$profileFollowlinks.restrictedList",
        isRegistered: "$profileFollowlinks.isRegistered",
        isBlocked: "$profileFollowlinks.isBlocked",
        isDeleted: "$profileFollowlinks.isDeleted",
        masterUser: {
          _id: "$_id",
          name: "$name",
          gender: "$gender",
          type: "$type",
          username: "$username",
          fameCoins: "$fameCoins",
          profileImage: "$profileImage",
          profileImageType: "$profileImageType",
          dob: "$dob",
          isVerified: "$isVerified",
          profile_type: "$profile_type",
          location: { $first: "$location" },
        },
        followerCount: { $ifNull: ["$followerCount", 0] },
        followingCount: { $ifNull: ["$followingCount", 0] },
        requests: 1,
        followStatus: 1,
        Club: 1,
        clubCategory: 1,
        offersCompleted: 1,
      },
    },
  ]);
};

exports.createProfileFollowlinks = async (data) => {
  return await UserDB.create(data);
};

exports.updateProfileFollowlinks = async (profileId, obj) => {
  obj = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [`profileFollowlinks.${key}`, value])
  );
  return await UserDB.updateOne(
    { _id: profileId },
    { $set: obj }
  );
};

//MasterIdMigration
exports.getProfileFunlinks = async (profileId, followerId, page) => {
  let pagination = page ? page : 1;
  return await UserDB.aggregate([
    { $match: { _id: profileId } },

    {
      $lookup: {
        from: "musics",
        let: { profileId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$uploadedBy", "$$profileId"] } } },
        ],
        as: "musics",
      },
    },
    {
      $lookup: {
        from: "ambassadors",
        let: { userId: profileId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$userId", "$ambassador"] },
              type: "funlinks",
            },
          },
          { $project: { _id: 0, title: 1, level: 1 } },
        ],
        as: "ambassador",
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
              followerId: followerId,
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
              followerId: followerId,
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
        from: "funlinks",
        localField: "_id",
        foreignField: "userId",
        let: {
          // followStatus: "$followStatus",
          // profile_type: "$profile_type",
          masterId: "$_id",
        },
        pipeline: [
          // {
          //   $match: {
          //     $expr: {
          //       $cond: [
          //         { $eq: ["$$masterId", followerId] },
          //         true,
          //         {
          //           $cond: [
          //             { $eq: ["$$followStatus", "Following"] },
          //             true,
          //             { $eq: ["$$profile_type", "public"] },
          //           ],
          //         },
          //       ],
          //     },
          //   },
          // },
          { $sort: { isWelcomeVideo: -1, createdAt: -1 } },
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
            $project: {
              closeUp: 1,
              medium: 1,
              long: 1,
              pose1: 1,
              pose2: 1,
              additional: 1,
              video: 1,
              isWelcomeVideo: {
                $cond: [{ $ifNull: ["$isWelcomeVideo", false] }, 1, 0],
              },
            },
          },
          // { $sort: { isWelcomeVideo: -1 } },
          { $skip: (pagination - 1) * 12 },
          { $limit: 12 },
        ],
        as: "posts",
      },
    },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$masterUser.location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        name: "$profileFunlinks.name",
        bio: "$profileFunlinks.bio",
        profession: "$profileFunlinks.profession",
        restrictedList: "$profileFunlinks.restrictedList",
        isRegistered: "$profileFunlinks.isRegistered",
        isBlocked: "$profileFunlinks.isBlocked",
        isDeleted: "$profileFunlinks.isDeleted",
        profileImage: "$profileFunlinks.profileImage",
        profileImageType: "$profileFunlinks.profileImageType",
        masterUser: {
          _id: "$_id",
          name: "$name",
          gender: "$gender",
          username: "$username",
          fameCoins: "$fameCoins",
          profileImage: "$profileImage",
          profileImageType: "$profileImageType",
          dob: "$dob",
          isVerified: "$isVerified",
          profile_type: "$profile_type",
          location: { $first: "$location" },
        },
        musics: 1,
        posts: 1,
        videos: 1,
        ambassador: 1,
        followStatus: 1,
      },
    },
  ]);
};

//MasterIdMigration
exports.getOtherProfileFunlinks = async (profileId, followerId, page) => {
  let pagination = page ? page : 1;
  return await UserDB.aggregate([
    { $match: { _id: profileId } },

    {
      $lookup: {
        from: "musics",
        let: { savedMusic: "$profileFunlinks.savedMusic" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$savedMusic"] } } },
          { $project: { music: 1, duration: 1, createdAt: 1, name: 1 } },
          {
            $lookup: {
              from: "funlinks",
              let: { musicId: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$musicId", "$$musicId"] } } },
                { $project: { video: 1 } },
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
              ],
              as: "video",
            },
          },
          { $addFields: { video: { $first: "$video.video" } } },
          {
            $group: {
              _id: "$_id",
              video: { $first: "$video" },
              music: { $first: "$music" },
              duration: { $first: "$duration" },
              name: { $first: "$name" },
              createdAt: { $first: "$createdAt" },
            },
          },
        ],
        as: "savedMusic",
      },
    },
    {
      $lookup: {
        from: "ambassadors",
        let: { userId: profileId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$userId", "$ambassador"] },
              type: "funlinks",
            },
          },
          { $project: { _id: 0, title: 1, level: 1 } },
        ],
        as: "ambassador",
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
              followerId: followerId,
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
              followerId: followerId,
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
        from: "funlinks",
        localField: "_id",
        foreignField: "userId",
        // let: {
        //   followStatus: "$followStatus",
        //   profile_type: "$profile_type",
        // },
        pipeline: [
          // {
          //   $match: {
          //     $expr: {
          //       $cond: [
          //         { $eq: ["$$followStatus", "Following"] },
          //         true,
          //         { $eq: ["$$profile_type", "public"] },
          //       ],
          //     },
          //   },
          // },
          { $sort: { isWelcomeVideo: -1, createdAt: -1 } },
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
            $project: {
              closeUp: 1,
              medium: 1,
              long: 1,
              pose1: 1,
              pose2: 1,
              additional: 1,
              video: 1,
              isWelcomeVideo: {
                $cond: [{ $ifNull: ["$isWelcomeVideo", false] }, 1, 0],
              },
            },
          },
          // { $sort: { isWelcomeVideo: -1 } },
          { $skip: (pagination - 1) * 12 },
          { $limit: 12 },
        ],
        as: "posts",
      },
    },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        bio: "$profileFunlinks.bio",
        name: "$profileFunlinks.name",
        profession: "$profileFunlinks.profession",
        restrictedList: "$profileFunlinks.restrictedList",
        isRegistered: "$profileFunlinks.isRegistered",
        isBlocked: "$profileFunlinks.isBlocked",
        isDeleted: "$profileFunlinks.isDeleted",
        profileImage: "$profileFunlinks.profileImage",
        profileImageType: "$profileFunlinks.profileImageType",
        masterUser: {
          _id: "$_id",
          name: "$name",
          gender: "$gender",
          type: "$type",
          username: "$username",
          fameCoins: "$fameCoins",
          profileImage: "$profileImage",
          profileImageType: "$profileImageType",
          dob: "$dob",
          isVerified: "$isVerified",
          profile_type: "$profile_type",
          location: { $first: "$location" },
        },
        savedMusic: 1,
        posts: 1,
        videos: 1,
        ambassador: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
      },
    },
  ]);
};

//MasterIdMigration
exports.createProfileFunlinks = async (data) => {
  return await UserDB.create(data);
};

//MasterIdMigration
exports.updateProfileFunlinks = (profileId, obj) => {
  obj = Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [`profileFunlinks.${key}`, value])
  );
  return UserDB.updateOne({ _id: profileId }, { $set: obj });
};

exports.getProfileJoblinks = (profileId, page) => {
  return UserDB.aggregate([
    { $match: { _id: profileId } },
    {
      $lookup: {
        from: "hiringprofiles",
        let: { profileId: "$profileJoblinks.profileFaces" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$interestedLoc" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                {
                  $lookup: {
                    from: "locatns",
                    let: { value: "$scopes" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                      { $project: { value: 1 } },
                      { $sort: { _id: -1 } },
                    ],
                    as: "scopes",
                  },
                },
                {
                  $project: {
                    type: 1,
                    value: {
                      $concat: [
                        "$value",
                        ", ",
                        {
                          $reduce: {
                            input: "$scopes",
                            initialValue: "",
                            in: {
                              $concat: [
                                "$$value",
                                {
                                  $cond: {
                                    if: { $eq: ["$$value", ""] },
                                    then: "",
                                    else: ", ",
                                  },
                                },
                                "$$this.value",
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
              as: "interestedLoc",
            },
          },
          {
            $project: {
              _id: 0,
              height: 1,
              weight: 1,
              bust: 1,
              waist: 1,
              hip: 1,
              eyeColor: 1,
              complexion: 1,
              interestedLoc: 1,
              locatns: 1,
              interestCat: 1,
            },
          },
          {
            $lookup: {
              from: "jobcategories",
              let: { interestCat: "$interestCat" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$interestCat"] } } },
                { $project: { jobName: 1, jobCategory: 1 } },
              ],
              as: "interestCat",
            },
          },
        ],
        as: "faces",
      },
    },
    { $set: { faces: { $first: "$faces" } } },
    {
      $lookup: {
        from: "hiringprofiles",
        let: { profileId: "$profileJoblinks.profileCrew" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$interestedLoc" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                {
                  $lookup: {
                    from: "locatns",
                    let: { value: "$scopes" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                      { $project: { value: 1 } },
                      { $sort: { _id: -1 } },
                    ],
                    as: "scopes",
                  },
                },
                {
                  $project: {
                    type: 1,
                    value: {
                      $concat: [
                        "$value",
                        ", ",
                        {
                          $reduce: {
                            input: "$scopes",
                            initialValue: "",
                            in: {
                              $concat: [
                                "$$value",
                                {
                                  $cond: {
                                    if: { $eq: ["$$value", ""] },
                                    then: "",
                                    else: ", ",
                                  },
                                },
                                "$$this.value",
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
              as: "interestedLoc",
            },
          },
          {
            $lookup: {
              from: "jobcategories",
              let: { interestCat: "$interestCat" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$interestCat"] } } },
                { $project: { jobName: 1, jobCategory: 1 } },
              ],
              as: "interestCat",
            },
          },
          {
            $project: {
              _id: 0,
              workExperience: 1,
              achievements: 1,
              experienceLevel: 1,
              interestedLoc: 1,
              interestCat: 1,
            },
          },
        ],
        as: "crew",
      },
    },
    { $set: { crew: { $first: "$crew" } } },
    {
      $lookup: {
        from: "famelinks",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              isSafe: true,
              isWelcomeVideo: { $exists: false },
            },
          },
          { $set: { likes2Count: { $multiply: [2, "$likes2Count"] } } },
          { $set: { likesCount: { $sum: ["$likes1Count", "$likes2Count"] } } },
          { $sort: { likesCount: -1 } },
          {
            $project: {
              closeUp: 1,
              medium: 1,
              long: 1,
              pose1: 1,
              pose2: 1,
              additional: 1,
              video: 1,
            },
          },
          { $limit: 10 },
        ],
        as: "posts",
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: profileId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "hired",
            },
          },
        ],
        as: "hired",
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: profileId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "shortlisted",
            },
          },
        ],
        as: "shortlisted",
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: profileId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "applied",
            },
          },
        ],
        as: "applied",
      },
    },
    {
      $lookup: {
        from: "chats",
        let: { masterUser: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $in: ["$$masterUser", "$members"] } },
                { category: "jobChat" },
                { $expr: { $in: ["$$masterUser", "$readBy"] } },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "chats",
      },
    },
    {
      $lookup: {
        from: "chats",
        let: { masterUser: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $in: ["$$masterUser", "$members"] } },
                { category: "jobChat" },
                { $expr: { $not: { $in: ["$$masterUser", "$readBy"] } } },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "unreadChats",
      },
    },
    {
      $lookup: {
        from: "invitations",
        let: { toId: profileId },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$to", "$$toId"] } },
                { category: "job" },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "Invites",
      },
    },
    {
      $lookup: {
        from: "jobs",
        let: { createdBy: profileId },
        pipeline: [
          { $match: { $expr: { $eq: ["$createdBy", "$$createdBy"] } } },
        ],
        as: "totalJobs",
      },
    },
    {
      $lookup: {
        from: "jobs",
        let: { createdBy: profileId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$createdBy", "$$createdBy"] },
              status: 'open',
              isClosed: false,
            },
          },
          {
            $lookup: {
              from: "jobcategories",
              let: { jobCategory: "$jobCategory" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$jobCategory"] } } },
                { $project: { jobName: 1, jobCategory: 1 } },
              ],
              as: "jobDetails",
            },
          },
          {
            $lookup: {
              from: "jobapplications",
              let: { jobId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$jobId", "$$jobId"] },
                    $or: [{ status: "applied" }, { status: "shortlisted" }],
                  },
                },
                { $project: { _id: 0, userId: 1 } },
                {
                  $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                      { $project: { profileImage: 1, profileImageType: 1 } },
                    ],
                    as: "user",
                  },
                },
                {
                  $addFields: {
                    profileImage: { $first: "$user.profileImage" },
                    profileImageType: { $first: "$user.profileImageType" },
                    _id: { $first: "$user._id" },
                  },
                },
                {
                  $group: {
                    _id: "$_id",
                    profileImage: { $first: "$profileImage" },
                    profileImageType: { $first: "$profileImageType" },
                  },
                },
              ],
              as: "applicants",
            },
          },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$jobLocation" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                { $project: { type: 1, value: 1 } },
              ],
              as: "jobLocation",
            },
          },
          {
            $project: {
              applicants: 1,
              jobType: 1,
              title: 1,
              jobLocation: { $first: "$jobLocation" },
              description: 1,
              startDate: 1,
              endDate: 1,
              deadline: 1,
              ageGroup: 1,
              gender: 1,
              createdAt: 1,
              updatedAt: 1,
              jobDetails: 1,
              experienceLevel: 1,
              height: 1,
            },
          },
        ],
        as: "openJobs",
      },
    },

    { $set: { totalJobs: { $size: "$totalJobs" } } },
    { $set: { Invites: { $size: "$Invites" } } },
    { $set: { chats: { $size: "$chats" } } },
    { $set: { unreadChats: { $size: "$unreadChats" } } },
    { $set: { hired: { $size: "$hired" } } },
    { $set: { applied: { $size: "$applied" } } },
    { $set: { shortlisted: { $size: "$shortlisted" } } },
    { $set: { saved: { $size: "$profileJoblinks.savedJobs" } } },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $lookup: {
        from: "jobs",
        let: { value: profileId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$createdBy", "$$value"] },
            },
          },
          {
            $project: {
              itemsCount: { $sum: { $size: "$hiredApplicants" } },
            },
          },
          {
            $group: {
              _id: "$userId",
              totalItemsCount: { $sum: "$itemsCount" }
            }
          },
          {
            $project: {
              _id: 0,
              totalItemsCount: 1
            }
          }
        ],
        as: "hiredByMe",
      },
    },
    {
      $addFields: {hiredByMe: {$first: '$hiredByMe.totalItemsCount'}}
    },
    {
      $project: {
        _id: 1,
        name: "$profileJoblinks.name",
        bio: "$profileJoblinks.bio",
        profession: "$profileJoblinks.profession",
        profileImage: "$profileJoblinks.profileImage",
        profileImageType: "$profileJoblinks.profileImageType",
        greetText: "$profileJoblinks.greetText",
        greetVideo: "$profileJoblinks.greetVideo",
        masterUser: {
          _id: "$_id",
          name: "$name",
          gender: "$gender",
          type: "$type",
          username: "$username",
          fameCoins: "$fameCoins",
          profileImage: "$profileImage",
          profileImageType: "$profileImageType",
          dob: "$dob",
          isVerified: "$isVerified",
          profile_type: "$profile_type",
          location: { $first: "$location" },
        },
        chats: 1,
        unreadChats: 1,
        hired: 1,
        hiredByMe: 1,
        applied: 1,
        shortlisted: 1,
        Invites: 1,
        saved: 1,
        savedTalents: 1,
        totalJobs: 1,
        openJobs: 1,
        posts: 1,
        faces: 1,
        crew: 1,
      },
    },
  ]);
};

//MasterIdMigration
exports.getOtherProfileJoblinks = (
  userId,
  profileType,
  followerId,
  selfJoblinksId,
  page
) => {
  let pagination = page ? page : 1;
  if (profileType == "individual" || profileType == "agency") {
    return UserDB.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: "ambassadors",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$userId", "$ambassador"] },
                type: "famelinks",
              },
            },
            { $project: { _id: 0, title: 1, level: 1 } },
          ],
          as: "ambassador",
        },
      },
      {
        $set: {
          ambassador: {
            $cond: [
              { $eq: [0, { $size: "$ambassador" }] },
              "",
              { $first: "$ambassador" },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "famelinks",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userId", "$$userId"] },
                isSafe: true,
                isWelcomeVideo: { $exists: false },
              },
            },
            { $set: { likes2Count: { $multiply: [2, "$likes2Count"] } } },
            {
              $set: { likesCount: { $sum: ["$likes1Count", "$likes2Count"] } },
            },
            { $sort: { likesCount: -1 } },
            {
              $project: {
                closeUp: 1,
                medium: 1,
                long: 1,
                pose1: 1,
                pose2: 1,
                additional: 1,
                video: 1,
              },
            },
            // { $skip: ((postsPagination - 1) * 3) },
            { $limit: 10 },
          ],
          as: "posts",
        },
      },
      { $set: { followers: "$followersCount" } },
      //MasterIdMigration
      {
        $lookup: {
          from: "users",
          let: { profileFamelinks: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$profileFamelinks"] } } },
            { $project: { trendWinner: "$profileFamelinks.trendWinner", _id: 0 } },
          ],
          as: "trendWinner",
        },
      },
      {
        $set: {
          trendWinner: {
            $cond: [
              { $eq: [0, { $size: "$trendWinner" }] },
              "$trendWinner",
              { $first: "$trendWinner.trendWinner" },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "fametrendzs",
          let: {
            trendId: "$trendWinner.trendId",
            masterUserId: "$_id",
            postId: "$trendWinner.postId",
          },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$trendId"] },
                winner: { $ne: null },
              },
            },
            { $addFields: { postId: "$$postId" } },
            {
              $project: {
                postId: 1,
                hashTag: 1,
                category: 1,
                totalPost: 1,
                totalParticipants: 1,
                totalImpressions: 1,
                challengeCompleteAt: 1,
                rewardWinner: 1,
                rewardRunnerUp: 1,
                winner: 1,
              },
              $project: {
                postId: 1,
                index: { $indexOfArray: ["$winner._id", "$$masterUserId"] },
                winner: 1,
                hashTag: 1,
                category: 1,
                totalPost: 1,
                totalParticipants: 1,
                totalImpressions: 1,
                challengeCompleteAt: 1,
                rewardWinner: 1,
                rewardRunnerUp: 1,
              },
            },
            {
              $project: {
                postId: 1,
                winnerDetails: { $arrayElemAt: ["$winner", "$index"] },
                hashTag: 1,
                category: 1,
                totalPost: 1,
                totalParticipants: 1,
                totalImpressions: 1,
                challengeCompleteAt: 1,
                rewardWinner: 1,
                rewardRunnerUp: 1,
              },
            },
            {
              $project: {
                postId: 1,
                position: "$winnerDetails.Position",
                totalHearts: "$winnerDetails.totalHearts",
                hashTag: 1,
                category: 1,
                totalPost: 1,
                totalParticipants: 1,
                totalImpressions: 1,
                challengeCompleteAt: 1,
                rewardWinner: 1,
                rewardRunnerUp: 1,
              },
            },
            {
              $project: {
                postId: 1,
                hashTag: 1,
                category: 1,
                totalPost: 1,
                totalParticipants: 1,
                totalImpressions: 1,
                challengeCompleteAt: 1,
                totalHearts: 1,
                rewardRunnerUp: 1,
                rewardWinner: 1,
                position: {
                  $switch: {
                    branches: [
                      { case: { $eq: [1, "$position"] }, then: "Winner" },
                      {
                        case: { $eq: [2, "$position"] },
                        then: "First Runner Up",
                      },
                      {
                        case: { $eq: [3, "$position"] },
                        then: "Second Runner Up",
                      },
                      {
                        case: { $eq: [4, "$position"] },
                        then: "Third Runner Up",
                      },
                      {
                        case: { $eq: [5, "$position"] },
                        then: "Fourth Runner Up",
                      },
                    ],
                    default: "Position not specified",
                  },
                },
              },
            },
            {
              $project: {
                postId: 1,
                hashTag: 1,
                category: 1,
                totalPost: 1,
                totalParticipants: 1,
                totalImpressions: 1,
                challengeCompleteAt: 1,
                totalHearts: 1,
                position: 1,
                reward: {
                  $cond: {
                    if: { $eq: ["$position", "Winner"] },
                    then: "$rewardWinner",
                    else: "$rewardRunnerUp",
                  },
                },
              },
            },
            {
              $lookup: {
                from: "famelinks",
                let: { postId: "$postId" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$postId"] } } },
                  {
                    $project: {
                      _id: 0,
                      closeUp: 1,
                      medium: 1,
                      long: 1,
                      pose1: 1,
                      pose2: 1,
                      additional: 1,
                      video: 1,
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
                ],
                as: "media",
              },
            },
          ],
          as: "trendzSet",
        },
      },
      {
        $lookup: {
          from: "contestwinner",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $in: ["$$userId", "$winner.userId"] } } },
            {
              $project: {
                _id: 0,
                title: 1,
                year: 1,
                season: 1,
                level: 1,
                position: "$winner.position",
              },
            },
            { $sort: { position: 1 } },
            {
              $project: {
                _id: 0,
                title: 1,
                year: 1,
                season: 1,
                level: 1,
                position: {
                  $switch: {
                    branches: [
                      { case: { $eq: [[1], "$position"] }, then: "Winner" },
                      {
                        case: { $eq: [[2], "$position"] },
                        then: "First Runner Up",
                      },
                      {
                        case: { $eq: [[3], "$position"] },
                        then: "Second Runner Up",
                      },
                    ],
                    default: "Position not specified",
                  },
                },
              },
            },
          ],
          as: "titlesWon",
        },
      },
      {
        $lookup: {
          from: "jobs",
          let: { createdBy: userId },
          pipeline: [
            { $match: { $expr: { $eq: ["$createdBy", "$$createdBy"] } } },
          ],
          as: "totalJobs",
        },
      },
      { $set: { totalJobs: { $size: "$totalJobs" } } },
      {
        $lookup: {
          from: "jobs",
          let: { createdBy: userId },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$createdBy", "$$createdBy"] },
                status: 'open',
                isClosed: false,
              },
            },
            {
              $lookup: {
                from: "jobcategories",
                let: { jobCategory: "$jobCategory" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$jobCategory"] } } },
                  { $project: { jobName: 1, jobCategory: 1 } },
                ],
                as: "jobDetails",
              },
            },
            {
              $lookup: {
                from: "jobapplications",
                let: { jobId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$jobId", "$$jobId"] },
                      $or: [{ status: "applied" }, { status: "shortlisted" }],
                    },
                  },
                  { $project: { _id: 0, userId: 1 } },
                  //MasterIdMigration
                  {
                    $lookup: {
                      from: "users",
                      let: { userId: "$userId" },
                      pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                        { $project: { profileImage: "$profileJoblinks.profileImage", profileImageType: "$profileJoblinks.profileImageType" } },
                      ],
                      as: "user",
                    },
                  },
                  {
                    $addFields: {
                      profileImage: { $first: "$user.profileImage" },
                      profileImageType: { $first: "$user.profileImageType" },
                      _id: { $first: "$user._id" },
                    },
                  },
                  {
                    $group: {
                      _id: "$_id",
                      profileImage: { $first: "$profileImage" },
                      profileImageType: { $first: "$profileImageType" },
                    },
                  },
                ],
                as: "applicants",
              },
            },
            //MasterIdMigration
            {
              $lookup: {
                from: "users",
                let: { joblinksId: selfJoblinksId },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$joblinksId"] } } },
                  { $project: { _id: 0, savedJobs: "$profileJoblinks.savedJobs" } },
                ],
                as: "savedJobs",
              },
            },
            {
              $addFields: {
                savedJobs: { $first: "$savedJobs.savedJobs" },
              },
            },
            {
              $set: {
                savedStatus: {
                  $cond: [{ $in: ["$_id", "$savedJobs"] }, true, false],
                },
              },
            },
            {
              $lookup: {
                from: "jobapplications",
                let: { jobId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$jobId", "$$jobId"] } },
                        { status: "applied" },
                        { userId: selfJoblinksId },
                      ],
                    },
                  },
                  { $project: { _id: 1 } },
                ],
                as: "isApplied",
              },
            },
            {
              $set: {
                isApplied: {
                  $cond: [{ $eq: [0, { $size: "$isApplied" }] }, false, true],
                },
              },
            },
            {
              $lookup: {
                from: "jobapplications",
                let: { jobId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$jobId", "$$jobId"] } },
                        { status: "shortlisted" },
                        { userId: selfJoblinksId },
                      ],
                    },
                  },
                  { $project: { _id: 1 } },
                ],
                as: "isShortlisted",
              },
            },
            {
              $set: {
                isShortlisted: {
                  $cond: [
                    { $eq: [0, { $size: "$isShortlisted" }] },
                    false,
                    true,
                  ],
                },
              },
            },
            { $match: { isShortlisted: false } },
            {
              $lookup: {
                from: "locatns",
                let: { value: "$jobLocation" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                  { $project: { type: 1, value: 1 } },
                ],
                as: "jobLocation",
              },
            },
            {
              $project: {
                applicants: 1,
                isApplied: 1,
                savedStatus: 1,
                jobType: 1,
                title: 1,
                jobLocation: { $first: "$jobLocation" },
                description: 1,
                startDate: 1,
                endDate: 1,
                deadline: 1,
                ageGroup: 1,
                gender: 1,
                createdAt: 1,
                updatedAt: 1,
                jobDetails: 1,
                experienceLevel: 1,
                height: 1,
              },
            },
          ],
          as: "openJobs",
        },
      },

      {
        $lookup: {
          from: "jobs",
          pipeline: [
            {
              $match: {  status: 'open',isClosed: false, jobType: "faces", createdBy: userId },
            },
            {
              $lookup: {
                from: "jobcategories",
                let: { jobCategory: "$jobCategory" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$jobCategory"] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      jobName: 1,
                      jobType: 1,
                      jobCategory: 1,
                    },
                  },
                ],
                as: "jobDetails",
              },
            },
            {
              $lookup: {
                from: "locatns",
                let: { value: "$jobLocation" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                  { $project: { type: 1, value: 1, } },
                ],
                as: "jobLocation",
              },
            },
            { $addFields: { jobLocation: { $first: "$jobLocation" } } },
            //MasterIdMigration
            {
              $lookup: {
                from: "users",
                let: { userId: "$createdBy" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  {
                    $project: {
                      type: 1,
                      name: 1,
                      username: 1,
                      profileImage: 1,
                      profileImageType: 1,
                      profile: {
                        name: "$profileJoblinks.name",
                        profileImage: "$profileJoblinks.profileImage",
                        profileImageType: "$profileJoblinks.profileImageType",
                      },
                    },
                  },
                ],
                as: "user",
              },
            },
            { $addFields: { user: { $first: "$user" } } },
            {
              $lookup: {
                from: "users",
                let: { userId: userId },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  { $project: { _id: 0, savedJobs: "$profileJoblinks.savedJobs" } },
                ],
                as: "savedJobs",
              },
            },
            { $addFields: { savedJobs: { $first: "$savedJobs.savedJobs" } } },
            { $addFields: { savedStatus: { $in: ["$_id", "$savedJobs"] } } },
            {
              $lookup: {
                from: "jobapplications",
                let: { jobId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$jobId", "$$jobId"] } },
                        { status: "applied" },
                        { userId: followerId },
                      ],
                    },
                  },
                  { $project: { _id: 1 } },
                ],
                as: "isApplied",
              },
            },
            {
              $set: {
                isApplied: {
                  $cond: [{ $eq: [0, { $size: "$isApplied" }] }, false, true],
                },
              },
            },
            {
              $lookup: {
                from: "jobapplications",
                let: { jobId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$jobId", "$$jobId"] } },
                        { userId: followerId },
                      ],
                    },
                  },
                  { $project: { _id: 0, status: 1 } },
                ],
                as: "applicationStatus",
              },
            },
            {
              $addFields: {
                applicationStatus: { $first: '$applicationStatus.status' },
              },
            },
            {
              $project: {
                jobIds: 0,
                jobsApplied: 0,
                jobCategory: 0,
                savedApplicants: 0,
                shortlistedApplicants: 0,
                hiredApplicants: 0,
                isClosed: 0,
                updatedAt: 0,
                createdByFaces: 0,
                createdByCrew: 0,
                savedJobs: 0,
              },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (pagination - 1) * 10 },
            { $limit: 10 },
          ],
          as: "jobsFaces",
        },
      },
      {
        $lookup: {
          from: "jobs",
          pipeline: [
            { $match: {  status: 'open',isClosed: false, jobType: "crew", createdBy: userId } },
            {
              $lookup: {
                from: "jobcategories",
                let: { jobCategory: "$jobCategory" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$jobCategory"] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      jobName: 1,
                      jobType: 1,
                      jobCategory: 1,
                    },
                  },
                ],
                as: "jobDetails",
              },
            },
            {
              $lookup: {
                from: "locatns",
                let: { value: "$jobLocation" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                  { $project: { type: 1, value: 1, } },
                ],
                as: "jobLocation",
              },
            },
            { $addFields: { jobLocation: { $first: "$jobLocation" } } },
            //MasterIdMigration
            {
              $lookup: {
                from: "users",
                let: { userId: "$createdBy" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  {
                    $project: {
                      type: 1,
                      name: 1,
                      username: 1,
                      profileImage: 1,
                      profileImageType: 1,
                      profile: {
                        name: "$profileJoblinks.name",
                        profileImage: "$profileJoblinks.profileImage",
                        profileImageType: "$profileJoblinks.profileImageType",
                      },
                    },
                  },
                ],
                as: "user",
              },
            },
            { $addFields: { user: { $first: "$user" } } },
            {
              $lookup: {
                from: "users",
                let: { userId: followerId },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  { $project: { _id: 0, savedJobs: "$profileJoblinks.savedJobs" } },
                ],
                as: "savedJobs",
              },
            },
            { $addFields: { savedJobs: { $first: "$savedJobs.savedJobs" } } },
            { $addFields: { savedStatus: { $in: ["$_id", "$savedJobs"] } } },

            {
              $lookup: {
                from: "jobapplications",
                let: { jobId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$jobId", "$$jobId"] } },
                        { status: "applied" },
                        { userId: followerId },
                      ],
                    },
                  },
                  { $project: { _id: 1 } },
                ],
                as: "isApplied",
              },
            },
            {
              $set: {
                isApplied: {
                  $cond: [{ $eq: [0, { $size: "$isApplied" }] }, false, true],
                },
              },
            },
            {
              $lookup: {
                from: "jobapplications",
                let: { jobId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$jobId", "$$jobId"] } },
                        { userId: followerId },
                      ],
                    },
                  },
                  { $project: { _id: 0, status: 1 } },
                ],
                as: "applicationStatus",
              },
            },
            {
              $addFields: {
                applicationStatus: { $first: '$applicationStatus.status' },
              },
            },
            {
              $project: {
                jobIds: 0,
                jobsApplied: 0,
                jobCategory: 0,
                savedApplicants: 0,
                shortlistedApplicants: 0,
                hiredApplicants: 0,
                isClosed: 0,
                updatedAt: 0,
                createdByFaces: 0,
                createdByCrew: 0,
                savedJobs: 0,
              },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (pagination - 1) * 10 },
            { $limit: 10 },
          ],
          as: "jobsCrew",
        },
      },
      {
        $lookup: {
          from: "invitations",
          let: { toId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ["$from", selfJoblinksId] } },
                  { $expr: { $eq: ["$to", "$$toId"] } },
                  { category: "job" },
                  { status: "invited" },
                ],
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "invitation",
        },
      },
      {
        $set: {
          invitationStatus: {
            $cond: [{ $eq: [0, { $size: "$invitation" }] }, false, true],
          },
        },
      },
      {
        $lookup: {
          from: "invitations",
          let: { toId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  { $expr: { $eq: ["$to", "$$toId"] } },
                  { category: "job" },
                  { status: "invited" },
                ],
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "Invites",
        },
      },
      {
        $lookup: {
          from: "jobapplications",
          let: { userId: userId },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$userId", "$$userId"] },
                status: "hired",
              },
            },
          ],
          as: "hired",
        },
      },
      { $set: { hired: { $size: "$hired" } } },
      { $set: { Invites: { $size: "$Invites" } } },
      { $addFields: { followStatus: 0 } },
      {
        $lookup: {
          from: "followers",
          let: { followeeId: "$_id" }, //master user Id
          pipeline: [
            {
              $match: {
                followerId: followerId,
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
                followerId: followerId,
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
          from: "hiringprofiles",
          let: { profileFaces: "$profileJoblinks.profileFaces" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$profileFaces"] } } },

            {
              $lookup: {
                from: "locatns",
                let: { value: "$interestedLoc" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                  {
                    $lookup: {
                      from: "locatns",
                      let: { value: "$scopes" },
                      pipeline: [
                        { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                        { $project: { type: 1, value: 1 } },
                        { $sort: { _id: -1 } },
                      ],
                      as: "scopes",
                    },
                  },
                  {
                    $project: {
                      type: 1,
                      value: {
                        $concat: [
                          "$value",
                          ", ",
                          {
                            $reduce: {
                              input: "$scopes",
                              initialValue: "",
                              in: {
                                $concat: [
                                  "$$value",
                                  {
                                    $cond: {
                                      if: { $eq: ["$$value", ""] },
                                      then: "",
                                      else: ", ",
                                    },
                                  },
                                  "$$this.value",
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "interestedLoc",
              },
            },
            {
              $project: {
                _id: 0,
                height: 1,
                weight: 1,
                bust: 1,
                waist: 1,
                hip: 1,
                eyeColor: 1,
                complexion: 1,
                interestedLoc: 1,
                interestCat: 1,
              },
            },
            {
              $lookup: {
                from: "jobcategories",
                let: { interestCat: "$interestCat" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$interestCat"] } } },
                  { $project: { jobName: 1, jobCategory: 1 } },
                ],
                as: "interestCat",
              },
            },
          ],
          as: "profileFaces",
        },
      },
      {
        $lookup: {
          from: "hiringprofiles",
          let: { profileCrew: "$profileJoblinks.profileCrew" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$profileCrew"] } } },

            {
              $lookup: {
                from: "locatns",
                let: { value: "$interestedLoc" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                  {
                    $lookup: {
                      from: "locatns",
                      let: { value: "$scopes" },
                      pipeline: [
                        { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                        { $project: { type: 1, value: 1 } },
                        { $sort: { _id: -1 } },
                      ],
                      as: "scopes",
                    },
                  },
                  {
                    $project: {
                      type: 1,
                      value: {
                        $concat: [
                          "$value",
                          ", ",
                          {
                            $reduce: {
                              input: "$scopes",
                              initialValue: "",
                              in: {
                                $concat: [
                                  "$$value",
                                  {
                                    $cond: {
                                      if: { $eq: ["$$value", ""] },
                                      then: "",
                                      else: ", ",
                                    },
                                  },
                                  "$$this.value",
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "interestedLoc",
              },
            },
            {
              $project: {
                _id: 0,
                workExperience: 1,
                achievements: 1,
                experienceLevel: 1,
                interestedLoc: 1,
                interestCat: 1,
              },
            },
            {
              $lookup: {
                from: "jobcategories",
                let: { interestCat: "$interestCat" },
                pipeline: [
                  { $match: { $expr: { $in: ["$_id", "$$interestCat"] } } },
                  { $project: { jobName: 1, jobCategory: 1 } },
                ],
                as: "interestCat",
              },
            },
          ],
          as: "profileCrew",
        },
      },
      { $set: { collabs: 0 } },
      {
        $lookup: {
          from: "locatns",
          let: { value: "$location" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
            { $project: { type: 1, value: 1 } },
          ],
          as: "location",
        },
      },
      {
        $lookup: {
          from: "jobs",
          let: { value: userId },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$createdBy", "$$value"] },
              },
            },
            {
              $project: {
                itemsCount: { $sum: { $size: "$hiredApplicants" } },
              },
            },
            {
              $group: {
                _id: "$userId",
                totalItemsCount: { $sum: "$itemsCount" }
              }
            },
            {
              $project: {
                _id: 0,
                totalItemsCount: 1
              }
            }
          ],
          as: "hiredByMe",
        },
      },
      {
        $addFields: { hiredByMe: { $first: '$hiredByMe.totalItemsCount' } }
      },
      {
        $project: {
          _id: 1,
          name: "$profileJoblinks.name",
          bio: "$profileJoblinks.bio",
          profession: "$profileJoblinks.profession",
          profileImage: "$profileJoblinks.profileImage",
          profileImageType: "$profileJoblinks.profileImageType",
          greetText: "$profileJoblinks.greetText",
          greetVideo: "$profileJoblinks.greetVideo",
          url: "$profileJoblinks.url",
          masterUser: {
            _id: "$_id",
            name: "$name",
            gender: "$gender",
            type: "$type",
            username: "$username",
            fameCoins: "$fameCoins",
            profileImage: "$profileImage",
            profileImageType: "$profileImageType",
            dob: "$dob",
            isVerified: "$isVerified",
            profile_type: "$profile_type",
            location: { $first: "$location" },
          },
          totalJobs: 1,
          followers: 1,
          Invites: 1,
          hiredByMe: 1,
          hired: 1,
          invitationStatus: 1,
          profileFaces: 1,
          profileCrew: 1,
          titlesWon: 1,
          trendzSet: 1,
          collabs: 1,
          followStatus: 1,
          openJobs: 1,
          jobsFaces: 1,
          jobsCrew: 1,
          ambassador: 1,
          posts: 1,
          location: { $first: "$location" },
        },
      },

    ]);
  }

  if (profileType == "brand") {
    return UserDB.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: "jobs",
          let: { createdBy: userId },
          pipeline: [
            { $match: { $expr: { $eq: ["$createdBy", "$$createdBy"] } } },
            { $project: { hiredApplicants: 1 } },
            { $set: { hiredApplicants: { $size: "$hiredApplicants" } } },
          ],
          as: "totalJobs",
        },
      },
      { $set: { TotalJobs: { $size: "$totalJobs" } } },
      { $set: { Hired: { $sum: "$totalJobs.hiredApplicants" } } },
      {
        $lookup: {
          from: "fametrendzs",
          let: { sponsor: "$masterUser._id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$sponsor", "$$sponsor"] } } },
            { $sort: { createdAt: -1 } },
            {
              $project: {
                hashTag: 1,
                for: 1,
                startDate: 1,
                category: 1,
                total: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$category", "post"] },
                        then: "$totalPost",
                      },
                      {
                        case: { $eq: ["$category", "participants"] },
                        then: "$totalParticipants",
                      },
                      {
                        case: { $eq: ["$category", "impression"] },
                        then: "$totalImpressions",
                      },
                    ],
                    default: 1, //No category defined
                  },
                },
                required: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$category", "post"] },
                        then: "$requiredPost",
                      },
                      {
                        case: { $eq: ["$category", "participants"] },
                        then: "$requiredParticipants",
                      },
                      {
                        case: { $eq: ["$category", "impression"] },
                        then: "$requiredImpressions",
                      },
                    ],
                    default: 0, //No category defined
                  },
                },
              },
            },
            {
              $set: {
                completed: {
                  $cond: {
                    if: { $eq: ["$required", 0] },
                    then: 0,
                    else: {
                      $multiply: [{ $divide: ["$total", "$required"] }, 100],
                    },
                  },
                },
              },
            },
            {
              $project: {
                total: 0,
                required: 0,
              },
            },
          ],
          as: "TrendzsSponsored",
        },
      },
      { $addFields: { TrendzsSponsoredCount: { $size: "$TrendzsSponsored" } } },
      {
        $lookup: {
          from: "jobs",
          let: { createdBy: userId },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$createdBy", "$$createdBy"] },
                status: 'open',
                isClosed: false,
              },
            },
          ],
          as: "openJobs",
        },
      },
      { $set: { OpenJobs: { $size: "$openJobs" } } },
      { $addFields: { followStatus: 0 } },
      {
        $lookup: {
          from: "followers",
          let: { followeeId: "$_id" }, //master user Id
          pipeline: [
            {
              $match: {
                followerId: followerId,
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
                followerId: followerId,
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
          from: "jobs",
          pipeline: [
            {
              $match: { 
                status: 'open', isClosed: false, jobType: "faces", createdBy: userId },
            },
            {
              $lookup: {
                from: "jobapplications",
                let: { joblinksId: userId },
                pipeline: [
                  { $match: { $expr: { $eq: ["$userId", "$$joblinksId"] } } },
                  { $project: { jobId: 1, _id: 0 } },
                ],
                as: "jobsApplied",
              },
            },
            { $addFields: { jobIds: "$jobsApplied.jobId" } },
            { $match: { $expr: { $not: [{ $in: ["$_id", "$jobIds"] }] } } },
            {
              $lookup: {
                from: "jobcategories",
                let: { jobCategory: "$jobCategory" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$jobCategory"] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      jobName: 1,
                      jobType: 1,
                      jobCategory: 1,
                    },
                  },
                ],
                as: "jobDetails",
              },
            },
            {
              $lookup: {
                from: "locatns",
                let: { value: "$jobLocation" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                  { $project: { type: 1, value: 1, } },
                ],
                as: "jobLocation",
              },
            },
            { $addFields: { jobLocation: { $first: "$jobLocation" } } },
            //MasterIdMigration
            {
              $lookup: {
                from: "users",
                let: { userId: "$createdBy" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  {
                    $project: {
                      type: 1,
                      name: 1,
                      username: 1,
                      profileImage: 1,
                      profileImageType: 1,
                      profile: {
                        name: "$profileJoblinks.name",
                        profileImage: "$profileJoblinks.profileImage",
                        profileImageType: "$profileJoblinks.profileImageType",
                      },
                    },
                  },
                ],
                as: "user",
              },
            },
            { $addFields: { user: { $first: "$user" } } },
            {
              $lookup: {
                from: "users",
                let: { userId: followerId },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  { $project: { _id: 0, savedJobs: "$profileJoblinks.savedJobs" } },
                ],
                as: "savedJobs",
              },
            },
            { $addFields: { savedJobs: { $first: "$savedJobs.savedJobs" } } },
            { $addFields: { savedStatus: { $in: ["$_id", "$savedJobs"] } } },
            {
              $lookup: {
                from: "jobapplications",
                let: { jobId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$jobId", "$$jobId"] } },
                        { status: "applied" },
                        { userId: followerId },
                      ],
                    },
                  },
                  { $project: { _id: 1 } },
                ],
                as: "isApplied",
              },
            },
            {
              $set: {
                isApplied: {
                  $cond: [{ $eq: [0, { $size: "$isApplied" }] }, false, true],
                },
              },
            },
            {
              $lookup: {
                from: "jobapplications",
                let: { jobId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$jobId", "$$jobId"] } },
                        { userId: followerId },
                      ],
                    },
                  },
                  { $project: { _id: 0, status: 1 } },
                ],
                as: "applicationStatus",
              },
            },
            {
              $addFields: {
                applicationStatus: { $first: '$applicationStatus.status' },
              },
            },
            {
              $project: {
                jobIds: 0,
                jobsApplied: 0,
                jobCategory: 0,
                savedApplicants: 0,
                shortlistedApplicants: 0,
                hiredApplicants: 0,
                isClosed: 0,
                updatedAt: 0,
                createdByFaces: 0,
                createdByCrew: 0,
                savedJobs: 0,
              },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (pagination - 1) * 10 },
            { $limit: 10 },
          ],
          as: "jobsFaces",
        },
      },
      {
        $lookup: {
          from: "jobs",
          pipeline: [
            { $match: {
              status: 'open', isClosed: false, jobType: "crew", createdBy: userId } },
            {
              $lookup: {
                from: "jobapplications",
                let: { joblinksId: userId },
                pipeline: [
                  { $match: { $expr: { $eq: ["$userId", "$$joblinksId"] } } },
                  { $project: { jobId: 1, _id: 0 } },
                ],
                as: "jobsApplied",
              },
            },
            { $addFields: { jobIds: "$jobsApplied.jobId" } },
            { $match: { $expr: { $not: [{ $in: ["$_id", "$jobIds"] }] } } },
            {
              $lookup: {
                from: "jobcategories",
                let: { jobCategory: "$jobCategory" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$jobCategory"] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      jobName: 1,
                      jobType: 1,
                      jobCategory: 1,
                    },
                  },
                ],
                as: "jobDetails",
              },
            },
            {
              $lookup: {
                from: "locatns",
                let: { value: "$jobLocation" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                  { $project: { type: 1, value: 1, } },
                ],
                as: "jobLocation",
              },
            },
            { $addFields: { jobLocation: { $first: "$jobLocation" } } },
            //MasterIdMigration
            {
              $lookup: {
                from: "users",
                let: { userId: "$createdBy" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  {
                    $project: {
                      type: 1,
                      name: 1,
                      username: 1,
                      profileImage: 1,
                      profileImageType: 1,
                      profile: {
                        name: "$profileJoblinks.name",
                        profileImage: "$profileJoblinks.profileImage",
                        profileImageType: "$profileJoblinks.profileImageType",
                      },
                    },
                  },
                ],
                as: "user",
              },
            },
            { $addFields: { user: { $first: "$user" } } },
            {
              $lookup: {
                from: "users",
                let: { userId: userId },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  { $project: { _id: 0, savedJobs: "$profileJoblinks.savedJobs" } },
                ],
                as: "savedJobs",
              },
            },
            { $addFields: { savedJobs: { $first: "$savedJobs.savedJobs" } } },
            { $addFields: { savedStatus: { $in: ["$_id", "$savedJobs"] } } },
            {
              $lookup: {
                from: "jobapplications",
                let: { jobId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        { $expr: { $eq: ["$jobId", "$$jobId"] } },
                        { userId: followerId },
                      ],
                    },
                  },
                  { $project: { _id: 0, status: 1 } },
                ],
                as: "applicationStatus",
              },
            },
            {
              $addFields: {
                applicationStatus: { $first: '$applicationStatus.status' },
              },
            },
            {
              $project: {
                jobIds: 0,
                jobsApplied: 0,
                jobCategory: 0,
                savedApplicants: 0,
                shortlistedApplicants: 0,
                hiredApplicants: 0,
                isClosed: 0,
                updatedAt: 0,
                createdByFaces: 0,
                createdByCrew: 0,
                savedJobs: 0,
              },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (pagination - 1) * 10 },
            { $limit: 10 },
          ],
          as: "jobsCrew",
        },
      },
      { $set: { collabs: 0 } },
      { $set: { clubOffers: 0 } },
      {
        $lookup: {
          from: "locatns",
          let: { value: "$location" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
            { $project: { type: 1, value: 1 } },
          ],
          as: "location",
        },
      },
      {
        $project: {
          _id: 1,
          name: "$profileJoblinks.name",
          bio: "$profileJoblinks.bio",
          profession: "$profileJoblinks.profession",
          profileImage: "$profileJoblinks.profileImage",
          profileImageType: "$profileJoblinks.profileImageType",
          greetText: "$profileJoblinks.greetText",
          greetVideo: "$profileJoblinks.greetVideo",
          url: "$profileJoblinks.url",
          masterUser: {
            _id: "$_id",
            name: "$name",
            gender: "$gender",
            type: "$type",
            username: "$username",
            fameCoins: "$fameCoins",
            profileImage: "$profileImage",
            profileImageType: "$profileImageType",
            dob: "$dob",
            isVerified: "$isVerified",
            profile_type: "$profile_type",
            location: { $first: "$location" },
          },
          TotalJobs: 1,
          Hired: 1,
          TrendzsSponsored: 1,
          TrendzsSponsoredCount: 1,
          OpenJobs: 1,
          clubOffers: 1,
          jobsFaces: 1,
          jobsCrew: 1,
          followStatus: 1,
          collabs: 1,
          location: { $first: "$location" },
        },
      },
    ]);
  }
  return;
};

exports.acceptRequest = (followerId, followeeId) => {
  return FollowerDB.updateOne(
    { followerId, followeeId },
    { acceptedDate: new Date() }
  );
};

exports.createStorelinks = async (data) => {
  return await UserDB.create(data);
};

exports.getStorelinks = (profileId, followerId, page) => {
  let pagination = page ? page : 1;
  return UserDB.aggregate([
    { $match: { _id: profileId } },

    {
      $lookup: {
        from: "visits",
        let: { brandId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$brandId", "$$brandId"] },
              type: "profile",
            },
          },
          {
            $group: {
              _id: "$brandId",
              count: { $sum: "$count" },
            },
          },
          { $project: { _id: 0, count: 1 } },
        ],
        as: "visits",
      },
    },

    { $addFields: { visits: { $first: "$visits.count" } } },

    {
      $lookup: {
        from: "visits",
        let: { brandId: "$_id" },
        pipeline: [
          {
            $match: { $expr: { $eq: ["$brandId", "$$brandId"] }, type: "url" },
          },
          {
            $group: {
              _id: "$brandId",
              count: { $sum: "$count" },
            },
          },
          { $project: { _id: 0, count: 1 } },
        ],
        as: "urlVisits",
      },
    },

    { $addFields: { urlVisits: { $first: "$urlVisits.count" } } },

    {
      $lookup: {
        from: "fametrendzs",
        let: { sponsor: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$sponsor", "$$sponsor"] } } },
          { $sort: { createdAt: -1 } },
          {
            $project: {
              hashTag: 1,
              for: 1,
              startDate: 1,
              category: 1,
              total: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$category", "post"] },
                      then: "$totalPost",
                    },
                    {
                      case: { $eq: ["$category", "participants"] },
                      then: "$totalParticipants",
                    },
                    {
                      case: { $eq: ["$category", "impression"] },
                      then: "$totalImpressions",
                    },
                  ],
                  default: 1, //No category defined
                },
              },
              required: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$category", "post"] },
                      then: "$requiredPost",
                    },
                    {
                      case: { $eq: ["$category", "participants"] },
                      then: "$requiredParticipants",
                    },
                    {
                      case: { $eq: ["$category", "impression"] },
                      then: "$requiredImpressions",
                    },
                  ],
                  default: 1, //No category defined
                },
              },
            },
          },
          {
            $set: {
              completed: {
                $cond: {
                  if: { $eq: ["$required", 0] },
                  then: 0,
                  else: {
                    $multiply: [{ $divide: ["$total", "$required"] }, 100],
                  },
                },
              },
            },
          },
          {
            $project: {
              total: 0,
              required: 0,
            },
          },
        ],
        as: "TrendzsSponsored",
      },
    },
    { $addFields: { TrendzsSponsoredCount: { $size: "$TrendzsSponsored" } } },
    { $addFields: { followStatus: 0 } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$_id" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: followerId,
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
              followerId: followerId,
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
      $set: {
        bannerMedia: {
          $map: {
            input: "$bannerMedia",
            as: "media",
            in: { $concat: ["$$media", "-", "xs"] },
          },
        },
      },
    },
    {
      $lookup: {
        from: "brandproducts",
        let: {
          userId: "$_id",
          // followStatus: "$followStatus",
          // profile_type: "$profile_type",
        },
        pipeline: [
          // {
          //   $match: {
          //     $expr: {
          //       $cond: [
          //         { $eq: ["$$followStatus", "Following"] },
          //         { $eq: ["$userId", "$$userId"] },
          //         {
          //           $and: [
          //             { $eq: ["$userId", "$$userId"] },
          //             { $eq: ["$$profile_type", "public"] },
          //           ],
          //         },
          //       ],
          //     },
          //   },
          // },
          { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
          { $sort: { createdAt: -1 } },
          { $project: { media: 1 } },
          {
            $set: {
              media: {
                $map: {
                  input: "$media",
                  as: "individualMedia",
                  in: { $concat: ["$$individualMedia.media", "-", "xs"] },
                },
              },
            },
          },
          { $skip: (pagination - 1) * 12 },
          { $limit: 12 },
        ],
        as: "products",
      },
    },
    { $set: { productsCount: { $size: "$products" } } },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        _id: 1,
        bannerMedia: "$profileStorelinks.bannerMedia",
        url: "$profileStorelinks.url",
        bio: "$profileStorelinks.bio",
        name: "$profileStorelinks.name",
        profession: "$profileStorelinks.profession",
        restrictedList: "$profileStorelinks.restrictedList",
        isRegistered: "$profileStorelinks.isRegistered",
        isBlocked: "$profileStorelinks.isBlocked",
        isDeleted: "$profileStorelinks.isDeleted",
        profileImage: "$profileStorelinks.profileImage",
        profileImageType: "$profileStorelinks.profileImageType",
        masterUser: {
          _id: "$_id",
          name: "$name",
          gender: "$gender",
          type: "$type",
          username: "$username",
          fameCoins: "$fameCoins",
          profileImage: "$profileImage",
          profileImageType: "$profileImageType",
          dob: "$dob",
          isVerified: "$isVerified",
          profile_type: "$profile_type",
          location: { $first: "$location" },
        },
        // visits: "$visits.count",
        visits: { $ifNull: ["$visits", 0] },
        // urlVisits: "$urlVisits.count",
        urlVisits: { $ifNull: ["$urlVisits", 0] },
        // urlVisits: 1,
        TrendzsSponsored: 1,
        TrendzsSponsoredCount: 1,
        products: 1,
        productsCount: 1,
        followStatus: 1,
      },
    },
  ]);
};

exports.updateStorelinks = (profileId, data) => {
  data = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [`profileStorelinks.${key}`, value])
  );
  return UserDB.updateOne({ _id: profileId }, { $set: data });
};

exports.createCollablinks = async (data) => {
  return await profileCollablinks.create(data);
};


//MasterIdMigration
exports.getSelfCollablinks = (profileId, followerId, page, masterId) => {
  let pagination = page ? page : 1;
  return UserDB.aggregate([
    { $match: { _id: profileId } },
    {
      $lookup: {
        from: "agencytags",
        let: { receiverId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$receiverId", "$$receiverId"] } },
                { status: "accepted" },
              ],
            },
          },
          { $project: { postId: 1 } },
        ],
        as: "collabs",
      },
    },
    { $addFields: { postId: "$collabs.postId" } },
    {
      $lookup: {
        from: "followlinks",
        let: { postId: "$postId" },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $in: ["$_id", "$$postId"],
                  },
                },
                { isDeleted: false },
                { isWelcomeVideo: { $exists: false } },
              ],
            },
          },
          { $project: { media: 1 } },
          {
            $set: {
              media: {
                $map: {
                  input: "$media",
                  as: "individualMedia",
                  in: {
                    type: "$$individualMedia.type",
                    media: { $concat: ["$$individualMedia.media", "-", "xs"] },
                  },
                },
              },
            },
          },
        ],
        as: "collabPosts",
      },
    },
    {
      $lookup: {
        from: "followlinks",
        let: { postId: "$postId" },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $in: ["$_id", "$$postId"],
                  },
                },
                { isDeleted: false },
                { isWelcomeVideo: { $exists: false } },
              ],
            },
          },
          { $project: { userId: 1 } },
          {
            $lookup: {
              from: "users",
              let: { profileFollowlinks: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$profileFollowlinks"],
                    },
                  },
                },
                { $sort: { createdAt: -1 } },
                {
                  $project: {
                    type: 1,
                    profileImage: 1,
                    profileImageType: 1,
                  },
                },
              ],
              as: "followlinksPosts",
            },
          },
          {
            $addFields: {
              userId: { $first: "$followlinksPosts._id" },
              type: { $first: "$followlinksPosts.type" },
              profileImage: { $first: "$followlinksPosts.profileImage" },
            },
          },
          {
            $group: {
              _id: "$_id",
              userId: { $first: "$userId" },
              type: { $first: "$type" },
              profileImage: { $first: "$profileImage" },
            },
          },
        ],
        as: "collabFollowlinks",
      },
    },
    {
      $lookup: {
        from: "fametrendzs",
        let: { sponsor: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$sponsor", "$$sponsor"] } } },
          {
            $project: {
              hashTag: 1,
              for: 1,
              startDate: 1,
              category: 1,
              total: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$category", "post"] },
                      then: "$totalPost",
                    },
                    {
                      case: { $eq: ["$category", "participants"] },
                      then: "$totalParticipants",
                    },
                    {
                      case: { $eq: ["$category", "impression"] },
                      then: "$totalImpressions",
                    },
                  ],
                  default: 1, //No category defined
                },
              },
              required: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$category", "post"] },
                      then: "$requiredPost",
                    },
                    {
                      case: { $eq: ["$category", "participants"] },
                      then: "$requiredParticipants",
                    },
                    {
                      case: { $eq: ["$category", "impression"] },
                      then: "$requiredImpressions",
                    },
                  ],
                  default: 0, //No category defined
                },
              },
            },
          },
          {
            $set: {
              completed: {
                $cond: {
                  if: { $eq: ["$required", 0] },
                  then: 0,
                  else: {
                    $multiply: [{ $divide: ["$total", "$required"] }, 100],
                  },
                },
              },
            },
          },
          {
            $project: {
              total: 0,
              required: 0,
            },
          },
        ],
        as: "TrendzsSponsored",
      },
    },
    { $addFields: { TrendzsSponsoredCount: { $size: "$TrendzsSponsored" } } },
    {
      $lookup: {
        from: "recommendations",
        let: { recommendedTo: "$_id" },
        pipeline: [
          { $match: { $expr: ["$recommendedTo", "$$recommendedTo"] } },
          { $project: { _id: 1 } },
        ],
        as: "recommendations",
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
              followerId: followerId,
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
              followerId: followerId,
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
      $addFields: {
        brandCollabs: {
          $filter: {
            input: "$collabFollowlinks",
            as: "collab",
            cond: { $eq: ["brand", "$$collab.type"] },
          },
        },
      },
    },
    {
      $addFields: {
        userCollabs: {
          $filter: {
            input: "$collabFollowlinks",
            as: "collab",
            cond: { $eq: ["individual", "$$collab.type"] },
          },
        },
      },
    },
    {
      $lookup: {
        from: "agencytags",
        let: { receiverId: masterId },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$receiverId", "$$receiverId"] } },
                { status: "pending" },
              ],
            },
          },
          { $project: { postId: 1 } },
        ],
        as: "collabRequests",
      },
    },
    { $set: { collabRequests: { $size: "$collabRequests" } } },
    {
      $lookup: {
        from: "collablinks",
        localField: "_id",
        foreignField: "userId",
        // let: {
        //   followStatus: "$followStatus",
        //   profile_type: "$profile_type",
        // },
        pipeline: [
          // {
          //   $match: {
          //     $expr: {
          //       $cond: [
          //         { $eq: ["$$followStatus", "Follow"] },
          //         true,
          //         { $eq: ["$$profile_type", "public"] },
          //       ],
          //     },
          //   },
          // },
          { $sort: { createdAt: -1 } },
          {
            $project: {
              media: 1,
            },
          },
          {
            $set: {
              media: {
                $map: {
                  input: "$media",
                  as: "individualMedia",
                  in: {
                    type: "$$individualMedia.type",
                    media: { $concat: ["$$individualMedia.media", "-", "xs"] },
                  },
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
          //{ $sort: { isWelcomeVideo: -1, createdAt: -1 } },
          { $skip: (pagination - 1) * 12 },
          { $limit: 12 },
        ],
        as: "posts",
      },
    },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        url: "$profileCollablinks.url",
        bio: "$profileCollablinks.bio",
        name: "$profileCollablinks.name",
        profession: "$profileCollablinks.profession",
        restrictedList: "$profileCollablinks.restrictedList",
        isRegistered: "$profileCollablinks.isRegistered",
        isBlocked: "$profileCollablinks.isBlocked",
        isDeleted: "$profileCollablinks.isDeleted",
        profileImage: "$profileCollablinks.profileImage",
        profileImageType: "$profileCollablinks.profileImageType",
        masterUser: {
          _id: "$_id",
          name: "$name",
          gender: "$gender",
          type: "$type",
          username: "$username",
          fameCoins: "$fameCoins",
          profileImage: "$profileImage",
          profileImageType: "$profileImageType",
          dob: "$dob",
          isVerified: "$isVerified",
          profile_type: "$profile_type",
          location: { $first: "$location" },
        },
        TrendzsSponsored: 1,
        TrendzsSponsoredCount: 1,
        // collabFunlinks: 1,
        // collabFollowlinks: 1,
        recommendations: { $size: "$recommendations" },
        // funlinksPosts: 1,
        // followlinksPosts: 1,
        posts: 1,
        collabPosts: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        Collabs: { $size: "$collabFollowlinks" },
        userCollabs: 1,
        brandCollabs: 1,
        collabRequests: 1,
      },
    },
  ]);
};

exports.getOtherCollablinks = (profileId, followerId, page) => {
  let pagination = page ? page : 1;
  return UserDB.aggregate([
    { $match: { _id: profileId } },

    {
      $lookup: {
        from: "agencytags",
        let: { receiverId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: ["$receiverId", "$$receiverId"] },
                { status: "accepted" },
              ],
            },
          },
          { $project: { postId: 1 } },
        ],
        as: "collabs",
      },
    },
    { $addFields: { postId: "$collabs.postId" } },
    {
      $lookup: {
        from: "followlinks",
        let: { postId: "$postId" },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $in: ["$_id", "$$postId"],
                  },
                },
                { isDeleted: false },
                { isWelcomeVideo: { $exists: false } },
              ],
            },
          },
          { $project: { media: 1 } },
          {
            $set: {
              media: {
                $map: {
                  input: "$media",
                  as: "individualMedia",
                  in: {
                    type: "$$individualMedia.type",
                    media: { $concat: ["$$individualMedia.media", "-", "xs"] },
                  },
                },
              },
            },
          },
        ],
        as: "collabPosts",
      },
    },
    {
      $lookup: {
        from: "followlinks",
        let: { postId: "$postId" },
        pipeline: [
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $in: ["$_id", "$$postId"],
                  },
                },
                { isDeleted: false },
                { isWelcomeVideo: { $exists: false } },
              ],
            },
          },
          { $project: { userId: 1 } },
          {
            $lookup: {
              from: "users",
              let: { profileFollowlinks: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$profileFollowlinks"],
                    },
                  },
                },
                { $sort: { createdAt: -1 } },
                {
                  $project: {
                    type: 1,
                    profileImage: 1,
                    profileImageType: 1,
                  },
                },
              ],
              as: "followlinksPosts",
            },
          },
          {
            $addFields: {
              userId: { $first: "$followlinksPosts._id" },
              type: { $first: "$followlinksPosts.type" },
              profileImage: { $first: "$followlinksPosts.profileImage" },
            },
          },
          {
            $group: {
              _id: "$_id",
              userId: { $first: "$userId" },
              type: { $first: "$type" },
              profileImage: { $first: "$profileImage" },
            },
          },
        ],
        as: "collabFollowlinks",
      },
    },
    {
      $lookup: {
        from: "fametrendzs",
        let: { sponsor: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$sponsor", "$$sponsor"] } } },
          {
            $project: {
              hashTag: 1,
              for: 1,
              startDate: 1,
              category: 1,
              total: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$category", "post"] },
                      then: "$totalPost",
                    },
                    {
                      case: { $eq: ["$category", "participants"] },
                      then: "$totalParticipants",
                    },
                    {
                      case: { $eq: ["$category", "impression"] },
                      then: "$totalImpressions",
                    },
                  ],
                  default: 1, //No category defined
                },
              },
              required: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$category", "post"] },
                      then: "$requiredPost",
                    },
                    {
                      case: { $eq: ["$category", "participants"] },
                      then: "$requiredParticipants",
                    },
                    {
                      case: { $eq: ["$category", "impression"] },
                      then: "$requiredImpressions",
                    },
                  ],
                  default: 0, //No category defined
                },
              },
            },
          },
          {
            $set: {
              completed: {
                $cond: {
                  if: { $eq: ["$required", 0] },
                  then: 0,
                  else: {
                    $multiply: [{ $divide: ["$total", "$required"] }, 100],
                  },
                },
              },
            },
          },
          {
            $project: {
              total: 0,
              required: 0,
            },
          },
        ],
        as: "TrendzsSponsored",
      },
    },
    { $addFields: { TrendzsSponsoredCount: { $size: "$TrendzsSponsored" } } },
    {
      $lookup: {
        from: "recommendations",
        let: { recommendedTo: "$_id" },
        pipeline: [
          { $match: { $expr: ["$recommendedTo", "$$recommendedTo"] } },
          { $project: { _id: 1 } },
        ],
        as: "recommendations",
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
              followerId: followerId,
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
              followerId: followerId,
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
    // {
    //   $addFields: {
    //     Collabs: {
    //       $setUnion: ["$collabFunlinks", "$collabFollowlinks"],
    //     },
    //   },
    // },
    {
      $addFields: {
        brandCollabs: {
          $filter: {
            input: "$collabFollowlinks",
            as: "collab",
            cond: { $eq: ["brand", "$$collab.type"] },
          },
        },
      },
    },
    {
      $addFields: {
        userCollabs: {
          $filter: {
            input: "$collabFollowlinks",
            as: "collab",
            cond: { $eq: ["individual", "$$collab.type"] },
          },
        },
      },
    },
    {
      $lookup: {
        from: "jobs",
        let: { createdBy: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$createdBy", "$$createdBy"] } } },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$jobLocation" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                { $project: { type: 1, value: 1 } },
              ],
              as: "jobLocation",
            },
          },
          {
            $project: {
              jobType: 1,
              title: 1,
              jobLocation: { $first: "$jobLocation" },
              description: 1,
              experienceLevel: 1,
              startDate: 1,
              endDate: 1,
              deadline: 1,
              ageGroup: 1,
              height: 1,
              gender: 1,
              jobCategory: 1,
            },
          },
          {
            $lookup: {
              from: "jobcategories",
              let: { jobCategory: "$jobCategory" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$jobCategory"] } } },
                { $project: { _id: 0, jobName: 1, jobCategory: 1 } },
              ],
              as: "jobDetails",
            },
          },
          { $project: { jobCategory: 0 } },
          {
            $lookup: {
              from: "users",
              let: { jobId: "$_id" },
              pipeline: [
                // { $match: { $expr: { $in: ["$$jobId", "$profileJoblinks.savedJobs"] } } },
                { $project: { _id: 1 } },
              ],
              as: "status",
            },
          },
          {
            $set: {
              status: {
                $cond: [{ $eq: [0, { $size: "$status" }] }, false, true],
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "jobs",
      },
    },
    {
      $lookup: {
        from: "collablinks",
        localField: "_id",
        foreignField: "userId",
        // let: {
        //   followStatus: "$followStatus",
        //   profile_type: "$profile_type",
        // },
        pipeline: [
          // {
          //   $match: {
          //     $expr: {
          //       $cond: [
          //         { $eq: ["$$followStatus", "Following"] },
          //         true,
          //         { $eq: ["$$profile_type", "public"] },
          //       ],
          //     },
          //   },
          // },
          { $sort: { createdAt: -1 } },
          {
            $project: {
              media: 1,
            },
          },
          {
            $set: {
              media: {
                $map: {
                  input: "$media",
                  as: "individualMedia",
                  in: {
                    type: "$$individualMedia.type",
                    media: { $concat: ["$$individualMedia.media", "-", "xs"] },
                  },
                },
              },
            },
          },
          //{ $sort: { isWelcomeVideo: -1, createdAt: -1 } },
          { $skip: (pagination - 1) * 12 },
          { $limit: 12 },
        ],
        as: "posts",
      },
    },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        url: "$profileCollablinks.url",
        bio: "$profileCollablinks.bio",
        name: "$profileCollablinks.name",
        profession: "$profileCollablinks.profession",
        restrictedList: "$profileCollablinks.restrictedList",
        isRegistered: "$profileCollablinks.isRegistered",
        isBlocked: "$profileCollablinks.isBlocked",
        isDeleted: "$profileCollablinks.isDeleted",
        profileImage: "$profileCollablinks.profileImage",
        profileImageType: "$profileCollablinks.profileImageType",
        masterUser: {
          _id: "$_id",
          name: "$name",
          gender: "$gender",
          type: "$type",
          username: "$username",
          fameCoins: "$fameCoins",
          profileImage: "$profileImage",
          profileImageType: "$profileImageType",
          dob: "$dob",
          isVerified: "$isVerified",
          profile_type: "$profile_type",
          location: { $first: "$location" },
        },
        TrendzsSponsored: 1,
        TrendzsSponsoredCount: 1,
        // collabFunlinks: 1,
        // collabFollowlinks: 1,
        recommendations: { $size: "$recommendations" },
        // funlinksPosts: 1,
        // followlinksPosts: 1,
        posts: 1,
        collabPosts: 1,
        followStatus: 1,
        // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        collabs: { $size: "$collabFollowlinks" },
        userCollabs: 1,
        brandCollabs: 1,
        jobs: 1,
      },
    },
  ]);
};

exports.updateCollablinks = (profileId, data) => {
  data = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [`profileCollablinks.${key}`, value])
  );
  return UserDB.updateOne({ _id: profileId }, { $set: data });
};

exports.checkBrandVisit = (profileId, type, brandId) => {
  return VisitDB.find({ profileId, type, brandId }).lean();
};

exports.createBrandVisit = (data) => {
  return VisitDB.create(data);
};

exports.updateBrandVisit = (_id, data) => {
  return VisitDB.updateOne({ _id }, { $set: data });
};

exports.getUserBySearch = (searchData) => {
  return UserDB.find(
    {
      $and: [
        { username: { $regex: `^.*?${searchData}.*?$`, $options: "x" } },
        { isDeleted: false },
        { isSuspended: false },
      ],
    },
    { _id: 1, username: 1 }
  )
    .limit(50)
    .lean();
};

exports.getproductBySearch = (searchData, challenges) => {
  return brandProductDB.aggregate([
    { $match: { $expr: { $in: ["$hashTag", challenges] } } },
    {
      $match: {
        $and: [
          { name: { $regex: `^.*?${searchData}.*?$`, $options: "x" } },
          { isDeleted: false },
          { $expr: { $in: ["$hashTag", challenges] } },
        ],
      },
    },
    { $project: { _id: 1, name: 1, allotedCoins: 1, hashTag: 1 } },
    {
      $lookup: {
        from: "challenges",
        let: { hashTag: "$hashTag" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$hashTag", "$$hashTag"] },
              type: "brand",
            },
          },
          { $project: { giftCoins: 1, _id: 0 } },
        ],
        as: "brandHashtag",
      },
    },
    { $addFields: { giftCoins: { $first: "$brandHashtag.giftCoins" } } },
    {
      $match: {
        $expr: { $gte: ["$allotedCoins", "$giftCoins"] },
      },
    },
    {
      $project: { allotedCoins: 0, hashTag: 0, brandHashtag: 0, giftCoins: 0 },
    },
  ]);
};

exports.updateSavedProducts = (masterUserId, data) => {
  return UserDB.updateOne({ _id: masterUserId }, data);
};

exports.getFameCoins = (userId) => {
  return UserDB.find({ _id: userId }, { fameCoins: 1 });
};

exports.getProductByHashtag = (hashTag) => {
  return brandProductDB.find({ hashTag: hashTag }, { _id: 0, name: 1 });
};

exports.getBrandProfileJoblinks = (userId, page) => {
  let pagination = page ? page : 1;
  return UserDB.aggregate([
    { $match: { _id: userId } },
    {
      $lookup: {
        from: "jobs",
        let: { createdBy: userId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$createdBy", "$$createdBy"] },
            },
          },
          {
            $project: {
              itemsCount: { $sum: { $size: "$hiredApplicants" } },
            },
          },
          {
            $group: {
              _id: "$userId",
              totalItemsCount: { $sum: "$itemsCount" }
            }
          },
          {
            $project: {
              _id: 0,
              totalItemsCount: 1
            }
          }
        ],
        as: "hired",
      },
    },
    { $set: { hired: { $first: "$hired.totalItemsCount" } } },
    {
      $lookup: {
        from: "jobs",
        let: { createdBy: userId },
        pipeline: [
          { $match: { $expr: { $eq: ["$createdBy", "$$createdBy"] } } },
        ],
        as: "totalJobs",
      },
    },
    { $set: { totalJobs: { $size: "$totalJobs" } } },
    {
      $lookup: {
        from: "jobs",
        let: { createdBy: userId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$createdBy", "$$createdBy"] },
              status: 'open',
              isClosed: false,
            },
          },
        ],
        as: "openJobsCount",
      },
    },
    { $set: { openJobsCount: { $size: "$openJobsCount" } } },
    {
      $lookup: {
        from: "jobs",
        let: { createdBy: userId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$createdBy", "$$createdBy"] },
              status: 'open',
              isClosed: false,
            },
          },
          {
            $lookup: {
              from: "jobcategories",
              let: { jobCategory: "$jobCategory" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$jobCategory"] } } },
                { $project: { jobName: 1, jobCategory: 1 } },
              ],
              as: "jobDetails",
            },
          },
          {
            $lookup: {
              from: "jobapplications",
              let: { jobId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$jobId", "$$jobId"] },
                    $or: [{ status: "applied" }, { status: "shortlisted" }],
                  },
                },
                { $project: { _id: 0, userId: 1 } },
                {
                  $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                      { $project: { profileImage: "$profileJoblinks.profileImage", profileImageType: "$profileJoblinks.profileImageType" } },
                    ],
                    as: "user",
                  },
                },
                {
                  $addFields: {
                    profileImage: { $first: "$user.profileImage" },
                    profileImageType: { $first: "$user.profileImageType" },
                    _id: { $first: "$user._id" },
                  },
                },
                {
                  $group: {
                    _id: "$_id",
                    profileImage: { $first: "$profileImage" },
                    profileImageType: { $first: "$profileImageType" },
                  },
                },
              ],
              as: "applicants",
            },
          },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$jobLocation" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                { $project: { type: 1, value: 1 } },
              ],
              as: "jobLocation",
            },
          },
          {
            $lookup: {
              from: "jobapplications",
              let: { jobId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                      { $expr: { $eq: ["$userId", userId] } },
                      { status: "applied" },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "isApplied",
            },
          },
          {
            $set: {
              isApplied: {
                $cond: [{ $eq: [0, { $size: "$isApplied" }] }, false, true],
              },
            },
          },
          {
            $project: {
              applicants: 1,
              jobType: 1,
              title: 1,
              jobLocation: { $first: "$jobLocation" },
              description: 1,
              startDate: 1,
              endDate: 1,
              deadline: 1,
              ageGroup: 1,
              gender: 1,
              createdAt: 1,
              updatedAt: 1,
              jobDetails: 1,
              experienceLevel: 1,
              height: 1,
              isApplied: 1,
            },
          },
        ],
        as: "openJobs",
      },
    },
    {
      $lookup: {
        from: "jobs",
        pipeline: [
          {
            $match: { 
              status: 'open',isClosed: false, jobType: "faces", createdBy: userId },
          },
          {
            $lookup: {
              from: "jobapplications",
              let: { jobId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                      { $expr: { $eq: ["$userId", userId] } },
                      { status: "shortlisted" },
                    ],
                  },
                },
                { $project: { jobId: 1, _id: 0 } },
              ],
              as: "jobShortlisted",
            },
          },
          { $addFields: { jobIds: "$jobShortlisted.jobId" } },
          { $match: { $expr: { $not: [{ $in: ["$_id", "$jobIds"] }] } } },
          {
            $lookup: {
              from: "jobapplications",
              let: { jobId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                      { $expr: { $eq: ["$userId", userId] } },
                      { status: "applied" },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "isApplied",
            },
          },
          {
            $set: {
              isApplied: {
                $cond: [{ $eq: [0, { $size: "$isApplied" }] }, false, true],
              },
            },
          },
          {
            $lookup: {
              from: "jobcategories",
              let: { jobCategory: "$jobCategory" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$jobCategory"] },
                  },
                },
                { $project: { jobName: 1, jobCategory: 1 } },
              ],
              as: "jobDetails",
            },
          },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$jobLocation" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                { $project: { type: 1, value: 1, } },
              ],
              as: "jobLocation",
            },
          },
          { $addFields: { jobLocation: { $first: "$jobLocation" } } },
          {
            $lookup: {
              from: "users",
              let: { userId: "$createdBy" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { _id: 0, name: "$profileJoblinks.name" } },
              ],
              as: "createdBy",
            },
          },
          { $addFields: { createdBy: { $first: "$createdBy" } } },
          {
            $lookup: {
              from: "users",
              let: { userId: userId },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { _id: 0, savedJobs: "$profileJoblinks.savedJobs" } },
              ],
              as: "savedJobs",
            },
          },
          { $addFields: { savedJobs: { $first: "$savedJobs.savedJobs" } } },
          { $addFields: { savedStatus: { $in: ["$_id", "$savedJobs"] } } },
          {
            $project: {
              jobIds: 0,
              jobShortlisted: 0,
              jobCategory: 0,
              savedApplicants: 0,
              shortlistedApplicants: 0,
              hiredApplicants: 0,
              isClosed: 0,
              updatedAt: 0,
              createdByFaces: 0,
              createdByCrew: 0,
              savedJobs: 0,
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "jobsFaces",
      },
    },
    {
      $lookup: {
        from: "jobs",
        pipeline: [
          { $match: {
            status: 'open', isClosed: false, jobType: "crew", createdBy: userId } },
          {
            $lookup: {
              from: "jobapplications",
              let: { jobId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                      { $expr: { $eq: ["$userId", userId] } },
                      { status: "shortlisted" },
                    ],
                  },
                },
                { $project: { jobId: 1, _id: 0 } },
              ],
              as: "jobsShortlisted",
            },
          },
          { $addFields: { jobIds: "$jobsShortlisted.jobId" } },
          { $match: { $expr: { $not: [{ $in: ["$_id", "$jobIds"] }] } } },
          {
            $lookup: {
              from: "jobapplications",
              let: { jobId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                      { $expr: { $eq: ["$userId", userId] } },
                      { status: "applied" },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "isApplied",
            },
          },
          {
            $set: {
              isApplied: {
                $cond: [{ $eq: [0, { $size: "$isApplied" }] }, false, true],
              },
            },
          },
          {
            $lookup: {
              from: "jobcategories",
              let: { jobCategory: "$jobCategory" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$jobCategory"] },
                  },
                },
                { $project: { jobName: 1, jobCategory: 1 } },
              ],
              as: "jobDetails",
            },
          },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$jobLocation" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
                { $project: { type: 1, value: 1, } },
              ],
              as: "jobLocation",
            },
          },
          { $addFields: { jobLocation: { $first: "$jobLocation" } } },
          {
            $lookup: {
              from: "users",
              let: { userId: "$createdBy" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { _id: 0, name: "$profileJoblinks.name" } },
              ],
              as: "createdBy",
            },
          },
          { $addFields: { createdBy: { $first: "$createdBy" } } },
          {
            $lookup: {
              from: "users",
              let: { userId: userId },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { _id: 0, savedJobs: "$profileJoblinks.savedJobs" } },
              ],
              as: "savedJobs",
            },
          },
          { $addFields: { savedJobs: { $first: "$savedJobs.savedJobs" } } },
          { $addFields: { savedStatus: { $in: ["$_id", "$savedJobs"] } } },
          {
            $project: {
              jobIds: 0,
              jobsShortlisted: 0,
              jobCategory: 0,
              savedApplicants: 0,
              shortlistedApplicants: 0,
              hiredApplicants: 0,
              isClosed: 0,
              updatedAt: 0,
              createdByFaces: 0,
              createdByCrew: 0,
              savedJobs: 0,
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "jobsCrew",
      },
    },
    {
      $lookup: {
        from: "chats",
        let: { masterUser: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $in: ["$$masterUser", "$members"] } },
                { category: "jobChat" },
                { $expr: { $in: ["$$masterUser", "$readBy"] } },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "chats",
      },
    },
    {
      $lookup: {
        from: "chats",
        let: { masterUser: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $in: ["$$masterUser", "$members"] } },
                { category: "jobChat" },
                { $expr: { $not: { $in: ["$$masterUser", "$readBy"] } } },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "unreadChats",
      },
    },
    {
      $lookup: {
        from: "invitations",
        let: { from: userId },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$from", "$$from"] } },
                { category: "job" },
                { status: "invited" },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "InvitesSent",
      },
    },
    { $set: { InvitesSent: { $size: "$InvitesSent" } } },
    { $set: { chats: { $size: "$chats" } } },
    { $set: { unreadChats: { $size: "$unreadChats" } } },
    { $set: { openJobsCount: { $size: "$openJobs" } } },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        _id: 1,
        name: "$profileJoblinks.name",
        bio: "$profileJoblinks.bio",
        profession: "$profileJoblinks.profession",
        profileImage: "$profileJoblinks.profileImage",
        profileImageType: "$profileJoblinks.profileImageType",
        savedTalents: "$profileJoblinks.savedTalents",
        masterUser: {
          _id: "$_id",
          name: "$name",
          gender: "$gender",
          type: "$type",
          username: "$username",
          fameCoins: "$fameCoins",
          profileImage: "$profileImage",
          profileImageType: "$profileImageType",
          dob: "$dob",
          isVerified: "$isVerified",
          profile_type: "$profile_type",
          location: { $first: "$location" },
        },
        chats: 1,
        unreadChats: 1,
        totalJobs: 1,
        openJobsCount: 1,
        hired: { $ifNull: ['$hired', 0] },
        openJobs: 1,
        jobsFaces: 1,
        jobsCrew: 1,
        InvitesSent: 1,
        location: { $first: "$location" },
      },
    },
  ]);
};

exports.getAgencyProfileJoblinks = (userId) => {
  return UserDB.aggregate([
    { $match: { _id: userId } },

    {
      $lookup: {
        from: "hiringprofiles",
        let: { profileId: "$profileJoblinks.profileCrew" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
          {
            $lookup: {
              from: "jobcategories",
              let: { interestCat: "$interestCat" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$interestCat"] } } },
                { $project: { jobName: 1, jobCategory: 1 } },
              ],
              as: "interestCat",
            },
          },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$interestedLoc" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                {
                  $lookup: {
                    from: "locatns",
                    let: { value: "$scopes" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                      { $project: { type: 1, value: 1 } },
                      { $sort: { _id: -1 } },
                    ],
                    as: "scopes",
                  },
                },
                {
                  $project: {
                    type: 1,
                    value: {
                      $concat: [
                        "$value",
                        ", ",
                        {
                          $reduce: {
                            input: "$scopes",
                            initialValue: "",
                            in: {
                              $concat: [
                                "$$value",
                                {
                                  $cond: {
                                    if: { $eq: ["$$value", ""] },
                                    then: "",
                                    else: ", ",
                                  },
                                },
                                "$$this.value",
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
              as: "interestedLoc",
            },
          },
          {
            $project: {
              _id: 0,
              workExperience: 1,
              achievements: 1,
              experienceLevel: 1,
              interestedLoc: 1,
              interestCat: 1,
            },
          },
        ],
        as: "crew",
      },
    },
    { $set: { crew: { $first: "$crew" } } },
    {
      $lookup: {
        from: "jobs",
        let: { createdBy: userId },
        pipeline: [
          { $match: { $expr: { $eq: ["$createdBy", "$$createdBy"] } } },
        ],
        as: "totalJobs",
      },
    },
    {
      $lookup: {
        from: "jobs",
        let: { createdBy: userId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$createdBy", "$$createdBy"] },
              status: 'open',
              isClosed: false,
            },
          },
          {
            $lookup: {
              from: "jobcategories",
              let: { jobCategory: "$jobCategory" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$jobCategory"] } } },
                { $project: { jobName: 1, jobCategory: 1 } },
              ],
              as: "jobDetails",
            },
          },
          {
            $lookup: {
              from: "jobapplications",
              let: { jobId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$jobId", "$$jobId"] },
                    $or: [{ status: "applied" }, { status: "shortlisted" }],
                  },
                },
                { $project: { _id: 0, userId: 1 } },
                {
                  $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                      { $project: { profileImage: "$profileJoblinks.profileImage", profileImageType: "$profileJoblinks.profileImageType" } },
                    ],
                    as: "user",
                  },
                },
                {
                  $addFields: {
                    profileImage: { $first: "$user.profileImage" },
                    profileImageType: { $first: "$user.profileImageType" },
                    _id: { $first: "$user._id" },
                  },
                },
                {
                  $group: {
                    _id: "$_id",
                    profileImage: { $first: "$profileImage" },
                    profileImageType: { $first: "$profileImageType" },
                  },
                },
              ],
              as: "applicants",
            },
          },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$jobLocation" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$value"] } } },
                { $project: { type: 1, value: 1 } },
              ],
              as: "location",
            },
          },
          {
            $project: {
              applicants: 1,
              jobType: 1,
              title: 1,
              jobLocation: { $first: "$location" },
              description: 1,
              startDate: 1,
              endDate: 1,
              ageGroup: 1,
              gender: 1,
              createdAt: 1,
              updatedAt: 1,
              jobDetails: 1,
              experienceLevel: 1,
            },
          },
        ],
        as: "openJobs",
      },
    },
    {
      $lookup: {
        from: "chats",
        let: { masterUser: "$masterUser._id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $in: ["$$masterUser", "$members"] } },
                { category: "jobChat" },
                { $expr: { $in: ["$$masterUser", "$readBy"] } },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "chats",
      },
    },
    {
      $lookup: {
        from: "chats",
        let: { masterUser: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $in: ["$$masterUser", "$members"] } },
                { category: "jobChat" },
                { $expr: { $not: { $in: ["$$masterUser", "$readBy"] } } },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "unreadChats",
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: userId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "hired",
            },
          },
        ],
        as: "hired",
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: userId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "shortlisted",
            },
          },
        ],
        as: "shortlisted",
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: userId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "applied",
            },
          },
        ],
        as: "applied",
      },
    },

    { $set: { totalJobs: { $size: "$totalJobs" } } },
    { $set: { openJobs: { $size: "$openJobs" } } },
    { $set: { hired: { $size: "$hired" } } },
    { $set: { applied: { $size: "$applied" } } },
    { $set: { shortlisted: { $size: "$shortlisted" } } },
    { $set: { chats: { $size: "$chats" } } },
    { $set: { unreadChats: { $size: "$unreadChats" } } },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        _id: 1,
        username: 1,
        dob: 1,
        fameCoins: 1,
        profileImage: 1,
        profileImageType: 1,
        isVerified: 1,
        type: 1,
        profile: {
          name: "$profileJoblinks.name",
          bio: "$profileJoblinks.bio",
          profession: "$profileJoblinks.profession",
          profileImage: "$profileJoblinks.profileImage",
          profileImageType: "$profileJoblinks.profileImageType",
          greetText: "$profileJoblinks.greetText",
          greetVideo: "$profileJoblinks.greetVideo",
          savedTalents: "$profileJoblinks.savedTalents",
        },
        chats: 1,
        unreadChats: 1,
        totalJobs: 1,
        openJobs: 1,
        hired: 1,
        applied: 1,
        shortlisted: 1,
        location: { $first: "$location" },
        crew: 1,
        // funlinksPosts: 1,
        // followlinksPosts: 1,
      },
    },
  ]);
};

exports.updateProfileJoblinks = (userId, data) => {
  data = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [`profileJoblinks.${key}`, value])
  );
  return UserDB.updateOne({ _id: userId }, { $set: data });
};

exports.createProfileJoblinks = (userData) => {
  return UserDB.create(userData);
};

exports.createHiringProfile = (data) => {
  return hiringprofile.create(data);
};

exports.getTodaysInvites = (userId) => {
  exports.todaysDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  return invitationsDB
    .find({ userId, createdAt: { $gte: todaysDate } })
    .count();
};

exports.checkInvitation = (jobId, toId, userId, category, jobType) => {
  return invitationsDB.findOne({
    jobId: jobId,
    from: userId,
    to: toId,
    category: category,
    jobType: jobType,
  });
};

exports.getInvitation = (jobId, toId) => {
  return invitationsDB.findOne({
    jobId: jobId,
    to: toId,
    category: 'job',
  }).lean();
};

exports.inviteToFollow = (userId, selfId, action) => {
  if (action == "send") {
    return invitationsDB.create({
      from: selfId,
      to: userId,
      status: "invited",
      category: "follow",
    });
  }

  if (action == "withdraw") {
    return invitationsDB.updateOne(
      { from: selfId, to: userId, category: "follow" },
      { status: "withdrawn" }
    );
  }
};

exports.getInviteSuggestions = (selfMasterId, page) => {
  let pagination = page ? page : 1;
  return UserDB.aggregate([
    { $match: { isDeleted: false, isSuspended: false } },
    { $match: { _id: { $ne: selfMasterId } } },
    {
      $lookup: {
        from: "invitations",
        let: { to: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$to", "$$to"] } },
                { from: selfMasterId },
                { category: "follow" },
              ],
            },
          },
        ],
        as: "invitations",
      },
    },
    { $match: { $expr: { $eq: [0, { $size: "$invitations" }] } } },
    {
      $lookup: {
        from: "followers",
        let: { followerId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$followerId", "$$followerId"] } },
                { followeeId: selfMasterId },
                { acceptedDate: { $ne: null } },
                { type: "user" },
              ],
            },
          },
        ],
        as: "followStatus",
      },
    },
    { $match: { $expr: { $eq: [0, { $size: "$followStatus" }] } } },

    { $sort: { updatedAt: -1 } },
    { $project: { _id: 1, profileImage: 1, profileImageType: 1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.getUsers = (selfMasterId, search, page) => {
  let pagination = page ? page : 1;
  return UserDB.aggregate([
    {
      $match: {
        name: { $regex: `^${search}.*`, $options: "x" },
        isDeleted: false,
        isSuspended: false,
      },
    },
    {
      $lookup: {
        from: "users",
        pipeline: [
          { $match: { _id: selfMasterId } },
          { $project: { blockList: 1, _id: 0 } },
        ],
        as: "selfMasterProfile",
      },
    },
    { $addFields: { blockList: { $first: "$selfMasterProfile.blockList" } } },
    { $match: { $expr: { $not: { $in: ["$_id", "$blockList"] } } } },
    { $addFields: { followStatus: 0 } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$_id" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: selfMasterId,
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
              followerId: selfMasterId,
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

    { $sort: { updatedAt: -1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
    {
      $lookup: {
        from: "locatns",
        let: { value: "$location" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$value"] } } },
          { $project: { type: 1, value: 1 } },
        ],
        as: "location",
      },
    },
    {
      $project: {
        name: 1,
        location: { $first: "$location" },
        gender: 1,
        ageGroup: 1,
        profileImage: 1,
        profileImageType: 1,
        type: 1,
        profileFamelinks: 1,
        profileStorelinks: 1,
        profileCollablinks: 1,
        followStatus: 1,
      },
    },
  ]);
};

//MasterIdMigration
exports.deleteProfileFamelinks = async (profileId, masterId) => {
  await UserDB.updateOne(
    { _id: ObjectId(masterId) },
    { $unset: { profileFamelinks: 1 } }
  );
};

exports.deleteProfileStorelinks = async (profileId, masterId) => {
  await profileStorelinks.deleteOne({ _id: ObjectId(profileId) });
  await UserDB.updateOne(
    { _id: ObjectId(masterId) },
    { $unset: { profileStorelinks: 1 } }
  );
};

exports.deleteProfileCollablinks = async (profileId, masterId) => {
  await profileCollablinks.deleteOne({ _id: ObjectId(profileId) });
  await UserDB.updateOne(
    { _id: ObjectId(masterId) },
    { $unset: { profileCollablinks: 1 } }
  );
};

exports.getUserProfileFollowlinks = async (profileId) => {
  return await UserDB.findOne({ _id: ObjectId(profileId) }, { profileFollowlinks: 1 });
};

//MasterIdMigration
exports.getUserProfileFamelinks = async (profileId) => {
  return await UserDB.findOne({ _id: ObjectId(profileId) }, { profileFamelinks: 1 });
};

exports.getAgencyBySearch = async (searchData, selfMasterId) => {
  return UserDB.aggregate([
    {
      $match: {
        $and: [
          { type: "agency" },
          { _id: { $ne: selfMasterId } },
          { username: { $regex: `^.*?${searchData}.*?$`, $options: "x" } },
          { isDeleted: false },
        ],
      },
    },
    { $project: { name: 1, username: 1 } },
    { $addFields: { followStatus: 0 } },
    {
      $lookup: {
        from: "followers",
        let: { followeeId: "$_id" }, //master user Id
        pipeline: [
          {
            $match: {
              followerId: selfMasterId,
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
              followerId: selfMasterId,
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
    { $project: { following: 0, requested: 0 } },
    { $sort: { createdAt: -1 } },
  ]);
};

exports.addAgencyTags = (receiverId, postId, status) => {
  return agencyTags.create({ receiverId, postId, status });
};

exports.updateAgencyTag = (_id, postId) => {
  return agencyTags.updateOne({ _id: _id }, { postId: postId });
};

exports.getAgencyTag = (receiverId) => {
  return agencyTags.findOne({ receiverId: receiverId }).lean();
};

exports.getTagByPostId = (postId, receiverId) => {
  return agencyTags.findOne({ postId: postId, receiverId: receiverId }).lean();
};

exports.acceptRejectTag = (postId, receiverId, action) => {
  if (action == "accept") {
    return agencyTags.updateOne(
      { postId: postId, receiverId: receiverId },
      { status: "accepted" }
    );
  }

  if (action == "reject") {
    return agencyTags.deleteOne({ postId: postId, receiverId: receiverId });
  }
};

exports.deleteTag = (postId) => {
  return agencyTags.deleteOne({ postId: postId });
};

exports.getUserFamelinksImage = (userId) => {
  return UserDB
    .findOne({ _id: userId }, { profileImage: "$profileFamelinks.profileImage", profileImageType: "$profileFamelinks.profileImageType" })
    .lean();
};

exports.getUserFunlinksImage = (userId) => {
  return UserDB
    .findOne({ _id: userId }, { profileImage: "$profileFunlinks.profileImage", profileImageType: "$profileFunlinks.profileImageType" })
    .lean();
};

exports.getUserFollowlinksImage = (userId) => {
  return UserDB
    .findOne({ _id: userId }, { profileImage: "$profileFollowlinks.profileImage", profileImageType: "$profileFollowlinks.profileImageType" })
    .lean();
};

exports.getUserJoblinksImage = (userId) => {
  return UserDB
    .findOne({ _id: userId }, { profileImage: "$profileJoblinks.profileImage", profileImageType: "$profileJoblinks.profileImageType" })
    .lean();
};

exports.getUserStorelinksImage = (userId) => {
  return UserDB
    .findOne({ _id: userId }, { profileImage: "$profileStorelinks.profileImage", profileImageType: "$profileStorelinks.profileImageType" })
    .lean();
};

exports.getUserCollablinksImage = (userId) => {
  return UserDB
    .findOne({ _id: userId }, { profileImage: "$profileCollablinks.profileImage", profileImageType: "$profileCollablinks.profileImageType" })
    .lean();
};

exports.followRequest = (followerId, followeeId, type, postId) => {
  return FollowerDB.updateOne(
    {
      followerId,
      followeeId,
    },
    {
      followerId,
      followeeId,
      type,
      postId,
    },
    {
      upsert: true,
    }
  );
};

exports.updateprofileImage = (masterId) => {
  return UserDB.updateOne(
    { _id: ObjectId(masterId) },
    { profileImage: null, profileImageType: null }
  );
};

//MasterIdMigration
exports.getStorelinksProfile = (profileId) => {
  return UserDB.findOne({ _id: ObjectId(profileId), profileStorelinks: { $exists: true, $ne: null } }).lean();
};

//MasterIdMigration
exports.getFamelinksProfile = (profileId) => {
  return UserDB.findOne({ _id: ObjectId(profileId), profileFamelinks: { $exists: true, $ne: null } }).lean();
};

//MasterIdMigration
exports.getFollowlinksProfile = (profileId) => {
  return UserDB.findOne({ _id: ObjectId(profileId), profileFollowlinks: { $exists: true, $ne: null } }).lean();
};

//MasterIdMigration
exports.getFunlinksProfile = (profileId) => {
  return UserDB.findOne({ _id: ObjectId(profileId), profileFunlinks: { $exists: true, $ne: null } }).lean();
};

//MasterIdMigration
exports.getJoblinksProfile = (profileId) => {
  return UserDB.findOne({ _id: ObjectId(profileId), profileJoblinks: { $exists: true, $ne: null } }).lean();
};

//MasterIdMigration
exports.getCollablinksProfile = (profileId) => {
  return UserDB.findOne({ _id: ObjectId(profileId), profileCollablinks: { $exists: true, $ne: null } }).lean();
};

//MasterIdMigration
exports.updateFamelinksImage = (profileId) => {
  return UserDB.updateOne(
    { _id: ObjectId(profileId) },
    { "profileFamelinks.profileImage": null, "profileFamelinks.profileImageType": null }
  );
};

exports.updateFunlinksImage = (profileId) => {
  return UserDB.updateOne(
    { _id: ObjectId(profileId) },
    { "profileFunlinks.profileImage": null, "profileFunlinks.profileImageType": null }
  );
};

exports.updatejoblinksImage = (profileId) => {
  return UserDB.updateOne(
    { _id: ObjectId(profileId) },
    { "profileJoblinks.profileImage": null, "profileJoblinks.profileImageType": null }
  );
};

exports.updateStorelinksImage = (profileId) => {
  return UserDB.updateOne(
    { _id: ObjectId(profileId) },
    { "profileStorelinks.profileImage": null, "profileStorelinks.profileImageType": null }
  );
};

exports.updateCollablinksImage = (
  profileId) => {
  return UserDB.updateOne(
    { _id: ObjectId(profileId) },
    { "profileCollablinks.profileImage": null, "profileCollablinks.profileImageType": null }
  );
};

exports.updateFollowlinksImage = (
  profileId) => {
  return UserDB.updateOne(
    { _id: ObjectId(profileId) },
    { "profileFollowlinks.profileImage": null, "profileFollowlinks.profileImageType": null }
  );
};

exports.getHiringProfile = (profileId, type) => {
  return hiringprofile
    .findOne({ userId: ObjectId(profileId), type: type }, { userId: 1 })
    .lean();
};

exports.getOneProduct = (productId) => {
  return brandProductDB.findOne({ _id: ObjectId(productId), isDeleted: false });
};

exports.deleteProduct = (productId) => {
  return brandProductDB.deleteOne({ _id: ObjectId(productId) });
};

exports.getSavedBrandProducts = (userId, page) => {
  let pagination = page ? page : 1;
  return brandProductDB.aggregate([
    {
      $match: {
        $and: [{ isSafe: true }, { isDeleted: false }],
      },
    },
    {
      $lookup: {
        from: "users",
        let: { userId: userId, productId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          { $project: { _id: 0, savedProducts: 1 } },
          {
            $match: { $expr: { $in: ["$$productId", "$savedProducts"] } },
          },
        ],
        as: "savedProducts",
      },
    },
    {
      $set: {
        savedProducts: {
          $cond: [{ $ne: [0, { $size: "$saved" }] }, true, false],
        },
      },
    },
    { $match: { savedProducts: true } },
    { $sort: { createdAt: -1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.getNotificationByTagId = (tagId) => {
  return NotificationDB.findOne({ tagId: ObjectId(tagId) });
};

exports.deleteNotification = (tagId) => {
  return NotificationDB.deleteOne({ tagId: ObjectId(tagId) });
};

exports.offlineUser = (data) => {
  return UserDB.updateOne(
    { _id: data.id, inChat: { $ne: null } },
    { $set: { inChat: null } }
  );
};

exports.offlineUser = (data) => {
  return UserDB.updateOne(
    { _id: data.id, inChat: { $ne: null } },
    { $set: { inChat: null } }
  );
};

exports.getWinners = (data) => {
  return WinnerDB.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              { district: data.district },
              { state: data.state },
              { country: data.country },
            ],
          },
          { ageGroup: data.ageGroup },
          { year: data.year },
        ],
      },
    },
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
              type: 1,
              name: 1,
              username: 1,
              profileImage: 1,
              profileImageType: 1,
              fameProfile: "$profileFamelinks",
            },
          },
        ],
        as: "users",
      },
    },
    {
      $project: {
        title: 1,
        userId: 1,
        type: { $arrayElemAt: ["$users.type", 0] },
        name: { $arrayElemAt: ["$users.name", 0] },
        username: { $arrayElemAt: ["$users.username", 0] },
        profileImage: { $arrayElemAt: ["$users.profileImage", 0] },
        profileImageType: { $arrayElemAt: ["$users.profileImageType", 0] },
        fameProfile: "$users.fameProfile",
      },
    },
  ]);
};

exports.getSetting = (type) => {
  let obj = { array: 1 };
  if (type == "club") {
    obj.slider = 1;
  }
  if (type == "other") {
    return SettingsDB.findOne({ platformCost: { $exists: true } }).lean();
  } else if (type == "all") {
    return DatasDB.find();
  }
  return DatasDB.findOne({ type: type }, obj).lean();
};

exports.getFollowLimit = (type) => {
  return DatasDB.findOne({ type: type }, { value: 1 }).lean();
};

exports.canFollow = async (data) => {
  const type = data.type;
  const userId = data.userId;
  const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await DatasDB.findOne({ type: 'followLimit' }, { value: 1 }).lean();
  const limit = result.value;

  const count = await FollowerDB.countDocuments({
    type: type,
    followerId: userId,
    createdAt: { $gte: timeLimit }
  });

  return count < limit;
};

exports.canUnfollow = async (data) => {
  const type = data.type;
  const userId = data.userId;
  const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await DatasDB.findOne({ type: 'unfollowLimit' }, { value: 1 }).lean();
  const limit = result.value;

  const count = await UnFollowDB.countDocuments({
    type: type,
    followerId: userId,
    createdAt: { $gte: timeLimit }
  });

  return count < limit;
};
