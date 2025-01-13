const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const clubOfferDB = require('../../models/v2/clubOffers')
const clubCategoryDB = require('../../models/v2/clubCategories')
const offerApplicationsDB = require('../../models/v2/offerApplications')
const usersDB = require('../../models/v2/users')

exports.createClubOffer = (payload) => {
    return clubOfferDB.create(payload)
}

exports.getClubOfferById = (offerId) => {
    return clubOfferDB.findOne({ _id: offerId }).lean()
}

exports.getClubOffer = () => {
    return clubOfferDB.find({}).lean()
}

exports.updateClubOffer = (offerId, payload) => {
    return clubOfferDB.updateOne({ _id: offerId }, payload)
}

exports.applyWithdrawClubOffer = (profileId, offerId, action) => {
    if (action == 'apply') {
        return offerApplicationsDB.create({ userId: profileId, offerId: offerId })
    }
    if (action == 'withdraw') {
        return offerApplicationsDB.deleteOne({ offerId: offerId, userId: profileId })
    }
    return
}

exports.saveUnsavePromoters = (profileId, offerId, action) => {
    if (action == 'save') {
        let updateObj = {}
        updateObj.savedPromoters = profileId
        return clubOfferDB.updateOne({ _id: offerId }, { $addToSet: updateObj })
    }
    if (action == 'unsave') {
        return clubOfferDB.updateOne({ _id: offerId }, { $pull: { savedPromoters: { $in: [profileId] } } })
    }
    return
}

exports.getClubOffersNew = (followlinksId, funlinksId, userType, page) => {
    let currentDate = new Date()
    let pagination = page ? page : 1
    if (userType == 'individual') {
        return clubOfferDB.aggregate([
            //MasterIdMigration
            {
                $lookup: {
                    from: 'users',
                    pipeline: [
                        { $match: { _id: followlinksId } },
                        { $project: { _id: 0, clubCategory: "$profileFollowlinks.clubCategory" } }
                    ],
                    as: 'followlinksProfile'
                }
            },
            { $addFields: { 'userClubCategory': { $first: '$followlinksProfile.clubCategory' } } },
            { $set: { matchedCategories: { $setIntersection: ['$category', '$userClubCategory'] } } },
            // { $match: { $expr: { $ne: [0, { $size: '$matchedCategories' }] } } },
            {
                $lookup: {
                    from: "users",
                    let: { profileFollowlinks: followlinksId },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$profileFollowlinks"] } } },
                        { $project: { _id: 0, followersCount: 1 } },
                    ],
                    as: "masterUser",
                },
            },
            { $addFields: { masterUser: { $first: "$masterUser" } } },
            { $addFields: { Followers: "$masterUser.followersCount" } },
            {
                $lookup: {
                    from: 'clubs',
                    let: { followers: '$Followers' },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $gte: ['$$followers', '$minRange'] } },
                                    { $expr: { $lte: ['$$followers', '$maxRange'] } }]
                            }
                        },
                        { $project: { _id: 0, name: 1 } }
                    ],
                    as: 'userClub'
                }
            },
            { $set: { userClub: { $cond: [{ $ne: [0, { $size: '$userClub' }] }, { $first: '$userClub.name' }, 'Bud-D'] } } },
            { $match: { $expr: { $eq: ['$club', '$userClub'] } } },
            { $match: { isDeleted: false, isSafe: true, isClosed: false, isCompleted: false } },
            { $match: { $expr: { $gte: ['$startDate', currentDate] } } },
            { $match: { $expr: { $not: { $eq: [followlinksId, '$createdBy'] } } } },
            { $match: { $expr: { $not: { $eq: [funlinksId, '$createdBy'] } } } },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: 'offerapplications',
                    let: { offerId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$offerId'] }, }, },
                    ],
                    as: 'appliedOffers'
                }
            },
            // { $match: { $expr: { $eq: [0, { $size: '$appliedOffers' }] } } },
            {
                $lookup: {
                    from: 'users',
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } }
                                ],
                                isDeleted: false, isSuspended: false
                            }
                        },
                        { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                    ],
                    as: 'createdBy'
                }
            },
            { $match: { $expr: { $ne: [0, { $size: '$createdBy' }] } } },
            {
                $lookup: {
                    from: 'clubcategories',
                    let: { category: '$category' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$category'] } } },
                        { $project: { name: 1 } }
                    ],
                    as: 'category'
                }
            },
            {
                $lookup: {
                    from: 'clubcategories',
                    let: { category: '$userClubCategory' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$category'] } } },
                        { $project: { name: 1 } }
                    ],
                    as: 'userClubCategory'
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
            { $skip: ((pagination - 1) * 10) },
            { $limit: 10 },
            {
                $project: {
                    appliedOffers: 1,
                    createdBy: 1,
                    offer: 1,
                    club: 1,
                    type: 1,
                    startDate: 1,
                    requiredMilestone: 1,
                    days: 1,
                    category: 1,
                    location: { $first: "$location" },
                    ageGroup: 1,
                    gender: 1,
                    media: 1,
                    message: 1,
                    cost: "$influencerCost",
                    userClubCategory: 1,
                }
            }
        ])
    }

    if (userType == 'brand' || userType == 'agency') {
        return clubOfferDB.aggregate([
            { $match: { createdBy: followlinksId, isDeleted: false, isSafe: true, isClosed: false, isCompleted: false } },
            { $sort: { updatedAt: -1 } },
            {
                $match: {
                    $or: [
                        { $expr: { $eq: [followlinksId, '$createdBy'] } },
                        { $expr: { $eq: [funlinksId, '$createdBy'] } },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'offerapplications',
                    let: { offerId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ['$offerId', '$$offerId'] } },
                                    { status: 'applied' }
                                ]
                            }
                        },
                        { $project: { _id: 0, userId: 1 } }
                    ],
                    as: 'applications'
                }
            },
            { $match: { $expr: { $eq: [0, { $size: '$applications' }] } } },
            {
                $lookup: {
                    from: 'users',
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } }
                                ],
                                isDeleted: false, isSuspended: false
                            }
                        },
                        { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                    ],
                    as: 'createdBy'
                }
            },
            { $match: { $expr: { $ne: [0, { $size: '$createdBy' }] } } },
            {
                $lookup: {
                    from: 'clubcategories',
                    let: { category: '$category' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$category'] } } },
                        { $project: { name: 1 } }
                    ],
                    as: 'category'
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
            { $skip: ((pagination - 1) * 10) },
            { $limit: 10 },
            {
                $project: {
                    title: 1,
                    createdBy: 1,
                    offer: 1,
                    club: 1,
                    type: 1,
                    startDate: 1,
                    requiredMilestone: 1,
                    days: 1,
                    category: 1,
                    location: { $first: "$location" },
                    ageGroup: 1,
                    gender: 1,
                    media: 1,
                    cost: 1,
                    message: 1,
                    createdAt: 1,
                }
            }
        ]);
    }
    return []
}

exports.getClubOffersApplied = (followlinksId, funlinksId, userType, page) => {
    let pagination = page ? page : 1
    if (userType == 'individual') {
        return clubOfferDB.aggregate([
            { $match: { isDeleted: false, isSafe: true, isClosed: false, isCompleted: false } },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: 'offerapplications',
                    let: { offerId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ['$offerId', '$$offerId'] } },
                                    {
                                        $or: [
                                            { $expr: { $eq: ['$userId', followlinksId] } },
                                            { $expr: { $eq: ['$userId', funlinksId] } }
                                        ]
                                    },
                                    { status: 'applied' }
                                ]
                            }
                        },
                        { $project: { createdAt: 1 } }
                    ],
                    as: 'appliedOffers'
                }
            },
            { $match: { $expr: { $ne: [0, { $size: '$appliedOffers' }] } } },
            {
                $lookup: {
                    from: 'users',
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                ],
                                isDeleted: false, isSuspended: false
                            }
                        },
                        { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                    ],
                    as: 'createdBy'
                }
            },
            { $match: { $expr: { $ne: [0, { $size: '$createdBy' }] } } },
            {
                $lookup: {
                    from: 'clubcategories',
                    let: { category: '$category' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$category'] } } },
                        { $project: { name: 1 } }
                    ],
                    as: 'category'
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
            { $skip: ((pagination - 1) * 10) },
            { $limit: 10 },
            {
                $project: {
                    createdBy: 1,
                    offer: 1,
                    club: 1,
                    type: 1,
                    startDate: 1,
                    // totalMilestone: 1,
                    requiredMilestone: 1,
                    days: 1,
                    category: 1,
                    location: { $first: "$location" },
                    ageGroup: 1,
                    gender: 1,
                    media: 1,
                    message: 1,
                    cost: "$influencerCost",
                    dateApplied: { $first: '$appliedOffers.createdAt' }
                }
            }
        ])
    }
    if (userType == 'brand' || userType == 'agency') {
        return clubOfferDB.aggregate([
            { $match: { createdBy: followlinksId, isDeleted: false, isSafe: true, isClosed: false, isCompleted: false } },
            { $sort: { updatedAt: -1 } },
            {
                $match: {
                    $or: [
                        { $expr: { $eq: [followlinksId, '$createdBy'] } },
                        { $expr: { $eq: [funlinksId, '$createdBy'] } },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'offerapplications',
                    let: { offerId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ['$offerId', '$$offerId'] } },
                                    { status: 'applied' }
                                ]
                            }
                        },
                        { $project: { _id: 0, userId: 1 } }
                    ],
                    as: 'applications'
                }
            },
            {
                $match: { "applications": { $ne: [] } }
            },
            //MasterIdMigration
            {
                $lookup: {
                    from: 'users',
                    let: { applications: '$applications' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$applications.userId'] } } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                type: 1,
                                username: 1,
                                name: 1,
                                profileImage: 1,
                                profileImageType: 1,
                                profile: {
                                    name: "$profileFollowlinks.name",
                                    profileImage: "$profileFollowlinks.profileImage",
                                    profileImageType: "$profileFollowlinks.profileImageType",
                                },
                            }
                        }
                    ],
                    as: 'followlinksApplicants'
                }
            },
            //MasterIdMigration
            {
                $lookup: {
                    from: 'users',
                    let: { applications: '$applications' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$applications.userId'] } } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                type: 1,
                                username: 1,
                                name: 1,
                                profileImage: 1,
                                profileImageType: 1,
                                profile: {
                                    name: "$profileFunlinks.name",
                                    profileImage: "$profileFunlinks.profileImage",
                                    profileImageType: "$profileFunlinks.profileImageType",
                                },
                            },
                        },
                    ],
                    as: 'funlinksApplicants'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } }
                                ],
                                isDeleted: false, isSuspended: false
                            }
                        },
                        { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                    ],
                    as: 'createdBy'
                }
            },
            { $match: { $expr: { $ne: [0, { $size: '$createdBy' }] } } },
            {
                $lookup: {
                    from: 'clubcategories',
                    let: { category: '$category' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$category'] } } },
                        { $project: { name: 1 } }
                    ],
                    as: 'category'
                }
            },
            { $set: { applicants: { $setUnion: ['$funlinksApplicants', '$followlinksApplicants'] }, } },
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
            { $skip: ((pagination - 1) * 10) },
            { $limit: 10 },
            {
                $project: {
                    title: 1,
                    createdBy: 1,
                    offer: 1,
                    club: 1,
                    type: 1,
                    startDate: 1,
                    requiredMilestone: 1,
                    days: 1,
                    category: 1,
                    location: { $first: "$location" },
                    ageGroup: 1,
                    gender: 1,
                    media: 1,
                    message: 1,
                    cost: 1,
                    applicants: 1,
                    createdAt: 1,
                    appliedCount: { $size: '$applicants' },
                }
            }
        ])
    }
    return []
}

exports.getClubOffersInProgress = (followlinksId, funlinksId, userType, page) => {
    let pagination = page ? page : 1
    let currentDate = new Date()
    let MS_PER_DAY = 1000 * 24 * 60 * 60
    if (userType == 'individual') {
        return clubOfferDB.aggregate([
            { $match: { isDeleted: false, isSafe: true, isClosed: true, isCompleted: false } },
            { $sort: { updatedAt: -1 } },
            {
                $match: {
                    $or: [
                        { $expr: { $eq: ['$selectedPromoter', followlinksId] } },
                        { $expr: { $eq: ['$selectedPromoter', funlinksId] } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } }
                                ],
                                isDeleted: false, isSuspended: false
                            }
                        },
                        { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                    ],
                    as: 'createdBy'
                }
            },
            { $match: { $expr: { $ne: [0, { $size: '$createdBy' }] } } },
            {
                $lookup: {
                    from: 'clubcategories',
                    let: { category: '$category' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$category'] } } },
                        { $project: { name: 1 } }
                    ],
                    as: 'category'
                }
            },
            {
                $lookup: {
                    from: 'offerapplications',
                    let: { offerId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $or: [
                                            { $expr: { $eq: ['$userId', funlinksId] } },
                                            { $expr: { $eq: ['$userId', followlinksId] } }
                                        ]
                                    },
                                    { $expr: { $eq: ['$offerId', '$$offerId'] } },
                                    { status: 'selected' }
                                ]
                            }
                        },
                        { $project: { _id: 0, selectedDate: 1 } }
                    ],
                    as: 'application'
                }
            },
            { $addFields: { selectedDate: { $first: '$application.selectedDate' } } },
            {
                $addFields: {
                    status: {
                        $switch: {
                            branches: [
                                { case: { $gte: ['$startDate', currentDate] }, then: 'Not started' },
                                { case: { $lt: ['$days', { $floor: { $abs: { $divide: [{ $subtract: [currentDate, '$startDate'] }, MS_PER_DAY] } } }] }, then: 'Offer expired' },
                                { case: { $eq: ['$postId', null] }, then: 'Post Pending' },
                                { case: { $ne: ['$postId', null] }, then: 'Post Uploaded' },
                            ],
                            default: 'Not started'
                        }
                    }
                }
            },
            { $addFields: { daysLeft: { $subtract: ['$days', { $floor: { $abs: { $divide: [{ $subtract: [currentDate, '$startDate'] }, MS_PER_DAY] } } }] } } },
            {
                $set: {
                    daysLeft: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$status', 'Not started'] },
                                    then: {
                                        $dateDiff: {
                                            startDate: currentDate,
                                            endDate: "$startDate",
                                            unit: "day"
                                        },
                                    },
                                },
                                { case: { $eq: ['$status', 'Offer expired'] }, then: 0 }
                            ],
                            default: '$daysLeft'
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'funlinks',
                    let: { postId: '$postId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$postId'] } } },
                        { $project: { likesCount: 1, commentsCount: 1, seen: 1, video: 1, createdAt: 1 } }
                    ],
                    as: 'funlinksPost'
                }
            },
            {
                $lookup: {
                    from: 'followlinks',
                    let: { postId: '$postId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$postId'] } } },
                        {
                            $project: {
                                likesCount: 1, seen: { $size: "$reachIds" }, commentsCount: 1, media: [
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
                                ], createdAt: 1
                            }
                        }
                    ],
                    as: 'followlinksPost'
                }
            },
            { $set: { postDetails: { $setUnion: ['$followlinksPost', '$funlinksPost'] } } },
            {
                $set: {
                    expiryMessage: {
                        $cond: [
                            { $eq: ['$status', 'Offer expired'] }, { $cond: [{ $gte: [{ $divide: ['$totalMilestone', '$requiredMilestone'] }, 0.75] }, "Awaiting offer creator's action", ''] }, ''
                        ]
                    }
                }
            },
            { $skip: ((pagination - 1) * 10) },
            { $limit: 10 },
            { $sort: { postId: 1 } },
            {
                $project: {
                    daysLeft: 1,
                    createdBy: 1,
                    cost: "$influencerCost",
                    offerCode: 1,
                    // totalMilestone: 1,
                    startDate: 1,
                    requiredMilestone: 1,
                    // days: 1,
                    type: 1,
                    postId: 1,
                    status: 1,
                    media: 1,
                    postDetails: { $first: '$postDetails' },
                    expiryMessage: 1,
                    message: 1,
                }
            }
        ])
    }
    if (userType == 'brand' || userType == 'agency') {
        return clubOfferDB.aggregate([
            { $match: { isDeleted: false, isSafe: true, isClosed: true, isCompleted: false } },
            { $sort: { updatedAt: -1 } },
            {
                $match: {
                    $or: [
                        { $expr: { $eq: [followlinksId, '$createdBy'] } },
                        { $expr: { $eq: [funlinksId, '$createdBy'] } },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { createdBy: '$selectedPromoter' },
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } }
                                ],
                                isDeleted: false, isSuspended: false
                            }
                        },
                        { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                    ],
                    as: 'createdBy'
                }
            },
            {
                $lookup: {
                    from: 'clubcategories',
                    let: { category: '$category' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$category'] } } },
                        { $project: { name: 1 } }
                    ],
                    as: 'category'
                }
            },
            {
                $lookup: {
                    from: 'offerapplications',
                    let: { offerId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ['$offerId', '$$offerId'] } },
                                    { status: 'selected' }
                                ]
                            }
                        },
                        { $project: { _id: 0, selectedDate: 1 } }
                    ],
                    as: 'application'
                }
            },
            { $addFields: { selectedDate: { $first: '$application.selectedDate' } } },
            {
                $addFields: {
                    status: {
                        $switch: {
                            branches: [
                                { case: { $gte: ['$startDate', currentDate] }, then: 'Not started' },
                                { case: { $lt: ['$days', { $floor: { $abs: { $divide: [{ $subtract: [currentDate, '$selectedDate'] }, MS_PER_DAY] } } }] }, then: 'Offer expired' },
                                { case: { $eq: ['$selectedPromoter', null] }, then: 'Promoter not selected' },
                                { case: { $ne: ['$selectedPromoter', null] }, then: 'Promoter selected' },
                            ],
                            default: 'Not started'
                        }
                    }
                }
            },
            { $addFields: { daysLeft: { $subtract: ['$days', { $floor: { $abs: { $divide: [{ $subtract: [currentDate, '$selectedDate'] }, MS_PER_DAY] } } }] } } },
            {
                $set: {
                    daysLeft: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$status', 'Not started'] }, then: {
                                        $dateDiff: {
                                            startDate: currentDate,
                                            endDate: "$startDate",
                                            unit: "day"
                                        },
                                    },
                                },
                                { case: { $eq: ['$status', 'Offer expired'] }, then: 0 }
                            ],
                            default: '$daysLeft'
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'funlinks',
                    let: { postId: '$postId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$postId'] } } },
                        { $project: { likesCount: 1, commentsCount: 1, seen: 1, video: 1, createdAt: 1 } }
                    ],
                    as: 'funlinksPost'
                }
            },
            {
                $lookup: {
                    from: 'followlinks',
                    let: { postId: '$postId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$postId'] } } },
                        {
                            $project: {
                                likesCount: 1, seen: { $size: "$reachIds" }, commentsCount: 1, media: [
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
                                ], createdAt: 1
                            }
                        }
                    ],
                    as: 'followlinksPost'
                }
            },
            { $set: { postDetails: { $setUnion: ['$followlinksPost', '$funlinksPost'] } } },
            {
                $set: {
                    expiryMessage: {
                        $cond: [
                            { $eq: ['$status', 'Offer expired'] }, { $cond: [{ $gte: [{ $divide: ['$totalMilestone', '$requiredMilestone'] }, 0.75] }, "Awaiting your action", ''] }, ''
                        ]
                    }
                }
            },
            { $set: { expiredOn: { $cond: [{ $eq: ['$status', 'Offer expired'] }, { $dateAdd: { startDate: '$startDate', unit: 'day', amount: '$days' } }, null] } } },
            { $skip: ((pagination - 1) * 10) },
            { $limit: 10 },
            {
                $project: {
                    title: 1,
                    daysLeft: 1,
                    createdBy: 1,
                    cost: "$influencerCost",
                    offerCode: 1,
                    // totalMilestone: 1,
                    requiredMilestone: 1,
                    startDate: 1,
                    days: 1,
                    type: 1,
                    postId: 1,
                    status: 1,
                    media: 1,
                    postDetails: { $first: '$postDetails' },
                    expiryMessage: 1,
                    expiredOn: 1,
                    message: 1,
                }
            }
        ])
    }
    return []
}

exports.getClubOffersCompleted = (followlinksId, funlinksId, userType, page) => {
    let pagination = page ? page : 1
    if (userType == 'individual') {
        return clubOfferDB.aggregate([
            { $match: { isDeleted: false, isSafe: true, isClosed: true, isCompleted: true } },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } }
                                ],
                                isDeleted: false, isSuspended: false
                            }
                        },
                        { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                    ],
                    as: 'createdBy'
                }
            },
            { $match: { $expr: { $ne: [0, { $size: '$createdBy' }] } } },
            {
                $lookup: {
                    from: 'funlinks',
                    let: { postId: '$postId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$postId'] } } },
                        { $project: { likesCount: 1, commentsCount: 1, seen: 1, video: 1, createdAt: 1 } }
                    ],
                    as: 'funlinksPost'
                }
            },
            {
                $lookup: {
                    from: 'followlinks',
                    let: { postId: '$postId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$postId'] } } },
                        {
                            $project: {
                                likesCount: 1, seen: { $size: "$reachIds" }, commentsCount: 1, media: [
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
                                ], createdAt: 1
                            }
                        }
                    ],
                    as: 'followlinksPost'
                }
            },
            { $set: { postDetails: { $setUnion: ['$followlinksPost', '$funlinksPost'] } } },
            { $skip: ((pagination - 1) * 10) },
            { $limit: 10 },
            {
                $project: {
                    createdBy: 1,
                    completedAt: 1,
                    type: 1,
                    media: 1,
                    requiredMilestone: 1,
                    postDetails: { $first: '$postDetails' },
                    earned: "$cost"
                }
            }
        ])
    }

    if (userType == 'brand' || userType == 'agency') {
        return clubOfferDB.aggregate([
            { $match: { isDeleted: false, isSafe: true, isClosed: true, isCompleted: true } },
            { $sort: { updatedAt: -1 } },
            {
                $match: {
                    $or: [
                        { $expr: { $eq: ['$createdBy', funlinksId] } },
                        { $expr: { $eq: ['$createdBy', followlinksId] } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { createdBy: '$selectedPromoter' },
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } }
                                ],
                                isDeleted: false, isSuspended: false
                            }
                        },
                        { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                    ],
                    as: 'createdBy'
                }
            },
            { $match: { $expr: { $ne: [0, { $size: '$createdBy' }] } } },
            {
                $lookup: {
                    from: 'funlinks',
                    let: { postId: '$postId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$postId'] } } },
                        { $project: { likesCount: 1, commentsCount: 1, seen: 1, video: 1, createdAt: 1 } }
                    ],
                    as: 'funlinksPost'
                }
            },
            {
                $lookup: {
                    from: 'followlinks',
                    let: { postId: '$postId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$postId'] } } },
                        {
                            $project: {
                                likesCount: 1, seen: { $size: "$reachIds" }, commentsCount: 1, media: [
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
                                ], createdAt: 1
                            }
                        }
                    ],
                    as: 'followlinksPost'
                }
            },
            { $set: { postDetails: { $setUnion: ['$followlinksPost', '$funlinksPost'] } } },
            {
                $project: {
                    title: 1,
                    days: 1,
                    createdBy: 1,
                    completedAt: 1,
                    type: 1,
                    media: 1,
                    postDetails: { $first: "$postDetails" },
                    achieved: {
                        $round: {
                            $multiply: [
                                { $divide: [{ $first: "$postDetails.seen" }, "$requiredMilestone"] },
                                100
                            ],
                        },
                    },
                }
            }
        ])
    }

    return []
}

exports.searchClubOffersByName = (selfMasterId, search, followlinksId, funlinksId, userType, page) => {
    let currentDate = new Date()
    let pagination = page ? page : 1
    if (userType == 'individual') {
        return clubOfferDB.aggregate([
            {
                $match: {
                    isDeleted: false,
                    isSafe: true,
                    isClosed: false,
                    isCompleted: false,
                },
            },
            { $match: { $expr: { $gte: ["$startDate", currentDate] } } },
            {
                $lookup: {
                    from: "users",
                    pipeline: [
                        { $match: { _id: selfMasterId } },
                        { $project: { blockList: 1 } },
                    ],
                    as: "selfMasterProfile",
                },
            },
            {
                $addFields: {
                    blockList: { $first: "$selfMasterProfile.blockList" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    let: { blockList: "$blockList" },
                    pipeline: [
                        {
                            $match: {
                                name: { $regex: `^${search}.*`, $options: "i" },
                                isDeleted: false,
                                isSuspended: false,
                                $expr: { $not: { $in: ["$_id", "$$blockList"] } },
                            },
                        },
                        { $project: { profileFollowlinks: 1, profileFunlinks: 1 } },
                    ],
                    as: "user",
                },
            },
            {
                $addFields: {
                    followlinksId: { $first: "$user._id" },
                },
            },
            { $addFields: { funlinksId: { $first: "$user._id" } } },
            {
                $match: {
                    $or: [
                        { $expr: { $eq: ["$followlinksId", "$createdBy"] } },
                        { $expr: { $eq: ["$funlinksId", "$createdBy"] } },
                    ],
                },
            },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: "offerapplications",
                    let: { offerId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ["$offerId", "$$offerId"] } },
                                    {
                                        $or: [
                                            { $expr: { $eq: ["$userId", followlinksId] } },
                                            { $expr: { $eq: ["$userId", funlinksId] } },
                                        ],
                                    },
                                ],
                            },
                        },
                    ],
                    as: "appliedOffers",
                },
            },
            { $match: { $expr: { $eq: [0, { $size: "$appliedOffers" }] } } },
            {
                $lookup: {
                    from: "users",
                    let: { createdBy: "$createdBy" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$createdBy"] },
                                isDeleted: false,
                                isSuspended: false,
                            },
                        },
                        { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                    ],
                    as: "createdBy",
                },
            },
            { $match: { $expr: { $ne: [0, { $size: "$createdBy" }] } } },
            {
                $lookup: {
                    from: "clubcategories",
                    let: { category: "$category" },
                    pipeline: [
                        { $match: { $expr: { $in: ["$_id", "$$category"] } } },
                        { $project: { name: 1 } },
                    ],
                    as: "category",
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
            { $skip: (pagination - 1) * 10 },
            { $limit: 10 },
            {
                $project: {
                    createdBy: 1,
                    offer: 1,
                    club: 1,
                    type: 1,
                    startDate: 1,
                    // totalMilestone: 1,
                    requiredMilestone: 1,
                    days: 1,
                    category: 1,
                    location: { $first: "$location" },
                    ageGroup: 1,
                    gender: 1,
                    media: 1,
                    message: 1,
                    cost: 1,
                },
            },
        ]);
    }

    if (userType == 'brand' || userType == 'agency') {
        return clubOfferDB.aggregate([
            { $match: { isDeleted: false, isSafe: true, isClosed: false, isCompleted: false } },
            {
                $lookup: {
                    from: 'users',
                    pipeline: [
                        { $match: { _id: selfMasterId } },
                        { $project: { blockList: 1 } }
                    ],
                    as: 'selfMasterProfile'
                }
            },
            { $addFields: { blockList: { $first: '$selfMasterProfile.blockList' } } },
            {
                $lookup: {
                    from: 'users',
                    let: { blockList: '$blockList' },
                    pipeline: [
                        {
                            $match: {
                                name: { $regex: `^${search}.*`, $options: 'gi' },
                                isDeleted: false,
                                isSuspended: false,
                                $expr: { $not: { $in: ['$_id', '$$blockList'] } }
                            }
                        },
                        { $project: { profileFollowlinks: 1, profileFunlinks: 1 } }
                    ],
                    as: 'user'
                }
            },
            { $addFields: { 'followlinksId': { $first: '$user.profileFollowlinks' } } },
            { $addFields: { 'funlinksId': { $first: '$user.profileFunlinks' } } },
            {
                $match: {
                    $or: [
                        { $expr: { $eq: ['$followlinksId', '$createdBy'] } },
                        { $expr: { $eq: ['$funlinksId', '$createdBy'] } }
                    ]
                }
            },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                    { $expr: { $eq: ['$_id', '$$createdBy'] } }
                                ],
                                isDeleted: false, isSuspended: false
                            }
                        },
                        { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                        {
                            $set: {
                                profileImage: {
                                    $cond: {
                                        if: { $eq: [null, "$profileImage"] },
                                        then: null,
                                        else: { $concat: ["$profileImage", "-", "xs"] },
                                    },
                                },
                            },
                        },
                    ],
                    as: 'createdBy'
                }
            },
            { $match: { $expr: { $ne: [0, { $size: '$createdBy' }] } } },
            {
                $lookup: {
                    from: 'clubcategories',
                    let: { category: '$category' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$category'] } } },
                        { $project: { name: 1 } }
                    ],
                    as: 'category'
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
            { $skip: ((pagination - 1) * 10) },
            { $limit: 10 },
            {
                $project: {
                    createdBy: 1,
                    offer: 1,
                    club: 1,
                    type: 1,
                    startDate: 1,
                    // totalMilestone: 1,
                    requiredMilestone: 1,
                    days: 1,
                    category: 1,
                    location: { $first: "$location" },
                    ageGroup: 1,
                    gender: 1,
                    media: 1,
                    message: 1,
                    cost: 1,
                }
            }
        ])
    }
}

exports.searchCategory = (searchData, page) => {
    let pagination = page ? page : 1
    return clubCategoryDB.aggregate([
        {
            $match: {
                $and: [
                    { name: { $regex: `^.*?${searchData}.*?$`, $options: "i" } },
                ]
            }
        },
        { $sort: { updatedAt: -1 } },
        { $project: { name: 1 } },
        { $skip: ((pagination - 1) * 10) },
        { $limit: 10 }
    ])
}

exports.addCategory = (name) => {
    return clubCategoryDB.create({ name })
}

exports.checkApplication = (profileId, offerId) => {
    return offerApplicationsDB.findOne({ userId: profileId, offerId: offerId })
}

exports.updateApplication = (applicationId, data) => {
    return offerApplicationsDB.updateOne({ _id: applicationId }, data)
}

exports.getClubOfferByCode = (offerCode) => {
    return clubOfferDB.findOne({ offerCode: offerCode }).lean()
}

exports.getDailyApplications = (funlinksId, followlinksId) => {
    const todaysDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    return offerApplicationsDB.find({
        $or: [
            { userId: funlinksId },
            { userId: followlinksId }
        ],
        createdAt: { $gte: todaysDate }
    }).count()
}

exports.getUserClubOffers = (profileId) => {
    return usersDB.aggregate([
        {
            $match: {
                $or: [
                    { $expr: { $eq: ['$_id', ObjectId(profileId)] } },
                    { $expr: { $eq: ['$_id', ObjectId(profileId)] } }
                ]
            }
        },
        { $project: { _id: 0, profileFunlinks: 1, profileFollowlinks: 1 } },
        {
            $lookup: {
                from: 'cluboffers',
                let: { profileFollowlinks: '$profileFollowlinks', profileFunlinks: '$profileFunlinks' },
                pipeline: [
                    {
                        $match: {
                            $or: [
                                { $expr: { $eq: ['$selectedPromoter', '$$profileFunlinks'] } },
                                { $expr: { $eq: ['$selectedPromoter', '$$profileFollowlinks'] } },
                            ]
                        }
                    }
                ],
                as: 'clubOffers'
            }
        },
    ])
}

exports.getTotalClubOffers = (followlinksId, funlinksId) => {
    return clubOfferDB.find({
        $or: [
            { createdBy: followlinksId },
            { createdBy: funlinksId }
        ]
    }).count()
}

exports.getTotalApplications = (followlinksId, funlinksId) => {
    return offerApplicationsDB.find({
        $or: [
            { createdBy: followlinksId },
            { createdBy: funlinksId }
        ]
    }).count()
}

exports.getApplicants = (offerId) => {
    return clubOfferDB.aggregate([
        { $match: { _id: ObjectId(offerId) } },
        { $match: { isDeleted: false, isSafe: true, isClosed: false } },
        {
            $lookup: {
                from: 'offerapplications',
                let: { offerId: '$_id', savedPromoters: '$savedPromoters' },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { $expr: { $eq: ['$offerId', '$$offerId'] } },
                                { status: 'applied' }
                            ]
                        }
                    },
                    { $project: { userId: 1 } },
                    {
                        $lookup: {
                            from: 'users',
                            let: { userId: '$userId' },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $or: [{ $expr: { $eq: ['$_id', '$$userId'] } }, { $expr: { $eq: ['$_id', '$$userId'] } }] },
                                            { isDeleted: false },
                                            { isSuspended: false }
                                        ]
                                    }
                                },
                                { $project: { name: 1, type: 1, usertype: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1, profileFollowlinks: 1, profileFunlinks: 1, followersCount: 1 } },
                                {
                                    $set: {
                                        profileImage: {
                                            $cond: {
                                                if: { $eq: [null, "$profileImage"] },
                                                then: null,
                                                else: { $concat: ["$profileImage", "-", "xs"] },
                                            },
                                        },
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'cluboffers',
                                        let: { profileFollowlinks: '$profileFollowlinks', profileFunlinks: '$profileFunlinks' },
                                        pipeline: [
                                            {
                                                $match: {
                                                    isDeleted: false,
                                                    isSafe: true,
                                                    isCompleted: true,
                                                    $or: [
                                                        { $expr: { $eq: ['$selectedPromoter', '$$profileFollowlinks'] } },
                                                        { $expr: { $eq: ['$selectedPromoter', '$$profileFunlinks'] } }
                                                    ]
                                                }
                                            },
                                            { $project: { _id: 1 } }
                                        ],
                                        as: 'offersCompleted'
                                    }
                                },
                                {
                                    $project: {
                                        name: 1,
                                        username: 1,
                                        type: 1,
                                        profileImage: 1,
                                        profileImageType: 1,
                                        followersCount: 1,
                                        offersCompleted: { $size: '$offersCompleted' }
                                    }
                                },
                            ],
                            as: 'masterProfile'
                        }
                    },
                    { $project: { masterProfile: 1 } },
                    {
                        $addFields: {
                            saved: {
                                $in: ["$masterProfile._id", "$$savedPromoters"]
                            },
                        },
                    },
                    { $match: { $expr: { $ne: [0, { $size: '$masterProfile' }] } } },
                ],
                as: 'applications'
            }
        },
        { $set: { appliedBy: { $size: '$applications' } } },
        //MasterIdMigration
        {
            $lookup: {
                from: 'users',
                let: { applications: '$applications' },
                pipeline: [
                    { $match: { $expr: { $in: ['$_id', '$$applications.userId'] } } },
                    {
                        $set: {
                            profileImage: {
                                $cond: {
                                    if: { $eq: [null, "$profileImage"] },
                                    then: null,
                                    else: { $concat: ["$profileImage", "-", "xs"] },
                                },
                            },
                        },
                    },
                    { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } }
                ],
                as: 'followlinksApplicants'
            }
        },
        //MasterIdMigration
        {
            $lookup: {
                from: 'users',
                let: { applications: '$applications' },
                pipeline: [
                    { $match: { $expr: { $in: ['$_id', '$$applications.userId'] } } },
                    {
                        $set: {
                            profileImage: {
                                $cond: {
                                    if: { $eq: [null, "$profileImage"] },
                                    then: null,
                                    else: { $concat: ["$profileImage", "-", "xs"] },
                                },
                            },
                        },
                    },
                    { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } }
                ],
                as: 'funlinksApplicants'
            }
        },
        {
            $lookup: {
                from: 'users',
                let: { createdBy: '$createdBy' },
                pipeline: [
                    {
                        $match: {
                            $or: [
                                { $expr: { $eq: ['$_id', '$$createdBy'] } },
                                { $expr: { $eq: ['$_id', '$$createdBy'] } }
                            ],
                            isDeleted: false, isSuspended: false
                        }
                    },
                    { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1 } },
                    {
                        $set: {
                            profileImage: {
                                $cond: {
                                    if: { $eq: [null, "$profileImage"] },
                                    then: null,
                                    else: { $concat: ["$profileImage", "-", "xs"] },
                                },
                            },
                        },
                    },
                ],
                as: 'createdBy'
            }
        },
        { $match: { $expr: { $ne: [0, { $size: '$createdBy' }] } } },
        {
            $lookup: {
                from: 'clubcategories',
                let: { category: '$category' },
                pipeline: [
                    { $match: { $expr: { $in: ['$_id', '$$category'] } } },
                    { $project: { name: 1 } }
                ],
                as: 'category'
            }
        },
        { $set: { applicants: { $setUnion: ['$funlinksApplicants', '$followlinksApplicants'] }, } },
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
                createdBy: 1,
                offer: 1,
                club: 1,
                type: 1,
                startDate: 1,
                requiredMilestone: 1,
                days: 1,
                location: { $first: "$location" },
                ageGroup: 1,
                gender: 1,
                media: 1,
                message: 1,
                cost: 1,
                createdAt: 1,
                category: 1,
                applications: 1,
                appliedBy: 1,
            }
        }
    ]);
    return clubOfferDB.aggregate([
        { $match: { _id: ObjectId(offerId) } },
        { $match: { isDeleted: false, isSafe: true, isClosed: false } },
        {
            $lookup: {
                from: 'offerapplications',
                let: { offerId: '$_id', savedPromoters: '$savedPromoters' },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                { $expr: { $eq: ['$offerId', '$offerId'] } },
                                { status: 'applied' }
                            ]
                        }
                    },
                    { $project: { userId: 1 } },
                    {
                        $lookup: {
                            from: 'users',
                            let: { userId: '$userId' },
                            pipeline: [
                                {
                                    $match: {
                                        $and: [
                                            { $or: [{ $expr: { $eq: ['$_id', '$$userId'] } }, { $expr: { $eq: ['$_id', '$$userId'] } }] },
                                            { isDeleted: false },
                                            { isSuspended: false }
                                        ]
                                    }
                                },
                                { $project: { type: 1, username: 1, name: 1, profileImage: 1, profileImageType: 1, profileFollowlinks: 1, profileFunlinks: 1, followersCount: 1 } },
                                {
                                    $set: {
                                        profileImage: {
                                            $cond: {
                                                if: { $eq: [null, "$profileImage"] },
                                                then: null,
                                                else: { $concat: ["$profileImage", "-", "xs"] },
                                            },
                                        },
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'cluboffers',
                                        let: { profileFollowlinks: '$profileFollowlinks', profileFunlinks: '$profileFunlinks' },
                                        pipeline: [
                                            {
                                                $match: {
                                                    isDeleted: false,
                                                    isSafe: true,
                                                    isCompleted: true,
                                                    $or: [
                                                        { $expr: { $eq: ['$selectedPromoter', '$$profileFollowlinks'] } },
                                                        { $expr: { $eq: ['$selectedPromoter', '$$profileFunlinks'] } }
                                                    ]
                                                }
                                            },
                                            { $project: { _id: 1 } }
                                        ],
                                        as: 'offersCompleted'
                                    }
                                },
                                {
                                    $project: {
                                        name: 1,
                                        profileImage: 1,
                                        profileImageType: 1,
                                        followersCount: 1,
                                        offersCompleted: { $size: '$offersCompleted' }
                                    }
                                },
                            ],
                            as: 'masterProfile'
                        }
                    },
                    { $project: { masterProfile: 1 } },
                    {
                        $addFields: {
                            saved: {
                                $in: ["$masterProfile._id", "$$savedPromoters"]
                            },
                        },
                    },
                    { $match: { $expr: { $ne: [0, { $size: '$masterProfile' }] } } },
                ],
                as: 'applications'
            }
        },
        { $set: { appliedBy: { $size: '$applications' } } },
        {
            $lookup: {
                from: 'clubcategories',
                let: { category: '$category' },
                pipeline: [
                    { $match: { $expr: { $in: ['$_id', '$$category'] } } },
                    { $project: { name: 1 } }
                ],
                as: 'category'
            }
        },
        {
            $project: {
                type: 1,
                offer: 1,
                cost: 1,
                requiredMilestone: 1,
                days: 1,
                startDate: 1,
                club: 1,
                createdAt: 1,
                category: 1,
                applications: 1,
                appliedBy: 1,
            }
        }
    ])
}