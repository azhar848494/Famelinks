const mongoose = require("mongoose");
const appConfig = require("../../../configs/app.config");

const BrandProductsDB = require("../../models/v2/brandProducts");
const brandProductCoins = require("../../models/v2/brandProductCoins");
const brandTags = require("../../models/v2/brandTags");

const ObjectId = mongoose.Types.ObjectId;

exports.addPost = (data) => {
  return BrandProductsDB.create(data);
};

exports.addBrandProductCoins = (productId, allotedCoins, giftCoins, balance) => {
  return brandProductCoins.create({
    productId,
    allotedCoins,
    giftCoins,
    balance,
  });
};

exports.addBrandProductsTags = (productId, giftCoins, postId) => {
  return brandTags.create({ productId, giftCoins, postId });
};

exports.updatePost = (postId, post) => {
  return BrandProductsDB.updateOne({ _id: postId }, post);
};

exports.updateBrandProductsTag = (productId, postId) => {
  return brandTags.updateOne({ productId: productId }, { postId: postId });
};

exports.getBrandProductsById = (_id) => {
  return BrandProductsDB.findOne({ _id: _id }).lean();
};

exports.getBrandProductCoinsById = (productId) => {
  return brandProductCoins.findOne({ productId: ObjectId(productId) }).lean();
};

// exports.getMyBrandProducts = (userId, page, selfUserId) => {
//   return BrandProductsDB.aggregate([
//     {
//       $match: {
//         userId: ObjectId(userId),
//         isDeleted: false,
//         isSafe: true,
//         isBlocked: false,
//       },
//     },
//     {
//       $lookup: {
//         from: 'users',
//         let: { userId: '$userId' },
//         pipeline: [
//           { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
//           { $project: { name: 1, dob: 1, bio: 1, profession: 1, profileImage: 1, username: 1, _id: 1, type: 1 } }
//         ],
//         as: 'users'
//       }
//     },
//     // Like Status
//     {
//       $lookup: {
//         from: "likes",
//         let: { mediaId: "$_id" },
//         pipeline: [
//           {
//             $match: {
//               userId: selfUserId,
//               $expr: { $eq: ["$mediaId", "$$mediaId"] },
//             },
//           },
//           { $project: { status: 1, _id: 0 } },
//         ],
//         as: "likeStatus",
//       },
//     },
//     { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },
//     // Challenge
//     // {
//     //     $lookup: {
//     //         from: 'challenges',
//     //         let: { challengeId: '$challengeId' },
//     //         pipeline: [
//     //             { $match: {
//     //                 $expr: { $in: ['$_id', '$$challengeId'] },
//     //                 isDeleted: false
//     //             } },
//     //             { $project: { name: 1 } }
//     //         ],
//     //         as: 'challenges'
//     //     }
//     // },
//     {
//       $project: {
//         createdAt: 1,
//         updatedAt: 1,
//         name: 1,
//         price: 1,
//         buttonName: 1,
//         purchaseUrl: 1,
//         profession: 1,
//         district: 1,
//         hashTag: 1,
//         users: 1,
//         state: 1,
//         country: 1,
//         gender: 1,
//         challenges: 1,
//         likesCount: 1,
//         commentsCount: 1,
//         description: 1,
//         profileImage: 1,
//         likeStatus: { $ifNull: ["$likeStatus", null] },
//         media: 1,
//       },
//     },
//   ])
//     .sort({ createdAt: "desc" })
//     .skip((page - 1) * 10)
//     .limit(10);
// };

exports.getBrandProducts = (brandId, page) => {
  return BrandProductsDB.aggregate([
    {
      $match: {
        _id: ObjectId(brandId),
        isDeleted: false,
        isSafe: true,
        isBlocked: false,
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
            },
          },
          {
            $project: {
              username: 1,
              type: 1,
              _id: 0,
              dob: 1,
              profile: {
                name: "$profileStorelinks.name",
                bio: "$profileStorelinks.bio",
                profession: "$profileStorelinks.profession",
                profileImage: "$profileStorelinks.profileImage",
              }
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "users",
        let: { tags: "$tags" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$profileFollowlinks._id", "$$tags"] },
            },
          },
          {
            $project: {
              profileImage: 1,
              profileImageType: 1,
              name: 1,
            },
          },
        ],
        as: "followlinkTag",
      },
    },
    {
      $lookup: {
        from: "users",
        let: { tags: "$tags" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$profileFunlinks._id", "$$tags"] },
            },
          },
          {
            $project: {
              profileImage: 1,
              profileImageType: 1,
              name: 1,
            },
          },
        ],
        as: "funlinkTag",
      },
    },
    {
      $addFields: {
        tagBy: {
          $setUnion: ["$followlinkTag", "$funlinkTag"],
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
    // Like Status
    // {
    //   $lookup: {
    //     from: "likes",
    //     let: { mediaId: "$_id" },
    //     pipeline: [
    //       {
    //         $match: {
    //           userId: selfUserId,
    //           $expr: { $eq: ["$mediaId", "$$mediaId"] },
    //         },
    //       },
    //       { $project: { status: 1, _id: 0 } },
    //     ],
    //     as: "likeStatus",
    //   },
    // },
    // { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },
    {
      $project: {
        user: 1,
        createdAt: 1,
        updatedAt: 1,
        name: 1,
        price: 1,
        buttonName: 1,
        purchaseUrl: 1,
        profession: 1,
        location: { $first: "$location" },
        hashTag: 1,
        users: 1,
        gender: 1,
        challenges: 1,
        // likesCount: 1,
        commentsCount: 1,
        description: 1,
        profileImage: 1,
        tagBy: 1,
        // likeStatus: { $ifNull: ["$likeStatus", null] },
        media: 1,
      },
    },
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getMyBrandProducts = (userId, page, filterObj) => {
  return BrandProductsDB.aggregate([
    {
      $match: {
        userId: ObjectId(userId),
        isDeleted: false,
        isSafe: true,
        isBlocked: false,
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
            },
          },
          {
            $project: {
              username: 1,
              type: 1,
              _id: 0,
              dob: 1,
              profile: {
                name: "$profileStorelinks.name",
                bio: "$profileStorelinks.bio",
                profession: "$profileStorelinks.profession",
                profileImage: "$profileStorelinks.profileImage",
              }
            },
          },
        ],
        as: "user",
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
        user: 1,
        createdAt: 1,
        updatedAt: 1,
        name: 1,
        price: 1,
        buttonName: 1,
        purchaseUrl: 1,
        profession: 1,
        hashTag: 1,
        users: 1,
        location: { $first: "$location" },
        gender: 1,
        challenges: 1,
        // likesCount: 1,
        commentsCount: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        // likeStatus: { $ifNull: ["$likeStatus", null] },
        media: 1,
      },
    },
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getBrandPosts = (userId, page) => {
  return BrandProductsDB.aggregate([
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
    //MasterIdMigration    
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userId"] },
            },
          },
          {
            $project: {
              username: 1,
              type: 1,
              _id: 0,
              dob: 1,
              profile: {
                name: "$profileStorelinks.name",
                bio: "$profileStorelinks.bio",
                profession: "$profileStorelinks.profession",
                profileImage: "$profileStorelinks.profileImage",
              }
            },
          },
        ],
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },
    // Challenge
    // {
    //   $lookup: {
    //     from: "challenges",
    //     let: { challengeId: "$challengeId" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: { $in: ["$_id", "$$challengeId"] },
    //           isDeleted: false,
    //         },
    //       },
    //       { $project: { name: 1 } },
    //     ],
    //     as: "challenges",
    //   },
    // },

    // {
    //   $lookup: {
    //     from: "users",
    //     let: { id: "$_id" },
    //     pipeline: [
    //       { $match: { $expr: { $in: ["$$id", "$savedProducts"] } } },
    //       { $project: { _id: 0, savedProducts: 1 } },
    //     ],
    //     as: "savedProducts",
    //   },
    // },
    {
      $lookup: {
        from: "users",
        let: { userId: userId },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          { $project: { _id: 0, savedProducts: 1 } },
        ],
        as: "savedProducts",
      },
    },
    {
      $addFields: { savedProducts: { $first: "$savedProducts.savedProducts" } },
    },
    { $addFields: { savedStatus: { $in: ["$_id", "$savedProducts"] } } },
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
        brands: 1,
        type: "brand",
        createdAt: 1,
        updatedAt: 1,
        name: 1,
        profession: 1,
        location: { $first: "$location" },
        hashTag: 1,
        price: 1,
        buttonName: 1,
        purchaseUrl: 1,
        gender: 1,
        // challenges: 1,
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
        tags: 1,
        //savedProducts: 1,
        savedStatus: 1,
        media: 1,
        //     [
        //   {
        //     path: "$video",
        //     type: "video",
        //   },
        //   {
        //     path: "$closeUp",
        //     type: "closeUp",
        //   },
        //   {
        //     path: "$medium",
        //     type: "medium",
        //   },
        //   {
        //     path: "$long",
        //     type: "long",
        //   },
        //   {
        //     path: "$pose1",
        //     type: "pose1",
        //   },
        //   {
        //     path: "$pose2",
        //     type: "pose2",
        //   },
        //   {
        //     path: "$additional",
        //     type: "additional",
        //   },
        // ],
        // winnerTitles: ['FameLinks Ambassador - Mumbai'],
        winnerTitles: [],
      },
    },
    { $match: { followStatus: "Following" } },
  ])
    .sort({ createdAt: -1 })
    .skip((page - 1) * 1)
    .limit(5);
};

exports.getsAdBrandPosts = (userId, page) => {
  return BrandProductsDB.aggregate([
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
    {
      $lookup: {
        from: "brand-products",
        foreignField: "6260dcdfd0b8005c69a59de3",
        localField: "6260dcdfd0b8005c69a59de3",
        pipeline: [
          { $match: { _id: ObjectId("6260dcdfd0b8005c69a59de3") } },
          { $project: { media: 1 } },
        ],
        as: "brands",
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
    // {
    //   $lookup: {
    //     from: "challenges",
    //     let: { challengeId: "$challengeId" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: { $in: ["$_id", "$$challengeId"] },
    //           isDeleted: false,
    //         },
    //       },
    //       { $project: { name: 1 } },
    //     ],
    //     as: "challenges",
    //   },
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
        brands: 1,
        type: "brand",
        typeOf: "Ad Post",
        createdAt: "2022-04-23T05:52:08.162Z",
        name: 1,
        buttonName: 1,
        profession: 1,
        location: { $first: "$location" },
        price: 1,
        gender: 1,
        hashTag: 1,
        // challenges: 1,
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
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
    .skip((page - 1) * 1)
    .limit(1);
};

exports.getAdBrandPosts = (userId, page) => {
  return BrandProductsDB.aggregate([
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
    // {
    //   $lookup: {
    //     from: "challenges",
    //     let: { challengeId: "$challengeId" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: { $in: ["$_id", "$$challengeId"] },
    //           isDeleted: false,
    //         },
    //       },
    //       { $project: { name: 1 } },
    //     ],
    //     as: "challenges",
    //   },
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
      $project: {
        type: "brand",
        typeOf: "Normal Post",
        createdAt: 1,
        buttonName: 1,
        updatedAt: 1,
        name: 1,
        profession: 1,
        location: 1,
        price: 1,
        hashTag: 1,
        gender: 1,
        // challenges: 1,
        user: 1,
        description: 1,
        profileImage: 1,
        profileImageType: 1,
        likes0Count: 1,
        likes1Count: 1,
        likes2Count: 1,
        commentsCount: 1,
        followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
        likeStatus: { $ifNull: ["$likeStatus", null] },
        media: 1,
        //     [
        //   {
        //     path: "$video",
        //     type: "video",
        //   },
        //   {
        //     path: "$closeUp",
        //     type: "closeUp",
        //   },
        //   {
        //     path: "$medium",
        //     type: "medium",
        //   },
        //   {
        //     path: "$long",
        //     type: "long",
        //   },
        //   {
        //     path: "$pose1",
        //     type: "pose1",
        //   },
        //   {
        //     path: "$pose2",
        //     type: "pose2",
        //   },
        //   {
        //     path: "$additional",
        //     type: "additional",
        //   },
        // ],
        // winnerTitles: ['FameLinks Ambassador - Mumbai'],
        winnerTitles: [],
      },
    },
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 1)
    .limit(1);
};

exports.getOnePost = (postId) => {
  return BrandProductsDB.findOne({ _id: postId }).lean();
};

exports.updatePostLikeCounter = (postId, obj) => {
  return BrandProductsDB.updateOne({ _id: postId }, { $inc: obj });
};

exports.updatePostCommentCounter = (postId, incBy) => {
  return BrandProductsDB.updateOne(
    { _id: postId },
    { $inc: { commentsCount: incBy } }
  );
};

exports.updateTags = (tag, userId) => {
  exports.data = { $addToSet: { tags: userId } };
  return BrandProductsDB.updateOne({ _id: tag }, data);
};

exports.deletePost = (postId, userId) => {
  return BrandProductsDB.findOneAndDelete({ _id: postId, userId });
};

exports.updatePostMedia = (postId, userId, post) => {
  return BrandProductsDB.updateOne(
    { _id: postId, userId },
    {
      $set: { ...post },
    }
  );
};

exports.getUserMostLikedPost = (userId) => {
  return BrandProductsDB.aggregate()
    .match({ userId })
    .addFields({ likesCount: { $add: ["$likes1Count", "$likes2Count"] } })
    .sort({ likesCount: "desc" })
    .limit(1);
};

exports.updateProduct = (postId, post) => {
  return BrandProductsDB.updateOne({ _id: postId }, post);
};

exports.updateProductCoins = (postId, balance) => {
  return brandProductCoins.updateOne(
    { productId: postId },
    { balance: balance }
  );
};

exports.getBrandProductsBySearch = (page, search) => {
  return BrandProductsDB.aggregate([
    {
      $match: {
        $and: [
          { isDeleted: false },
          { isSafe: true },
          { name: { $regex: `^.*?${search}.*?$`, $options: "x" } },
        ],
      },
    },
    {
      $lookup: {
        from: "brandproductcoins",
        let: { productId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$productId", "$$productId"] } } },
          {
            $project: {
              _id: 0,
              balance: 1,
              giftCoins: 1,
            },
          },
        ],
        as: "coins",
      },
    },
    { $addFields: { giftCoins: { $first: "$coins.giftCoins" } } },
    { $addFields: { balance: { $first: "$coins.balance" } } },
    {
      $match: {
        $expr: { $gte: ["$balance", "$giftCoins"] },
      },
    },
    {
      $project: { coins: 0, giftCoins: 0, balance: 0 },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
    { $sort: { createdAt: -1 } },
  ]);
};

exports.getBrandProduct = (page, selfId) => {
  return BrandProductsDB.aggregate([
    {
      $match: {
        $and: [
          { isDeleted: false },
          { isSafe: true },
          { isBlocked: false },
          { userId: { $ne: selfId } },
        ],
      },
    },
    {
      $lookup: {
        from: "brandproductcoins",
        let: { productId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$productId", "$$productId"] } } },
          {
            $project: {
              _id: 0,
              balance: 1,
              perTagCoins: 1,
            },
          },
        ],
        as: "coins",
      },
    },
    //MasterIdMigration
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          {
            $project: {
              _id: 0,
              name: "$profileStorelinks.name",
            },
          },
        ],
        as: "createdBy",
      },
    },
    { $addFields: { createdBy: { $first: "$createdBy.name" } } },
    { $addFields: { balance: { $first: "$coins.balance" } } },
    { $addFields: { perTagCoins: { $first: "$coins.perTagCoins" } } },
    {
      $match: {
        $expr: { $gte: ["$balance", "$perTagCoins"] },
      },
    },
    {
      $project: { coins: 0, balance: 0 },
    },
    { $skip: (page - 1) * 10 },
    { $limit: 10 },
    { $sort: { createdAt: -1 } },
  ]);
};

exports.getProductDetails = (data) => {
  return BrandProductsDB.aggregate([
    {
      $match: {
        $and: [
          { _id: ObjectId(data.productId) },
          { isDeleted: false },
          { isSafe: true },
          { isBlocked: false },
        ],
      },
    },
    {
      $lookup: {
        from: "followlinks",
        let: { userId: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          {
            $project: {
              _id: 0,
              name: "$profileStorelinks.name",
            },
          },
        ],
        as: "createdBy",
      },
    },
    {
      $lookup: {
        from: "challenges",
        let: { userId: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$createdBy", "$$userId"] } } },
          {
            $project: { _id: 1 },
          },
        ],
        as: "tags",
      },
    },
    {
      $project: {
        media: 1,
        description: 1,
        purchaseUrl: 1,
        buttonName: 1,
        name: 1,
        hashTag: 1,
        price: 1,
        tags: 1,
      },
    },
  ]);
};