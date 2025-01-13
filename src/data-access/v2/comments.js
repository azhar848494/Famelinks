const mongoose = require("mongoose");

const CommentDB = require("../../models/v2/comments");

const ObjectId = mongoose.Types.ObjectId;

exports.addComment = (userId, mediaId, body, parentId) => {
  return CommentDB.create({ userId, mediaId, body, parentId });
};

exports.updateComment = (commentId, body, userId) => {
  return CommentDB.updateOne({ _id: commentId, userId }, { $set: { body } });
};

exports.deleteComment = (commentId, userId) => {
  return CommentDB.findOneAndDelete({ _id: commentId, userId });
};

exports.getUserCommentById = (commentId, userId) => {
  return CommentDB.findOne({ _id: commentId, userId });
};

exports.getOneComment = (commentId) => {
  return CommentDB.findOne({ _id: commentId });
};

exports.getComments = (userId, postId, page, postType) => {
  let field = "";
  switch (postType) {
    case "famelinks":
      field = "$profileFamelinks";
      break;
    case "funlinks":
      field = "$profileFunlinks";
      break;
    case "followlinks":
      field = "$profileFollowlinks";
      break;
    case "storelinks":
      field = "$profileStorelinks";
      break;
    case "collablinks":
      field = "$profileCollablinks";
      break;
  }

  return CommentDB.aggregate([
    { $match: { mediaId: ObjectId(postId), parentId: null } },
    {
      $lookup: {
        from: "likes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              userId: ObjectId(userId),
              $expr: { $eq: ["$mediaId", "$$commentId"] },
            },
          },
          { $project: { status: 1, _id: 0 } },
        ],
        as: "likeStatus",
      },
    },
    { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },
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
              profileImage: 1,
              profileImageType: 1,
              profile: {
                name: `${field}.name`,
                bio: `${field}.bio`,
                profession: `${field}.profession`,
                profileImage: `${field}.profileImage`,
                profileImageType: `${field}.profileImageType`,
              }
            },
          },
        ],
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },
    { $match: { $expr: { $ne: ["$user._id", null] } } },
    {
      $project: {
        user: 1,
        _id: 1,
        userId: 1,
        mediaId: 1,
        body: 1,
        createdAt: 1,
        updatedAt: 1,
        likeStatus: { $ifNull: ["$likeStatus", null] },
        repliesCount: 1,
        likesCount: 1,
      },
    },
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getCommentReplies = (userId, commentId, page, postType) => {
  let field = "";
  switch (postType) {
    case "famelinks":
      field = "$profileFamelinks";
      break;
    case "funlinks":
      field = "$profileFunlinks";
      break;
    case "followlinks":
      field = "$profileFollowlinks";
      break;
    case "storelinks":
      field = "$profileStorelinks";
      break;
    case "collablinks":
      field = "$profileCollablinks";
      break;
  }

  return CommentDB.aggregate([
    { $match: { parentId: ObjectId(commentId) } },
    {
      $lookup: {
        from: "likes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              userId: ObjectId(userId),
              $expr: { $eq: ["$mediaId", "$$commentId"] },
            },
          },
          { $project: { status: 1, _id: 0 } },
        ],
        as: "likeStatus",
      },
    },
    { $addFields: { likeStatus: { $first: "$likeStatus.status" } } },    
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
              profileImage: 1,
              profileImageType: 1,
              profile: {
                name: `${field}.name`,
                bio: `${field}.bio`,
                profession: `${field}.profession`,
                profileImage: `${field}.profileImage`,
                profileImageType: `${field}.profileImageType`,
              }
            },
          },
        ],
        as: "user",
      },
    },
    { $addFields: { user: { $first: "$user" } } },
    { $match: { $expr: { $ne: ["$user._id", null] } } },
    {
      $project: {
        user: 1,
        _id: 1,
        mediaId: 1,
        body: 1,
        createdAt: 1,
        updatedAt: 1,
        likeStatus: { $ifNull: ["$likeStatus", null] },
        likesCount: 1,
      },
    },
  ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.updateCommentLikeCounter = (commentId, incBy) => {
  return CommentDB.updateOne(
    { _id: commentId },
    { $inc: { likesCount: incBy } }
  );
};

exports.updateCommentRepliesCounter = (commentId, incBy) => {
  return CommentDB.updateOne(
    { _id: commentId },
    { $inc: { repliesCount: incBy } }
  );
};
