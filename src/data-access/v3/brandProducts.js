const mongoose = require("mongoose");
const appConfig = require("../../../configs/app.config");
const ObjectId = mongoose.Types.ObjectId;

const BrandProductDB = require("../../models/v2/brandProducts");

const getBrandPosts = (page) => {
    let pagination = ((page - 1) * 1)
    return BrandProductDB.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "profilestorelinks",
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
                                        $expr: { $eq: ["$profileStorelinks", "$$userId"] },
                                        isDeleted: false,
                                        isSuspended: false,
                                    },
                                },
                                {
                                    $project: {
                                        username: 1, //this is present master user table
                                        type: 1, //this is present master user table
                                        _id: 1,
                                        dob: 1,
                                        profileFamelinks: 1,
                                        // name: 1,
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
                            // name: { $first: "$masterUser.name" },
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
                        },
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
                user: 1,
                description: 1,
                profileImage: 1,
                profileImageType: 1,
                likes0Count: 1,
                likes1Count: 1,
                likes2Count: 1,
                commentsCount: 1,
                tags: 1,
                savedStatus: 1,
                media: 1,
                winnerTitles: [],
            },
        },
        { $skip: pagination },
        { $limit: 1 }
    ])
}

const getBrandPostsStatus = (postIds, profileId, masterUserId) => {
    return BrandProductDB.aggregate([
        { $match: { $expr: { $in: ['$_id', postIds] } } },
        {
            $lookup: {
                from: "users",
                let: { userId: masterUserId },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                    { $project: { _id: 0, savedProducts: 1 } },
                ],
                as: "savedProducts",
            },
        },
        { $addFields: { savedProducts: { $first: "$savedProducts.savedProducts" } } },
        { $addFields: { savedStatus: { $in: ["$_id", "$savedProducts"] } } },
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
        {
            $lookup: {
                from: "profilestorelinks",
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
                                        $expr: { $eq: ["$profileStorelinks", "$$userId"] },
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
                type: "brand",
                likeStatus: { $ifNull: ["$likeStatus", null] },
                followStatus: 1,
                savedStatus: 1,
            }
        }
    ])
}

module.exports = {
    getBrandPosts,
    getBrandPostsStatus
}