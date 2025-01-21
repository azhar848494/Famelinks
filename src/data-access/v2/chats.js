const mongoose = require("mongoose");

const ChatDB = require("../../models/v2/chats");
const MessagesDB = require("../../models/v2/messages");

const ObjectId = mongoose.Types.ObjectId;

exports.addMessage = (chatId, body, senderId, quote, type) => {
  return MessagesDB.create({ chatId, senderId, body, quote, type });
};

exports.createChat = (title, members, requests) => {
  return ChatDB.create({ title, members, requests });
};

exports.getChatByMembers = (memberIds) => {
  return ChatDB.findOne({ members: { $all: memberIds } }).lean();
};

exports.getUserChats = (userId, page) => {
  return ChatDB.aggregate()
    .match({
      $expr: {
        $and: [
          { $in: [ObjectId(userId), "$members"] },
          { $not: { $in: [ObjectId(userId), "$requests"] } },
        ],
      },
    })
    .lookup({
      from: "messages",
      let: { chatId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$$chatId", "$chatId"] } } },
        { $sort: { updatedAt: -1 } },
        { $limit: 1 },
      ],
      as: "lastMessage",
    })
    .addFields({ lastMessage: { $first: "$lastMessage" } })
    .sort({ "lastMessage.updatedAt": "desc" })
    .skip((page - 1) * 10)
    .limit(30);
};

exports.getUserMessages = (chatId, page) => {
  return MessagesDB.aggregate()
    .match({ chatId: ObjectId(chatId) })
    .sort({ updatedAt: "desc" })
    .skip((page - 1) * 20)
    .limit(20)
    .lookup({
      from: "users",
      let: { userId: "$senderId" },
      pipeline: [
        { $match: { $expr: { $eq: ["$$userId", "$_id"] } } },
        { $project: { name: 1 } },
      ],
      as: "user",
    })
    .addFields({ user: { $first: "$user" } });
};

exports.getUserChatById = (userId, chatId) => {
  return ChatDB.findOne({
    members: { $elemMatch: { $eq: userId } },
    _id: chatId,
  }).lean();
};

exports.getUserChatRequests = (userId, page) => {
  return ChatDB.aggregate()
    .match({
      $expr: {
        $and: [{ $in: [ObjectId(userId), "$requests"] }],
      },
    })
    .lookup({
      from: "messages",
      let: { chatId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$$chatId", "$chatId"] } } },
        { $sort: { updatedAt: -1 } },
        { $limit: 1 },
      ],
      as: "lastMessage",
    })
    .match({ category: "conversation" })
    .addFields({ lastMessage: { $first: "$lastMessage" } })
    .sort({ "lastMessage.updatedAt": "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.acceptChatRequest = (chatId, userId) => {
  return ChatDB.updateOne({ _id: chatId }, { $pull: { requests: userId } });
};

exports.markAsRead = (chatId, userId) => {
  return ChatDB.updateOne({ _id: chatId }, { $push: { readBy: userId } });
};

exports.deleteChat = (chatId) => {
  return ChatDB.deleteOne({ _id: chatId });
};

exports.deleteChatMessages = (chatId) => {
  return MessagesDB.deleteMany({ chatId });
};

exports.getUserChatRequestsCount = (userId) => {
  return ChatDB.aggregate([
    { $match: { category: "conversation" } },
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
          $and: [{ $in: [ObjectId(userId), "$requests"] }],
        },
      },
    },
    { $unwind: { path: "$members" } },
    {
      $match: {
        $expr: {
          $and: [
            { $not: [{ $in: ["$members", "$blockedUserIds"] }] },
            { $not: [{ $eq: [ObjectId(userId), "$members"] }] },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        members: {
          $push: "$members",
        },
      },
    },
    { $count: "requests" },
    { $project: { requestCount: "$requests" } },
  ]);
};

exports.getUserJobChatRequests = (userId, page) => {
  return ChatDB.aggregate()
    .match({
      $expr: {
        $and: [{ $in: [ObjectId(userId), "$requests"] }],
      },
    })
    .lookup({
      from: "messages",
      let: { chatId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$$chatId", "$chatId"] } } },
        { $sort: { updatedAt: -1 } },
        { $limit: 1 },
      ],
      as: "lastMessage",
    })
    .lookup({
      from: "jobs",
      let: { jobId: "$jobId" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$jobId"] } } },
        {
          $lookup: {
            from: "jobcategories",
            let: { jobCategory: "$jobCategory" },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$jobCategory"] } } },
              { $project: { _id: 0, jobName: 1 } },
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
          $project: { createdBy: 1, title: 1, jobLocation: 1, jobDetails: 1 },
        },
        { $addFields: { jobDetails: { $first: "$jobDetails" } } },
        {
          $group: {
            _id: "$_id",
            createdBy: { $first: "$createdBy" },
            title: { $first: "$title" },
            location: { $first: "$jobLocation" },
            jobName: { $first: "$jobDetails.jobName" },
          },
        },
      ],
      as: "job",
    })
    .addFields({ job: { $first: "$job" } })
    .match({ category: "jobChat" })
    .addFields({ lastMessage: { $first: "$lastMessage" } })
    .sort({ "lastMessage.updatedAt": "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

exports.getUserJobChatRequestsCount = (userId) => {
  return ChatDB.aggregate([
    { $match: { category: "jobChat" } },
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
          $and: [{ $in: [ObjectId(userId), "$requests"] }],
        },
      },
    },
    { $unwind: { path: "$members" } },
    {
      $match: {
        $expr: {
          $and: [
            { $not: [{ $in: ["$members", "$blockedUserIds"] }] },
            { $not: [{ $eq: [ObjectId(userId), "$members"] }] },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        members: {
          $push: "$members",
        },
      },
    },
    { $count: "requests" },
    { $project: { requestCount: "$requests" } },
  ]);
};

exports.getChatMessages = (userId, selfUserId, category, page) => {
  return (
    ChatDB.aggregate()
      .match({
        $and: [
          { $expr: { $eq: [2, { $size: "$members" }] } },
          { isGroup: false },
          { category: category },
          { $expr: { $in: [ObjectId(userId), "$members"] } },
          { $expr: { $in: [ObjectId(selfUserId), "$members"] } },
        ],
      })
      .lookup({
        from: "messages",
        let: { chatId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$$chatId", "$chatId"] } } },
          {
            $lookup: {
              from: "users",
              let: { userId: "$senderId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$$userId", "$_id"] } } },
                { $project: { name: 1 } },
              ],
              as: "user",
            },
          },
          { $addFields: { user: { $first: "$user" } } },
          { $sort: { createdAt: -1 } },
          { $limit: 20 },
        ],
        as: "messages",
      })
      // .addFields({ lastMessage: { $first: "$lastMessage" } })
      // .sort({ "lastMessage.updatedAt": "desc" }
      .project({ readBy: 1, messages: 1 })
      .skip((page - 1) * 10)
      .limit(30)
  );
};