
const mongoose = require("mongoose");
const appConfig = require("../../../configs/app.config");
const ObjectId = mongoose.Types.ObjectId;

const CollablinksDB = require("../../models/v2/collablinks");


const addPost = (data) => {
  return CollablinksDB.create(data);
};

const getCollabLinks = (followLinksId, userId, page, filterObj) => {
  return (
    CollablinksDB.aggregate([
      { $sort: { createdAt: -1 } },
      // { $match: filterObj },
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
          from: "users",
          let: { blockedUserIds: "$blockedUserIds" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$blockedUserIds"] } } },
            { $project: { profileCollablinks: 1, _id: 0 } },
          ],
          as: "profileCollablinks",
        },
      },
      {
        $match: {
          isDeleted: false,
          isSafe: true,
          isBlocked: false,
          userId: { $ne: ObjectId(appConfig.famelinks.officialId) },
          $expr: { $not: [{ $in: ["$userId", "$profileCollablinks"] }] },
        },
      },
      {
        $lookup: {
          from: "profilecollablinks",
          let: { userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            {
              $project: {
                name: 1,
                // dob: 1,
                bio: 1,
                profession: 1,
                profileImage: '$profileImageX50',
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
                      $expr: { $eq: ["$profileCollablinks", "$$userId"] },
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
                      profileCollablinks: 1,
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
                profileImage: { $first: ".profileImageX50" },
                profileImageType: { $first: "$profileImageType" },
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
                status: "accepted",
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
        $project: {
          type: "agency",
          createdAt: 1,
          updatedAt: 1,
          name: 1,
          profession: 1,
          location: { $first: "$location" },
          gender: 1,
          challenges: 1,
          user: 1,
          description: 1,
          profileImage: '$profileImageX50',
          profileImageType: 1,
          likesCount: 1,
          commentsCount: 1,
          followStatus: 1,
          // followStatus: { $ifNull: [{ $toBool: "$followStatus" }, false] },
          isWelcomeVideo: {
            $cond: [{ $ifNull: ["$isWelcomeVideo", false] }, 1, 0],
          },
          likeStatus: { $ifNull: ["$likeStatus", null] },
          media: 1,
          tag: { $ifNull: ["$tag", null] },
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
      // { $sort: { isWelcomeVideo: -1, createdAt: -1 } },
    ])
      // .sort({ createdAt: "desc" })
      .skip((page - 1) * 4)
      .limit(4)
  );
};

const getMyCollabLinks = (
  profileId,
  page,
  selfProfileId,
  selfMasterId,
  filterObj
) => {
  return CollablinksDB.aggregate([
    {
      $match: {
        userId: ObjectId(profileId),
        isDeleted: false,
        isSafe: true,
        isBlocked: false,
      },
    },
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
              dob: 1,
              profile: {
                name: "$profileCollablinks.name",
                bio: "$profileCollablinks.bio",
                profession: "$profileCollablinks.profession",
                profileImage: "$profileCollablinks.profileImageX50",
                profileImageType: "$profileCollablinks.profileImageType",
              }
            },
          },
        ],
        as: "users",
      },
    },
    { $addFields: { users: { $first: "$users" } } },
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
                    type: 1,
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
    {
      $lookup: {
        from: "users",
        let: { profileCollablinks: ObjectId(profileId) },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$profileCollablinks", "$$profileCollablinks"],
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
        type: "agency",
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
        description: 1,
        profileImage: '$profileImageX50',
        profileImageType: 1,
        likeStatus: { $ifNull: ["$likeStatus", null] },
        media: 1,
        tag: 1,
      },
    },
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

const getOnePost = (postId) => {
  return CollablinksDB.findOne({ _id: postId }).lean();
};

const deletePost = (postId, userId) => {
  return CollablinksDB.findOneAndDelete({ _id: postId, userId });
};

const updatePost = (postId, data) => {
  return CollablinksDB.updateOne({ _id: postId }, { $set: data });
};

const updatePostLikeCounter = (postId, incBy) => {
  return CollablinksDB.updateOne(
    { _id: postId },
    { $inc: { likesCount: incBy } }
  );
};

const updatePostCommentCounter = (postId, incBy) => {
  return CollablinksDB.updateOne(
    { _id: postId },
    { $inc: { commentsCount: incBy } }
  );
};


module.exports = {
  addPost,
  getCollabLinks,
  getMyCollabLinks,
  getOnePost,
  deletePost,
  updatePost,
  updatePostLikeCounter,
  updatePostCommentCounter,
};