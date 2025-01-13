const mongoose = require('mongoose');

const ChatDB = require('../../models/v2/chats');
const MessagesDB = require('../../models/v2/messages');
const JobsDB = require('../../models/v2/jobs')

const ObjectId = mongoose.Types.ObjectId;

const addMessage = (chatId, body, senderId, quote, type) => {
    return MessagesDB.create({ chatId, senderId, body, quote, type });
};

const createChat = (title, members, requests, jobId) => {
    if (jobId) {
        return ChatDB.create({ title, members, requests, jobId, category: 'jobChat' });
    }
    return ChatDB.create({ title, members, requests });
};

const getChatByMembers = (memberIds, jobId) => {
    if (jobId) {
        return ChatDB.findOne({ members: { $all: memberIds }, jobId: jobId, category: 'jobChat' }).lean();
    }
    return ChatDB.findOne({ members: { $all: memberIds }, category: 'conversation' }).lean();
};

const getUserChats = (userId, page) => {
    return ChatDB
        .aggregate()
        .match({ category: 'conversation', $expr: { $and: [{ $in: [ObjectId(userId), '$members'] }, { $not: { $in: [ObjectId(userId), '$requests'] } }] } })
        .lookup({
            from: 'messages',
            let: { chatId: '$_id' },
            pipeline: [
                { $match: { $expr: { $eq: ['$$chatId', '$chatId'] } } },
                { $sort: { updatedAt: -1 } },
                { $limit: 1 }
            ],
            as: 'lastMessage'
        })
        .addFields({ lastMessage: { $first: '$lastMessage' } })
        .sort({ 'lastMessage.updatedAt': 'desc' })
        .skip((page - 1) * 10)
        .limit(30);
};

const getUserJobChats = (userId, page, profileJoblinks) => {
  return ChatDB.aggregate()
    .match({
      category: "jobChat",
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
        {
          $set: {
            isChatOwner: {
              $cond: [
                { $eq: ["$createdBy", profileJoblinks] },
                true,
                false,
              ],
            },
          },
        },
      ],
      as: "job",
    })
    .addFields({ job: { $first: "$job" } })
    .sort({ "lastMessage.updatedAt": "desc" })
    .skip((page - 1) * 10)
    .limit(30);
};

const getUserMessages = (chatId, page, chatCategory) => {
    return MessagesDB
        .aggregate()
        .match({ chatId: ObjectId(chatId) })
        .sort({ updatedAt: 'desc' })
        .skip((page - 1) * 20)
        .limit(20)
        .lookup({
            from: 'users',
            let: { userId: '$senderId' },
            pipeline: [
                { $match: { $expr: { $eq: ['$$userId', '$_id'] } } },
                { $project: { name: 1 } }
            ],
            as: 'user'
        })
        .addFields({ user: { $first: '$user' } })
};

const getUserChatById = (userId, chatId) => {
    return ChatDB.findOne({ members: { $elemMatch: { $eq: userId } }, _id: chatId }).lean();
};

const getUserChatRequests = (userId, page) => {
    return ChatDB
        .aggregate()
        .match({ $expr: { $in: [ObjectId(userId), '$requests'] } })
        .lookup({
            from: 'messages',
            let: { chatId: '$_id' },
            pipeline: [
                { $match: { $expr: { $eq: ['$$chatId', '$chatId'] } } },
                { $sort: { updatedAt: -1 } },
                { $limit: 1 }
            ],
            as: 'lastMessage'
        })
        .addFields({ lastMessage: { $first: '$lastMessage' } })
        .sort({ 'lastMessage.updatedAt': 'desc' })
        .skip((page - 1) * 10)
        .limit(10);
};

const acceptChatRequest = (chatId, userId) => {
    return ChatDB.updateOne({ _id: chatId }, { $pull: { requests: userId } });
};

const markAsRead = (chatId, userId) => {
    return ChatDB.updateOne({ _id: chatId }, { $push: { readBy: userId } });
};

const deleteChat = (chatId) => {
    return ChatDB.deleteOne({ _id: chatId });
};

const deleteChatMessages = (chatId) => {
    return MessagesDB.deleteMany({ chatId });
};

const getUserChatRequestsCount = (userId) => {
    return ChatDB.aggregate([
        {
            $lookup: {
                from: 'users',
                let: { userId: '$userId' },
                pipeline: [
                    { $match: { _id: ObjectId(userId) } },
                    { $project: { blockList: 1 } }
                ],
                as: 'selfUser'
            }
        },
        { $addFields: { 'blockedUserIds': { $first: '$selfUser.blockList' } } },
        { $match: { $expr: { $in: [ObjectId(userId), '$requests'] } } },
        { $unwind: { path: '$members' } },
        {
            $match: {
                $expr: {
                    $and: [
                        { $not: [{ $in: ['$members', '$blockedUserIds'] }] },
                        { $not: [{ $eq: [ObjectId(userId), '$members'] }] }
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$_id',
                members: {
                    $push: "$members"
                }
            }
        },
        { $count: 'requests' },
        { $project: { requestCount: '$requests' } }
    ]);
};

const getJobDetails = (jobId) => {
    return JobsDB.aggregate([
        { $match: { _id: jobId } },
        {
            $lookup: {
                from: 'jobcategories',
                let: { jobCategory: '$jobCategory' },
                pipeline: [
                    { $match: { $expr: { $in: ['$_id', '$$jobCategory'] } } },
                    { $project: { _id: 0, jobName: 1, } }
                ],
                as: 'jobDetails'
            }
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
        { $project: { title: 1, jobLocation: 1, jobDetails: 1 } },
        { $addFields: { 'jobDetails': { $first: '$jobDetails' } } },
        {
            $group: {
                _id: '$_id',
                title: { $first: '$title' },
                location: { $first: '$jobLocation' },
                jobName: { $first: '$jobDetails.jobName' },
            }
        },
    ])
}

const closeChat = (chatId) => {
    return ChatDB.updateOne({ _id: chatId }, { $set: { isClosed: true } })
}

module.exports = {
    addMessage,
    createChat,
    getChatByMembers,
    getUserChats,
    getUserMessages,
    getUserChatById,
    getUserChatRequests,
    acceptChatRequest,
    deleteChat,
    deleteChatMessages,
    getUserChatRequestsCount,
    markAsRead,
    getUserJobChats,
    getJobDetails,
    closeChat
};