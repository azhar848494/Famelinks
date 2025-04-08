const mongoose = require("mongoose");
const appConfig = require("../../../configs/app.config");
const ObjectId = mongoose.Types.ObjectId;

const BrandProductDB = require("../../models/v2/brandProducts");

const getBrandPosts = (userId, page) => {
    return BrandProductDB.aggregate([
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
                            profileImage: '$profileImageX50',
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
                from: "users",
                let: { value: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$$value", "$savedProducts"] },
                        },
                    },
                    { $project: { _id: 1 } },
                ],
                as: "savedCount",
            },
        },
        { $addFields: { savedCount: { $size: "$savedCount" } } },
        {
            $lookup: {
                from: "followlinks",
                let: { value: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$productId", "$$value"] },
                        },
                    },
                    { $project: { _id: 1 } },
                ],
                as: "tagCount",
            },
        },
        { $addFields: { tagCount: { $size: "$tagCount" } } },
        { $addFields: { followStatus: 0 } },
        {
            $lookup: {
                from: "followers",
                let: { followeeId: "$user._id" }, //master user Id
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
                let: { followeeId: "$user._id" }, //master user Id
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
            $project: {
                type: 'store',
                name: 1,
                profession: 1,
                price: 1,
                hashTag: 1,
                purchaseUrl: 1,
                gender: 1,
                user: 1,
                description: 1,
                profileImage: '$profileImageX50',
                profileImageType: 1,
                buttonName: 1,
                commentsCount: 1,
                followStatus: 1,
                media: 1,
                createdAt: 1,
                updatedAt: 1,
                savedStatus: 1,
                savedCount: 1,
                tagCount: 1,
            },
        },
        { $skip: (page - 1) * 10 },
        { $limit: 10 },
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