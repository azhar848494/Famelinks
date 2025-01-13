const jobs = require("../../models/v2/jobs");
const jobApplications = require("../../models/v2/jobApplications");
const jobCategories = require("../../models/v2/jobCategories");

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const UsersDB = require("../../models/v2/users");
const profileJoblinks = require("../../models/v2/profileJoblinks");
const hiringprofile = require("../../models/v2/hiringProfiles");
const invitations = require("../../models/v2/invitations");
const categoriesSuggestions = require("../../models/v2/categoriesSuggestions");

exports.addJobCategory = (jobData) => {
  return jobCategories.create(jobData);
};

exports.addCategorySuggestion = (categoryData) => {
  return categoriesSuggestions.create(categoryData);
};

exports.createJob = (data) => {
  return jobs.create(data);
};

exports.createJobApplication = (userId, jobId, jobType) => {
  return jobApplications.create({ userId, jobId, jobType });
};

exports.updateJob = (jobId, data) => {
  return jobs.updateOne({ _id: jobId }, { $set: data });
};

exports.updateJobApplication = (userId, jobId, status) => {
  if (status == "withdraw") {
    return jobApplications.deleteOne({ userId: userId, jobId: jobId });
  }

  return jobApplications.updateOne(
    { userId: userId, jobId: jobId },
    { $set: { status: status } }
  );
};

exports.getAllJobCategories = (jobType) => {
  return jobCategories.aggregate([
    { $match: { jobType: jobType } },
    { $project: { createdAt: 0, updatedAt: 0 } },
  ]);
};

exports.getJob = (jobId) => {
  return jobs.findOne({ _id: ObjectId(jobId) });
};

exports.checkJob = (jobId) => {
  return jobs.aggregate([
    { $match: { _id: ObjectId(jobId) } },
    {
      $lookup: {
        from: "users",
        let: { userId: "$createdBy" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          {
            $project: {
              _id: 1,
              name: 1,
              type: 1,
              username: 1,
              profileImageType: 1,
              profileImage: 1,
              profile: {
                name: "$profileJoblinks.name",
                profileImageType: "$profileJoblinks.profileImageType",
                profileImage: "$profileJoblinks.profileImage",
              },
            },
          },
        ],
        as: "createdBy",
      },
    },
  ]);
};

//MasterIdMigration
exports.updateSavedJobs = (userId, action, data) => {
  if (action == "unsave") {
    return UsersDB.updateOne(
      { _id: userId },
      { $pull: { "profileJoblinks.savedJobs": data } }
    );
  } else if (action == "save") {
    return UsersDB.updateOne({ _id: userId }, { $push: { "profileJoblinks.savedJobs": data } });
  }
  return;
};

exports.getUserJobs = (joblinksId, page) => {
  let pagination = page ? page : 1;
  return jobs.aggregate([
    {
      $match: { isClosed: false, createdBy: { $ne: joblinksId } },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { joblinksId: joblinksId },
        pipeline: [
          { $match: { $expr: { $eq: ["$userId", "$$joblinksId"] } } },
          { $project: { jobId: 1, _id: 0 } },
        ],
        as: "jobsApplied",
      },
    },
    { $addFields: { jobIds: "$jobsApplied.jobId" } },
    { $match: { $expr: { $not: [{ $in: ["$_id", Array.isArray("$jobIds") ? "$jobIds" : []] }] } } },
    {
      $lookup: {
        from: "jobcategories",
        let: { jobCategory: "$jobCategory" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] },
            },
          },
          { $project: { _id: 1, jobName: 1, jobType: 1, jobCategory: 1 } },
        ],
        as: "jobDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        let: { userId: "$createdBy" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          {
            $project: {
              name: 1,
              type: 1,
              username: 1,
              profileImageType: 1,
              profileImage: 1,
              profile: {
                name: "$profileJoblinks.name",
                profileImageType: "$profileJoblinks.profileImageType",
                profileImage: "$profileJoblinks.profileImage",
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
        let: { userId: joblinksId },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          { $project: { _id: 0, savedJobs: "$profileJoblinks.savedJobs" } },
        ],
        as: "savedJobs",
      },
    },
    { $addFields: { savedJobs: { $first: "$savedJobs.savedJobs" } } },
    { $addFields: { savedStatus: { $in: ["$_id", Array.isArray("$savedJobs") ? "$savedJobs" : []] } } },
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
  ]);
};

exports.getAgentJobs = (joblinksId, page) => {
  let pagination = page ? page : 1;
  return jobs.aggregate([
    {
      $match: {
        isClosed: false,
        jobType: "crew",
        createdBy: { $ne: joblinksId },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: joblinksId },
        pipeline: [
          { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
          { $project: { jobId: 1, _id: 0 } },
        ],
        as: "jobsApplied",
      },
    },
    { $addFields: { jobIds: "$jobsApplied.jobId" } },
    { $match: { $expr: { $not: [{ $in: ["$_id", Array.isArray("$jobIds") ? "$jobIds" : []] }] } } },
    {
      $lookup: {
        from: "jobcategories",
        let: { jobCategory: "$jobCategory" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] },
            },
          },
          { $project: { _id: 0, jobName: 1, jobType: 1, jobCategory: 1 } },
        ],
        as: "jobDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        let: { userId: "$createdBy" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          {
            $project: {
              name: 1,
              type: 1,
              username: 1,
              profileImageType: 1,
              profileImage: 1,
              profile: {
                name: "$profileJoblinks.name",
                profileImageType: "$profileJoblinks.profileImageType",
                profileImage: "$profileJoblinks.profileImage",
              },
            },
          },
        ],
        as: "createdBy",
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
        createdByFaces: 0,
        createdByCrew: 0,
      },
    },
    { $sort: { updatedAt: -1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.userExplore = (page, joblinksId, masterId) => {
  let pagination = page ? page : 1;
  return UsersDB.aggregate([
    { $match: { profileJoblinks: joblinksId } },
    { $project: { _id: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: joblinksId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "applied",
            },
          },
          { $set: { appliedOn: "$createdAt" } },
          { $set: { applicationId: "$_id" } },
          { $project: { _id: 0, jobId: 1, appliedOn: 1, applicationId: 1 } },
          {
            $lookup: {
              from: "jobs",
              let: {
                jobId: "$jobId",
                appliedOn: "$appliedOn",
                applicationId: "$applicationId",
              },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$jobId"] } } },
                { $set: { appliedOn: "$$appliedOn" } },
                { $set: { applicationId: "$$applicationId" } },
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
                {
                  $project: {
                    createdAt: 1,
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
                    createdBy: 1,
                    appliedOn: 1,
                    applicationId: 1,
                  },
                },
                {
                  $lookup: {
                    from: "jobcategories",
                    let: { jobCategory: "$jobCategory" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
                      { $project: { _id: 0, jobName: 1, jobCategory: 1 } },
                    ],
                    as: "jobDetails",
                  },
                },
                {
                  $lookup: {
                    from: "chats",
                    let: {
                      member1: masterId,
                      member2: "$masterIdOfCrgetJobeatedBy",
                    },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            { $expr: { $eq: [2, { $size: "$members" }] } },
                            { isGroup: false },
                            { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                            { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                            { category: "jobChat" },
                            { $expr: { $eq: ["$jobId", "$$jobId"] } },
                          ],
                        },
                      },
                      { $project: { _id: 1 } },
                    ],
                    as: "chatDetails",
                  },
                },
                { $addFields: { chatId: { $first: "$chatDetails" } } },
                { $addFields: { chatId: "$chatId._id" } },
                {
                  $addFields: {
                    chatId: {
                      $cond: [{ $ifNull: ["$chatId", false] }, "$chatId", null],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    let: { createdBy: "$createdBy" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$createdBy"] } } },
                      {
                        $project: {
                          name: 1,
                          type: 1,
                          username: 1,
                          profileImageType: 1,
                          profileImage: 1,
                          profile: {
                            name: "$profileJoblinks.name",
                            profileImageType: "$profileJoblinks.profileImageType",
                            profileImage: "$profileJoblinks.profileImage",
                          },
                        },
                      },
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
                {
                  $project: {
                    jobCategory: 0,
                    masterIdOfCreatedBy: 0,
                    chatDetails: 0,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (pagination - 1) * 10 },
                { $limit: 10 },
              ],
              as: "job",
            },
          },
          // {
          //     $addFields: {
          //         'faces': {
          //             $filter: {
          //                 input: '$jobs',
          //                 as: 'job',
          //                 cond: { $eq: ['faces', '$$job.jobType'] }
          //             }
          //         }
          //     }
          // },
          // {
          //     $set: {
          //         'faces': {
          //             $map: {
          //                 input: '$faces',
          //                 as: 'faceJob',
          //                 in: {
          //                     _id: '$$faceJob._id',
          //                     jobType: '$$faceJob.jobType',
          //                     title: '$$faceJob.title',
          //                     jobLocation: '$$faceJob.jobLocation',
          //                     description: '$$faceJob.description',
          //                     startDate: '$$faceJob.startDate',
          //                     endDate: '$$faceJob.endDate',
          //                     deadline: '$$faceJob.deadline',
          //                     ageGroup: '$$faceJob.ageGroup',
          //                     height: '$$faceJob.height',
          //                     gender: '$$faceJob.gender',
          //                     jobDetails: '$$faceJob.jobDetails'
          //                 }
          //             }
          //         }
          //     }
          // },
          // {
          //     $addFields: {
          //         'crew': {
          //             $filter: {
          //                 input: '$jobs',
          //                 as: 'job',
          //                 cond: { $eq: ['crew', '$$job.jobType'] }
          //             }
          //         }
          //     }
          // },
          // {
          //     $set: {
          //         'crew': {
          //             $map: {
          //                 input: '$crew',
          //                 as: 'crewJob',
          //                 in: {
          //                     _id: '$$crewJob._id',
          //                     jobType: '$$crewJob.jobType',
          //                     title: '$$crewJob.title',
          //                     jobLocation: '$$crewJob.jobLocation',
          //                     description: '$$crewJob.description',
          //                     startDate: '$$crewJob.startDate',
          //                     endDate: '$$crewJob.endDate',
          //                     deadline: '$$crewJob.deadline',
          //                     experienceLevel: '$$crewJob.experienceLevel',
          //                     jobDetails: '$$crewJob.jobDetails'
          //                 }
          //             }
          //         }
          //     }
          // },
          { $project: { jobId: 0 } },
          { $set: { job: { $first: "$job" } } },
        ],
        as: "applied",
      },
    },
    { $set: { applied: "$applied.job" } },
    // { $set: { applied: { $first: "$applied" } } },
    // {
    //   $addFields: {
    //     applied: { $cond: [{ $ifNull: ["$applied", false] }, "$applied", []] },
    //   },
    // },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: joblinksId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "hired",
            },
          },
          { $set: { appliedOn: "$createdAt" } },
          { $set: { applicationId: "$_id" } },
          { $project: { _id: 0, jobId: 1, appliedOn: 1, applicationId: 1 } },
          {
            $lookup: {
              from: "jobs",
              let: {
                jobId: "$jobId",
                appliedOn: "$appliedOn",
                applicationId: "$applicationId",
              },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$jobId"] } } },
                { $set: { appliedOn: "$$appliedOn" } },
                { $set: { applicationId: "$$applicationId" } },
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
                    createdBy: 1,
                    createdAt: 1,
                    appliedOn: 1,
                    applicationId: 1,
                  },
                },
                {
                  $lookup: {
                    from: "jobcategories",
                    let: { jobCategory: "$jobCategory" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
                      { $project: { _id: 0, jobName: 1, jobCategory: 1 } },
                    ],
                    as: "jobDetails",
                  },
                },
                //MasterIdMigration
                {
                  $lookup: {
                    from: "chats",
                    let: { member1: masterId, member2: "$masterIdOfCreatedBy" },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            { $expr: { $eq: [2, { $size: "$members" }] } },
                            { isGroup: false },
                            { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                            { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                            { category: "jobChat" },
                            { $expr: { $eq: ["$jobId", "$$jobId"] } },
                          ],
                        },
                      },
                      { $project: { _id: 1 } },
                    ],
                    as: "chatDetails",
                  },
                },
                { $addFields: { chatId: { $first: "$chatDetails" } } },
                { $addFields: { chatId: "$chatId._id" } },
                {
                  $addFields: {
                    chatId: {
                      $cond: [{ $ifNull: ["$chatId", false] }, "$chatId", null],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    let: { createdBy: "$createdBy" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$createdBy"] } } },
                      {
                        $project: {
                          name: 1,
                          type: 1,
                          username: 1,
                          profileImageType: 1,
                          profileImage: 1,
                          profile: {
                            name: "$profileJoblinks.name",
                            profileImageType: "$profileJoblinks.profileImageType",
                            profileImage: "$profileJoblinks.profileImage",
                          },
                        },
                      },
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
                {
                  $project: {
                    jobCategory: 0,
                    masterIdOfCreatedBy: 0,
                    chatDetails: 0,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (pagination - 1) * 10 },
                { $limit: 10 },
              ],
              as: "job",
            },
          },
          // {
          //     $addFields: {
          //         'faces': {
          //             $filter: {
          //                 input: '$jobs',
          //                 as: 'job',
          //                 cond: { $eq: ['faces', '$$job.jobType'] }
          //             }
          //         }
          //     }
          // },
          // {
          //     $set: {
          //         'faces': {
          //             $map: {
          //                 input: '$faces',
          //                 as: 'faceJob',
          //                 in: {
          //                     _id: '$$faceJob._id',
          //                     jobType: '$$faceJob.jobType',
          //                     title: '$$faceJob.title',
          //                     jobLocation: '$$faceJob.jobLocation',
          //                     description: '$$faceJob.description',
          //                     startDate: '$$faceJob.startDate',
          //                     endDate: '$$faceJob.endDate',
          //                     deadline: '$$faceJob.deadline',
          //                     ageGroup: '$$faceJob.ageGroup',
          //                     height: '$$faceJob.height',
          //                     gender: '$$faceJob.gender',
          //                     jobDetails: '$$faceJob.jobDetails'
          //                 }
          //             }
          //         }
          //     }
          // },
          // {
          //     $addFields: {
          //         'crew': {
          //             $filter: {
          //                 input: '$jobs',
          //                 as: 'job',
          //                 cond: { $eq: ['crew', '$$job.jobType'] }
          //             }
          //         }
          //     }
          // },
          // {
          //     $set: {
          //         'crew': {
          //             $map: {
          //                 input: '$crew',
          //                 as: 'crewJob',
          //                 in: {
          //                     _id: '$$crewJob._id',
          //                     jobType: '$$crewJob.jobType',
          //                     title: '$$crewJob.title',
          //                     jobLocation: '$$crewJob.jobLocation',
          //                     description: '$$crewJob.description',
          //                     startDate: '$$crewJob.startDate',
          //                     endDate: '$$crewJob.endDate',
          //                     deadline: '$$crewJob.deadline',
          //                     experienceLevel: '$$crewJob.experienceLevel',
          //                     jobDetails: '$$crewJob.jobDetails'
          //                 }
          //             }
          //         }
          //     }
          // },
          { $project: { jobId: 0 } },
          { $set: { job: { $first: "$job" } } },
        ],
        as: "hired",
      },
    },
    { $set: { hired: "$hired.job" } },
    // { $set: { hired: { $first: "$hired" } } },
    // {
    //   $addFields: {
    //     hired: { $cond: [{ $ifNull: ["$hired", false] }, "$hired", []] },
    //   },
    // },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: joblinksId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "shortlisted",
            },
          },
          { $set: { appliedOn: "$createdAt" } },
          { $set: { applicationId: "$_id" } },
          { $project: { _id: 0, jobId: 1, appliedOn: 1, applicationId: 1 } },
          {
            $lookup: {
              from: "jobs",
              let: {
                jobId: "$jobId",
                appliedOn: "$appliedOn",
                applicationId: "$applicationId",
              },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$jobId"] } } },
                { $set: { appliedOn: "$$appliedOn" } },
                { $set: { applicationId: "$$applicationId" } },
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
                    createdBy: 1,
                    createdAt: 1,
                    appliedOn: 1,
                    applicationId: 1,
                  },
                },
                {
                  $lookup: {
                    from: "jobcategories",
                    let: { jobCategory: "$jobCategory" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
                      { $project: { _id: 0, jobName: 1, jobCategory: 1 } },
                    ],
                    as: "jobDetails",
                  },
                },
                //MasterIdMigration
                {
                  $lookup: {
                    from: "chats",
                    let: { member1: masterId, member2: "$masterIdOfCreatedBy" },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            { $expr: { $eq: [2, { $size: "$members" }] } },
                            { isGroup: false },
                            { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                            { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                            { category: "jobChat" },
                            { $expr: { $eq: ["$jobId", "$$jobId"] } },
                          ],
                        },
                      },
                      { $project: { _id: 1 } },
                    ],
                    as: "chatDetails",
                  },
                },
                { $addFields: { chatId: { $first: "$chatDetails" } } },
                { $addFields: { chatId: "$chatId._id" } },
                {
                  $addFields: {
                    chatId: {
                      $cond: [{ $ifNull: ["$chatId", false] }, "$chatId", null],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    let: { createdBy: "$createdBy" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$createdBy"] } } },
                      {
                        $project: {
                          name: 1,
                          type: 1,
                          username: 1,
                          profileImageType: 1,
                          profileImage: 1,
                          profile: {
                            name: "$profileJoblinks.name",
                            profileImageType: "$profileJoblinks.profileImageType",
                            profileImage: "$profileJoblinks.profileImage",
                          },
                        },
                      },
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
                {
                  $project: {
                    jobCategory: 0,
                    masterIdOfCreatedBy: 0,
                    chatDetails: 0,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (pagination - 1) * 10 },
                { $limit: 10 },
              ],
              as: "job",
            },
          },
          // {
          //     $addFields: {
          //         'faces': {
          //             $filter: {
          //                 input: '$jobs',
          //                 as: 'job',
          //                 cond: { $eq: ['faces', '$$job.jobType'] }
          //             }
          //         }
          //     }
          // },
          // {
          //     $set: {
          //         'faces': {
          //             $map: {
          //                 input: '$faces',
          //                 as: 'faceJob',
          //                 in: {
          //                     _id: '$$faceJob._id',
          //                     jobType: '$$faceJob.jobType',
          //                     title: '$$faceJob.title',
          //                     jobLocation: '$$faceJob.jobLocation',
          //                     description: '$$faceJob.description',
          //                     startDate: '$$faceJob.startDate',
          //                     endDate: '$$faceJob.endDate',
          //                     deadline: '$$faceJob.deadline',
          //                     ageGroup: '$$faceJob.ageGroup',
          //                     height: '$$faceJob.height',
          //                     gender: '$$faceJob.gender',
          //                     jobDetails: '$$faceJob.jobDetails'
          //                 }
          //             }
          //         }
          //     }
          // },
          // {
          //     $addFields: {
          //         'crew': {
          //             $filter: {
          //                 input: '$jobs',
          //                 as: 'job',
          //                 cond: { $eq: ['crew', '$$job.jobType'] }
          //             }
          //         }
          //     }
          // },
          // {
          //     $set: {
          //         'crew': {
          //             $map: {
          //                 input: '$crew',
          //                 as: 'crewJob',
          //                 in: {
          //                     _id: '$$crewJob._id',
          //                     jobType: '$$crewJob.jobType',
          //                     title: '$$crewJob.title',
          //                     jobLocation: '$$crewJob.jobLocation',
          //                     description: '$$crewJob.description',
          //                     startDate: '$$crewJob.startDate',
          //                     endDate: '$$crewJob.endDate',
          //                     deadline: '$$crewJob.deadline',
          //                     experienceLevel: '$$crewJob.experienceLevel',
          //                     jobDetails: '$$crewJob.jobDetails'
          //                 }
          //             }
          //         }
          //     }
          // },
          { $project: { jobId: 0 } },
          { $set: { job: { $first: "$job" } } },
        ],
        as: "shortlisted",
      },
    },
    { $set: { shortlisted: "$shortlisted.job" } },
    // { $set: { shortlisted: { $first: "$shortlisted" } } },
    // {
    //   $addFields: {
    //     shortlisted: {
    //       $cond: [{ $ifNull: ["$shortlisted", false] }, "$shortlisted", []],
    //     },
    //   },
    // },
    {
      $lookup: {
        from: "users",
        let: { joblinksId: joblinksId },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$joblinksId"] } } },
          { $project: { _id: 0, savedJobs: "$profileJoblinks.savedJobs" } },
          {
            $lookup: {
              from: "jobs",
              let: { jobId: "$savedJobs" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobId") ? "$$jobId" : []] } } },
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
                {
                  $project: {
                    createdAt: 1,
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
                    createdBy: 1,
                    createdAt: 1,
                  },
                },
                {
                  $lookup: {
                    from: "jobcategories",
                    let: { jobCategory: "$jobCategory" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
                      { $project: { _id: 0, jobName: 1, jobCategory: 1 } },
                    ],
                    as: "jobDetails",
                  },
                },
                //MasterIdMigration
                {
                  $lookup: {
                    from: "chats",
                    let: { member1: masterId, member2: "$masterIdOfCreatedBy" },
                    pipeline: [
                      {
                        $match: {
                          $and: [
                            { $expr: { $eq: [2, { $size: "$members" }] } },
                            { isGroup: false },
                            { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                            { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                            { category: "jobChat" },
                            { $expr: { $eq: ["$jobId", "$$jobId"] } },
                          ],
                        },
                      },
                      { $project: { _id: 1 } },
                    ],
                    as: "chatDetails",
                  },
                },
                { $addFields: { chatId: { $first: "$chatDetails" } } },
                { $addFields: { chatId: "$chatId._id" } },
                {
                  $addFields: {
                    chatId: {
                      $cond: [{ $ifNull: ["$chatId", false] }, "$chatId", null],
                    },
                  },
                },
                //MasterIdMigration
                {
                  $lookup: {
                    from: "users",
                    let: { createdBy: "$createdBy" },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$createdBy"] } } },
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
                    as: "createdBy",
                  },
                },
                {
                  $project: {
                    jobCategory: 0,
                    masterIdOfCreatedBy: 0,
                    chatDetails: 0,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (pagination - 1) * 10 },
                { $limit: 10 },
              ],
              as: "job",
            },
          },
        ],
        as: "savedJobs",
      },
    },
    { $addFields: { savedJobs: "$savedJobs.job" } },
    { $addFields: { savedJobs: { $first: "$savedJobs" } } },
    { $project: { _id: 0 } },
  ]);
};

exports.brandAgencyExplore = (search, page, joblinksId) => {
  let pagination = page ? page : 1;
  return UsersDB.aggregate([
    {
      $match: {
        isDeleted: false,
        isRegistered: true,
        profileJoblinks: { $ne: joblinksId },
      },
    },
    {
      $project: { type: 1, name: 1, profileImage: 1, profileImageType: 1 },
    },
    {
      $lookup: {
        from: "invitations",
        let: { to: "$_id", from: joblinksId, type: "$type" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$to", "$$to"] } },
                { $expr: { $eq: ["$from", "$$from"] } },
                { $expr: { $eq: ["$jobType", "$$type"] } },
                { status: "invited" },
                { category: "job" },
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
        invitation: {
          $cond: [{ $ne: [0, { $size: "$invitation" }] }, true, false],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { joblinksId: joblinksId, profileJoblinks: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$joblinksId"] } } },
          { $project: { _id: 0, savedTalents: 1 } },
          {
            $match: { $expr: { $in: ["$$profileJoblinks", Array.isArray("$savedTalents") ? "$savedTalents" : []] } },
          },
        ],
        as: "saved",
      },
    },
    {
      $set: {
        saved: {
          $cond: [{ $ne: [0, { $size: "$saved" }] }, true, false],
        },
      },
    },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.checkApplication = (jobId, userId) => {
  return jobApplications.findOne({ userId: userId, jobId: jobId });
};

exports.shortlistUser = (jobId, data) => {
  return jobs.updateOne({ _id: jobId }, { $addToSet: data });
};

exports.deListUser = (jobId, userId) => {
  return jobs.updateOne(
    { _id: jobId },
    { $pull: { shortlistedApplicants: { $in: [userId] } } }
  );
};

//MasterIdMigration
exports.saveUser = (profileId, data) => {
  return UsersDB.updateOne({ _id: profileId }, { $push: { "profileJoblinks.savedTalents": data } });
};

exports.unSaveUser = (profileId, userId) => {
  return UsersDB.updateOne(
    { _id: profileId },
    { $pull: { "profileJoblinks.savedTalents": data } }
  );
};

//masterId => If agent/brand is exploring talents then he should not see himself in talents
//joblinksId => agent's/brand's joblinksId to fetch the shortlisted talents

exports.getTalents = (page, masterId, joblinksId) => {
  let pagination = page ? page : 1;
  return UsersDB.aggregate([
    {
      $match: {
        _id: { $ne: masterId },
        isRegistered: true,
        profileJoblinks: { $exists: true, $ne: null },
      },
    },
    {
      $match: {
        $or: [{ type: "individual" }, { type: "agency" }],
      },
    },
    {
      $project: {
        _id: 1,
        profileFamelinks: 1,
        profileJoblinks: 1,
        createdAt: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        let: { joblinksId: joblinksId, profileJoblinks: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$joblinksId"] } } },
          { $project: { _id: 0, savedTalents: "$profileJoblinks.savedTalents" } },
          {
            $match: { $expr: { $in: ["$$profileJoblinks", Array.isArray("$savedTalents") ? "$savedTalents" : []] } },
          },
        ],
        as: "saved",
      },
    },
    {
      $set: {
        saved: {
          $cond: [{ $ne: [0, { $size: "$saved" }] }, true, false],
        },
      },
    },
    {
      $lookup: {
        from: "invitations",
        let: { to: "$_id", from: joblinksId },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$to", "$$to"] } },
                { $expr: { $eq: ["$from", "$$from"] } },
                { status: "invited" },
                { category: "job" },
              ],
            },
          },
        ],
        as: "invitationStatus",
      },
    },
    {
      $set: {
        invitationStatus: {
          $cond: [{ $ne: [0, { $size: "$invitationStatus" }] }, true, false],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { profileJoblinks: "$profileJoblinks", profileFamelinks: "$profileFamelinks " },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$profileJoblinks"] },
              isDeleted: false,
              isSuspended: false,
            },
          },
          {
            $lookup: {
              from: "ambassadors",
              let: { userId: "$_d" },
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
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { profileFamelinks: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$profileFamelinks"] } } },
                { $project: { _id: 0, trendWinner: "$profileFamelinks.trendWinner" } },
              ],
              as: "trendsWon",
            },
          },
          {
            $project: {
              name: 1,
              trendsWon: 1,
              ambassador: 1,
              username: 1,
              profileImage: 1,
              profileImageType: 1,
              followersCount: 1,
              dob: 1,
              gender: 1,
              ageGroup: 1,
            },
          },
          {
            $set: {
              profileImage: {
                $cond: [
                  { $eq: [null, "$profileImage"] },
                  null,
                  { $concat: ["$profileImage", "-", "xs"] },
                ],
              },
            },
          },
          {
            $set: {
              age: {
                $dateDiff: {
                  startDate: "$dob",
                  endDate: "$$NOW",
                  unit: "year",
                },
              },
            },
          },
          {
            $set: {
              ambassador: {
                $cond: [
                  { $ne: [0, { $size: "$ambassador" }] },
                  { $first: "$ambassador.title" },
                  "",
                ],
              },
            },
          },
          { $set: { trendsWon: { $first: "$trendsWon" } } },
          {
            $set: {
              trendsWon: {
                $cond: [
                  { $ne: [0, { $size: "$trendsWon.trendWinner" }] },
                  "Trend Setter",
                  "",
                ],
              },
            },
          },
          {
            $set: {
              achievements: {
                $cond: [{ $ne: ["", "$ambassador"] }, "$ambassador", ""],
              },
            },
          },
          {
            $set: {
              achievements: {
                $cond: [
                  { $ne: ["", "$achievements"] },
                  { $concat: ["$achievements", ", ", "$trendsWon"] },
                  "$trendsWon",
                ],
              },
            },
          },
          { $project: { dob: 0, trendsWon: 0, ambassador: 0 } },
        ],
        as: "masterProfile",
      },
    },
    { $match: { $expr: { $ne: [0, { $size: "$masterProfile" }] } } },
    { $addFields: { masterProfile: { $first: "$masterProfile" } } },
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
        from: "users",
        let: { profileJoblinks: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$profileJoblinks"] } } },
          {
            $project: {
              name: "$profileJoblinks.",
              profileFaces: "$profileJoblinks.",
              profileCrew: "$profileJoblinks.",
              greetVideo: "$profileJoblinks.",
              greetText: "$profileJoblinks.",
              profileImage: "$profileJoblinks.",
              profileImageType: "$profileJoblinks.",
            },
          },
          {
            $set: {
              profileImage: {
                $cond: [
                  { $eq: [null, "$profileImage"] },
                  null,
                  { $concat: ["$profileImage", "-", "xs"] },
                ],
              },
            },
          },
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
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$value") ? "$$value" : []] } } },
                      {
                        $lookup: {
                          from: "locatns",
                          let: { value: "$scopes" },
                          pipeline: [
                            { $match: { $expr: { $in: ["$_id", Array.isArray("$$value") ? "$$value" : []] } } },
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
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$interestCat") ? "$$interestCat" : []] } } },
                      { $project: { _id: 0, jobName: 1, jobCategory: 1 } },
                    ],
                    as: "interestCat",
                  },
                },
              ],
              as: "faces",
            },
          },
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
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$interestCat") ? "$$interestCat" : []] } } },
                      { $project: { _id: 0, jobName: 1, jobCategory: 1 } },
                    ],
                    as: "interestCat",
                  },
                },

                {
                  $lookup: {
                    from: "locatns",
                    let: { value: "$interestedLoc" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$value") ? "$$value" : []] } } },
                      {
                        $lookup: {
                          from: "locatns",
                          let: { value: "$scopes" },
                          pipeline: [
                            { $match: { $expr: { $in: ["$_id", Array.isArray("$$value") ? "$$value" : []] } } },
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
        ],
        as: "profile",
      },
    },
    { $addFields: { profile: { $first: "$profile" } } },
    { $project: { profileFamelinks: 0, profileJoblinks: 0 } },
    { $sort: { createdAt: -1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.getOpenJobs = (joblinksId, page, jobType) => {
  let pagination = page ? page : 1;
  return jobs.aggregate([
    { $match: { isClosed: false, jobType: jobType, createdBy: joblinksId } },
    {
      $lookup: {
        from: "jobcategories",
        let: { jobCategory: "$jobCategory" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
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
            $group: {
              _id: "$user._id",
              profileImage: { $first: "$user.profileImage" },
              profileImageType: { $first: "$user.profileImageType" },
              profile: { $first: "$user.profile" }
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
          { $project: { type: 1, value: 1, } },
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
        jobDetails: 1,
        ageGroup: 1,
        gender: 1,
        height: 1,
        createdAt: 1,
        applicants: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.getClosedJobs = (joblinksId, page, jobType) => {
  let pagination = page ? page : 1;
  return jobs.aggregate([
    { $match: { isClosed: true, jobType: jobType, createdBy: joblinksId } },
    {
      $lookup: {
        from: "jobcategories",
        let: { jobCategory: "$jobCategory" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
          { $project: { jobName: 1, jobCategory: 1 } },
        ],
        as: "jobDetails",
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
        jobDetails: 1,
        ageGroup: 1,
        gender: 1,
        height: 1,
        createdAt: 1,
        selectedCandidates: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.getHiringProfile = (profileId, profileType) => {
  switch (profileType) {
    case "faces":
      return hiringprofile.find(
        { userId: profileId, type: profileType },
        {
          height: 1,
          weight: 1,
          bust: 1,
          waist: 1,
          hip: 1,
          eyeColor: 1,
          complexion: 1,
          interestedLoc: 1,
          interestCat: 1,
        }
      );
      break;
    case "crew":
      return hiringprofile.find(
        { userId: profileId, type: profileType },
        {
          experienceLevel: 1,
          workExperience: 1,
          achievements: 1,
          interestedLoc: 1,
          interestCat: 1,
        }
      );
      break;
  }
};

exports.updateHiringProfile = (Id, data) => {
  return hiringprofile.updateOne({ _id: Id }, { $set: data });
};

exports.getApplicantsFaces = (selfMasterId, jobId, page) => {
  let pagination = page ? page : 1;

  return jobs.aggregate([
    { $match: { _id: ObjectId(jobId) } },
    { $project: { _id: 1, lastVisited: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$jobId", "$$jobId"] },
              status: { $ne: "withdrew" },
            },
          },
          { $project: { _id: 0, userId: 1, status: 1, updatedAt: 1 } },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
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
                      profileFaces: "$profileJoblinks.profileFaces",
                      greetVideo: "$profileJoblinks.greetVideo",
                      greetText: "$profileJoblinks.greetText",
                    },
                  },
                },
              ],
              as: "profile",
            },
          },
          {
            $lookup: {
              from: "hiringprofiles",
              let: { profileId: { $first: "$profile.profileFaces" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
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
                  },
                },
              ],
              as: "hiringProfile",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { profileJoblinks: { $first: "$profile._id" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$profileJoblinks"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
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
                //MasterIdMigration
                {
                  $lookup: {
                    from: "users",
                    let: { profileFamelinks: "$_id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ["$_id", "$$profileFamelinks"] },
                        },
                      },
                      { $project: { _id: 0, trendWinner: "$profileFamelinks.trendWinner" } },
                    ],
                    as: "trendsWon",
                  },
                },
                // { $project: { trendsWon: 1, ambassador: 1, username: 1, profileImage: 1, profileImageType: 1, followersCount: 1, dob: 1, profileFamelinks: 1 } },
                {
                  $set: {
                    ambassador: {
                      $cond: [
                        { $ne: [0, { $size: "$ambassador" }] },
                        { $first: "$ambassador.title" },
                        "",
                      ],
                    },
                  },
                },
                { $set: { trendsWon: { $first: "$trendsWon" } } },
                {
                  $set: {
                    trendsWon: {
                      $cond: [
                        { $ne: [0, { $size: "$trendsWon.trendWinner" }] },
                        "Trend Setter",
                        "",
                      ],
                    },
                  },
                },
                {
                  $set: {
                    achievements: {
                      $cond: [{ $ne: ["", "$ambassador"] }, "$ambassador", ""],
                    },
                  },
                },
                {
                  $set: {
                    achievements: {
                      $cond: [
                        { $ne: ["", "$achievements"] },
                        { $concat: ["$achievements", ", ", "$trendsWon"] },
                        "$trendsWon",
                      ],
                    },
                  },
                },
                {
                  $project: {
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    followersCount: 1,
                    dob: 1,
                    type: 1,
                    achievements: 1,
                    profileFamelinks: 1,
                  },
                },
                {
                  $set: {
                    profileImage: {
                      $cond: [
                        { $eq: [null, "$profileImage"] },
                        null,
                        { $concat: ["$profileImage", "-", "xs"] },
                      ],
                    },
                  },
                },
                {
                  $set: {
                    age: {
                      $dateDiff: {
                        startDate: "$dob",
                        endDate: "$$NOW",
                        unit: "year",
                      },
                    },
                  },
                },
                { $project: { dob: 0, trendsWon: 0, ambassador: 0 } },
              ],
              as: "masterProfile",
            },
          },
          { $set: { masterProfile: { $first: "$masterProfile" } } },
          {
            $lookup: {
              from: "famelinks",
              let: { userId: "$masterProfile._id" },
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
                  $set: {
                    likesCount: { $sum: ["$likes1Count", "$likes2Count"] },
                  },
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
          {
            $set: {
              MasterProfile: {
                _id: "$masterProfile._id",
                profileImage: "$masterProfile.profileImage",
                followersCount: "$masterProfile.followersCount",
                username: "$masterProfile.username",
                profileImageType: "$masterProfile.profileImageType",
                achievements: "$masterProfile.achievements",
                age: "$masterProfile.age",
                type: "$masterProfile.type",
              },
            },
          },
          {
            $lookup: {
              from: "jobapplications",
              let: { userId: "$userId", jobId: ObjectId(jobId) },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$userId", "$$userId"] } },
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                      { status: "shortlisted" },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "shortlisted",
            },
          },
          {
            $set: {
              shortlisted: {
                $cond: [{ $eq: [0, { $size: "$shortlisted" }] }, false, true],
              },
            },
          },
          {
            $lookup: {
              from: "chats",
              let: { member1: "$masterProfile._id", member2: selfMasterId },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: [2, { $size: "$members" }] } },
                      { isGroup: false },
                      { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                      { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                      { category: "jobChat" },
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "chatDetails",
            },
          },
          { $addFields: { chatId: { $first: "$chatDetails" } } },
          { $addFields: { chatId: "$chatId._id" } },
          {
            $group: {
              _id: { $first: "$profile._id" },
              name: { $first: { $first: "$profile.name" } },
              status: { $first: "$status" },
              updatedAt: { $first: "$updatedAt" },
              profileImage: { $first: { $first: "$profile.profileImage" } },
              profileImageType: {
                $first: { $first: "$profile.profileImageType" },
              },
              greetVideo: { $first: { $first: "$profile.greetVideo" } },
              greetText: { $first: { $first: "$profile.greetText" } },
              hiringProfile: { $first: { $first: "$hiringProfile" } },
              masterProfile: { $first: "$MasterProfile" },
              posts: { $first: "$posts" },
              chatId: { $first: "$chatId" },
              shortlisted: { $first: "$shortlisted" },
            },
          },
          { $match: { $expr: { $ne: [null, "$masterProfile"] } } },
          { $sort: { updatedAt: -1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "applicants",
      },
    },
    {
      $addFields: {
        Hired: {
          $cond: [
            { $isArray: "$hiredApplicants" },
            { $size: "$hiredApplicants" },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        totalApplicants: {
          $cond: [{ $isArray: "$applicants" }, { $size: "$applicants" }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id", lastVisited: "$lastVisited" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: { $ne: "withdraw" } },
                { $expr: { $gte: ["$createdAt", "$$lastVisited"] } },
              ],
            },
          },
        ],
        as: "newApplicants",
      },
    },
    { $addFields: { newApplicants: { $size: "$newApplicants" } } },
    { $project: { lastVisited: 0 } },
  ]);
};

exports.getApplicantsCrew = (selfMasterId, jobId, page) => {
  let pagination = page ? page : 1;

  return jobs.aggregate([
    { $match: { _id: ObjectId(jobId) } },
    { $project: { _id: 1, lastVisited: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$jobId", "$$jobId"] },
              status: { $ne: "withdrew" },
            },
          },
          { $project: { _id: 0, userId: 1, status: 1, updatedAt: 1 } },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
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
                      profileCrew: "$profileJoblinks.profileCrew",
                      greetVideo: "$profileJoblinks.greetVideo",
                      greetText: "$profileJoblinks.greetText",
                    },
                  },
                },
              ],
              as: "profile",
            },
          },
          {
            $lookup: {
              from: "hiringprofiles",
              let: { profileId: { $first: "$profile.profileCrew" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
                {
                  $project: {
                    _id: 0,
                    workExperience: 1,
                    achievements: 1,
                    experienceLevel: 1,
                  },
                },
              ],
              as: "hiringProfile",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { profileJoblinks: { $first: "$profile._id" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$profileJoblinks"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
                {
                  $project: {
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    followersCount: 1,
                    dob: 1,
                    type: 1,
                    profileFamelinks: 1,
                  },
                },
                {
                  $set: {
                    profileImage: {
                      $cond: [
                        { $eq: [null, "$profileImage"] },
                        null,
                        { $concat: ["$profileImage", "-", "xs"] },
                      ],
                    },
                  },
                },
                {
                  $set: {
                    age: {
                      $dateDiff: {
                        startDate: "$dob",
                        endDate: "$$NOW",
                        unit: "year",
                      },
                    },
                  },
                },
                { $project: { dob: 0 } },
              ],
              as: "masterProfile",
            },
          },
          { $match: { $expr: { $ne: [0, { $size: "$masterProfile" }] } } },
          { $set: { masterProfile: { $first: "$masterProfile" } } },
          {
            $lookup: {
              from: "famelinks",
              let: { userId: "$masterProfile._id" },
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
                  $set: {
                    likesCount: { $sum: ["$likes1Count", "$likes2Count"] },
                  },
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
          {
            $lookup: {
              from: "jobapplications",
              let: { userId: "$userId", jobId: ObjectId(jobId) },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$userId", "$$userId"] } },
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                      { status: "shortlisted" },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "shortlisted",
            },
          },
          {
            $set: {
              shortlisted: {
                $cond: [{ $eq: [0, { $size: "$shortlisted" }] }, false, true],
              },
            },
          },
          {
            $lookup: {
              from: "chats",
              let: { member1: "$masterProfile._id", member2: selfMasterId },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: [2, { $size: "$members" }] } },
                      { isGroup: false },
                      { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                      { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                      { category: "jobChat" },
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "chatDetails",
            },
          },
          { $addFields: { chatId: { $first: "$chatDetails" } } },
          { $addFields: { chatId: "$chatId._id" } },
          {
            $group: {
              _id: { $first: "$profile._id" },
              name: { $first: { $first: "$profile.name" } },
              status: { $first: "$status" },
              updatedAt: { $first: "$updatedAt" },
              profileImage: { $first: { $first: "$profile.profileImage" } },
              profileImageType: {
                $first: { $first: "$profile.profileImageType" },
              },
              greetVideo: { $first: { $first: "$profile.greetVideo" } },
              greetText: { $first: { $first: "$profile.greetText" } },
              hiringProfile: { $first: { $first: "$hiringProfile" } },
              masterProfile: { $first: "$masterProfile" },
              chatId: { $first: "$chatId" },
              shortlisted: { $first: "$shortlisted" },
              posts: { $first: "$posts" },
            },
          },
          { $sort: { updatedAt: -1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "applicants",
      },
    },
    {
      $addFields: {
        Hired: {
          $cond: [
            { $isArray: "$hiredApplicants" },
            { $size: "$hiredApplicants" },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        totalApplicants: {
          $cond: [{ $isArray: "$applicants" }, { $size: "$applicants" }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id", lastVisited: "$lastVisited" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: { $ne: "withdraw" } },
                { $expr: { $gte: ["$createdAt", "$$lastVisited"] } },
              ],
            },
          },
        ],
        as: "newApplicants",
      },
    },
    { $addFields: { newApplicants: { $size: "$newApplicants" } } },
    { $project: { lastVisited: 0 } },
  ]);
};

exports.searchJobs = (selfJoblinksId, title, page) => {
  const currentDate = new Date();
  let pagination = page ? page : 1;
  return jobs.aggregate([
    {
      $match: {
        $and: [
          { isClosed: false },
          // { startDate: { $lt: currentDate } },
          { title: { $regex: `^.*?${title}.*?$`, $options: "gi" } },
        ],
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
        createdAt: 1,
        createdBy: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        let: { profileJoblinks: "$createdBy" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$_id", "$$profileJoblinks"] } },
                { isDeleted: false },
                { isSuspended: false },
              ],
            },
          },
        ],
        as: "masterProfile",
      },
    },
    { $match: { $expr: { $ne: [0, { $size: "$masterProfile" }] } } },
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
        as: "createdBy",
      },
    },
    {
      $lookup: {
        from: "jobcategories",
        let: { jobCategory: "$jobCategory" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
          { $project: { _id: 0, jobName: 1, jobCategory: 1 } },
        ],
        as: "jobDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        let: { jobId: "$_id" },
        pipeline: [
          { $match: { $expr: { $in: ["$$jobId", Array.isArray("$profileJoblinks.savedJobs") ? "$profileJoblinks.savedJobs" : []] } } },
          { $project: { _id: 1 } },
        ],
        as: "savedStatus",
      },
    },
    {
      $set: {
        savedStatus: {
          $cond: [{ $eq: [0, { $size: "$savedStatus" }] }, false, true],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id", userId: selfJoblinksId },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { $expr: { $eq: ["$userId", "$$userId"] } },
              ],
            },
          },
          { $project: { status: 1 } },
        ],
        as: "applicationsStatus",
      },
    },
    {
      $set: {
        applicationsStatus: {
          $cond: [
            { $ne: [0, { $size: "$applicationsStatus" }] },
            { $first: "$applicationsStatus.status" },
            "apply",
          ],
        },
      },
    },
    { $project: { jobCategory: 0, masterProfile: 0 } },
    { $sort: { createdAt: -1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.inviteForJob = (jobId, userId, selfId, action, jobType) => {
  if (action == "send") {
    return invitations.create({
      jobId: jobId,
      jobType: jobType,
      from: selfId,
      to: userId,
      status: "invited",
      category: "job",
    });
  }

  if (action == "withdraw") {
    return invitations.deleteOne({ jobId: jobId, jobType: jobType, from: selfId, to: userId });
  }
};

exports.getJobDetails = (jobId) => {
  return jobs.findOne({ _id: jobId }).lean();
};

exports.getSavedTalents = (page, joblinksId) => {
  let pagination = page ? page : 1;
  return UsersDB.aggregate([
    { $match: { _id: joblinksId } },
    {
      $lookup: {
        from: "hiringprofiles",
        let: { userId: "$profileJoblinks.savedTalents" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", Array.isArray("$$userId") ? "$$userId" : []] } } },
          { $project: { userId: 1, type: 1 } },
          {
            $lookup: {
              from: "users",
              let: { profileJoblinks: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$profileJoblinks"],
                    },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
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
                //MasterIdMigration
                {
                  $lookup: {
                    from: "uers",
                    let: { profileFamelinks: "$_id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ["$_id", "$$profileFamelinks"] },
                        },
                      },
                      { $project: { _id: 0, trendWinner: "$profileFamelinks.trendWinner" } },
                    ],
                    as: "trendsWon",
                  },
                },
                {
                  $set: {
                    ambassador: {
                      $cond: [
                        { $ne: [0, { $size: "$ambassador" }] },
                        { $first: "$ambassador.title" },
                        "",
                      ],
                    },
                  },
                },
                { $set: { trendsWon: { $first: "$trendsWon" } } },
                {
                  $set: {
                    trendsWon: {
                      $cond: [
                        { $ne: [0, { $size: "$trendsWon.trendWinner" }] },
                        "Trend Setter",
                        "",
                      ],
                    },
                  },
                },
                {
                  $set: {
                    achievements: {
                      $cond: [
                        { $ne: ["", "$ambassador"] },
                        "$ambassador",
                        "",
                      ],
                    },
                  },
                },
                {
                  $set: {
                    achievements: {
                      $cond: [
                        { $ne: ["", "$achievements"] },
                        {
                          $concat: ["$achievements", ", ", "$trendsWon"],
                        },
                        "$trendsWon",
                      ],
                    },
                  },
                },
                {
                  $project: {
                    type: 1,
                    name: 1,
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    followersCount: 1,
                    dob: 1,
                    achievements: 1,
                  },
                },
                {
                  $set: {
                    age: {
                      $dateDiff: {
                        startDate: "$dob",
                        endDate: "$$NOW",
                        unit: "year",
                      },
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
              from: "invitations",
              let: { to: "$userId", from: joblinksId, type: "$type" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$to", "$$to"] } },
                      { $expr: { $eq: ["$from", "$$from"] } },
                      { $expr: { $eq: ["$jobType", "$$type"] } },
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
              invitation: {
                $cond: [{ $eq: [0, { $size: "$invitation" }] }, false, true],
              },
            },
          },
          { $project: { userId: 0 } },
          { $sort: { updatedAt: -1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "savedTalents",
      },
    },
  ]);
};

exports.closeJob = (jobId, close) => {
  return jobs.updateOne({ _id: jobId }, { isClosed: close });
};

exports.getFacesShortlistedApplicant = (selfMasterId, jobId, page) => {
  let pagination = page ? page : 1;

  return jobs.aggregate([
    { $match: { _id: ObjectId(jobId) } },
    { $project: { _id: 1, lastVisited: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$jobId", "$$jobId"] },
              status: { $eq: "shortlisted" },
            },
          },
          { $project: { _id: 0, userId: 1, status: 1, updatedAt: 1 } },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
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
                      profileFaces: "$profileJoblinks.profileFaces",
                      greetVideo: "$profileJoblinks.greetVideo",
                      greetText: "$profileJoblinks.greetText",
                    },
                  },
                },
              ],
              as: "profile",
            },
          },
          {
            $lookup: {
              from: "hiringprofiles",
              let: { profileId: { $first: "$profile.profileFaces" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
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
                  },
                },
              ],
              as: "hiringProfile",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { profileJoblinks: { $first: "$profile._id" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$profileJoblinks"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
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
                //MasterIdMigration
                {
                  $lookup: {
                    from: "uers",
                    let: { profileFamelinks: "$_id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ["$_id", "$$profileFamelinks"] },
                        },
                      },
                      { $project: { _id: 0, trendWinner: "$profileFamelinks.trendWinner" } },
                    ],
                    as: "trendsWon",
                  },
                },
                // { $project: { trendsWon: 1, ambassador: 1, username: 1, profileImage: 1, profileImageType: 1, followersCount: 1, dob: 1, profileFamelinks: 1 } },
                {
                  $set: {
                    ambassador: {
                      $cond: [
                        { $ne: [0, { $size: "$ambassador" }] },
                        { $first: "$ambassador.title" },
                        "",
                      ],
                    },
                  },
                },
                { $set: { trendsWon: { $first: "$trendsWon" } } },
                {
                  $set: {
                    trendsWon: {
                      $cond: [
                        { $ne: [0, { $size: "$trendsWon.trendWinner" }] },
                        "Trend Setter",
                        "",
                      ],
                    },
                  },
                },
                {
                  $set: {
                    achievements: {
                      $cond: [{ $ne: ["", "$ambassador"] }, "$ambassador", ""],
                    },
                  },
                },
                {
                  $set: {
                    achievements: {
                      $cond: [
                        { $ne: ["", "$achievements"] },
                        { $concat: ["$achievements", ", ", "$trendsWon"] },
                        "$trendsWon",
                      ],
                    },
                  },
                },
                {
                  $project: {
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    followersCount: 1,
                    dob: 1,
                    achievements: 1,
                    profileFamelinks: 1,
                  },
                },
                {
                  $set: {
                    profileImage: {
                      $cond: [
                        { $eq: [null, "$profileImage"] },
                        null,
                        { $concat: ["$profileImage", "-", "xs"] },
                      ],
                    },
                  },
                },
                {
                  $set: {
                    age: {
                      $dateDiff: {
                        startDate: "$dob",
                        endDate: "$$NOW",
                        unit: "year",
                      },
                    },
                  },
                },
                { $project: { dob: 0, trendsWon: 0, ambassador: 0 } },
              ],
              as: "masterProfile",
            },
          },
          { $set: { masterProfile: { $first: "$masterProfile" } } },
          {
            $lookup: {
              from: "famelinks",
              let: { userId: "$masterProfile._id" },
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
                  $set: {
                    likesCount: { $sum: ["$likes1Count", "$likes2Count"] },
                  },
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
          {
            $set: {
              MasterProfile: {
                _id: "$masterProfile._id",
                profileImage: "$masterProfile.profileImage",
                followersCount: "$masterProfile.followersCount",
                username: "$masterProfile.username",
                profileImageType: "$masterProfile.profileImageType",
                achievements: "$masterProfile.achievements",
                age: "$masterProfile.age",
              },
            },
          },
          {
            $lookup: {
              from: "chats",
              let: { member1: "$masterProfile._id", member2: selfMasterId },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: [2, { $size: "$members" }] } },
                      { isGroup: false },
                      { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                      { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                      { category: "jobChat" },
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "chatDetails",
            },
          },
          { $addFields: { chatId: { $first: "$chatDetails" } } },
          { $addFields: { chatId: "$chatId._id" } },
          {
            $group: {
              _id: { $first: "$profile._id" },
              name: { $first: { $first: "$profile.name" } },
              status: { $first: "$status" },
              updatedAt: { $first: "$updatedAt" },
              profileImage: { $first: { $first: "$profile.profileImage" } },
              profileImageType: {
                $first: { $first: "$profile.profileImageType" },
              },
              greetVideo: { $first: { $first: "$profile.greetVideo" } },
              hiringProfile: { $first: { $first: "$hiringProfile" } },
              masterProfile: { $first: "$MasterProfile" },
              posts: { $first: "$posts" },
              chatId: { $first: "$chatId" },
            },
          },
          { $match: { $expr: { $ne: [null, "$masterProfile"] } } },
          { $sort: { updatedAt: -1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "applicants",
      },
    },
    {
      $addFields: {
        Hired: {
          $cond: [
            { $isArray: "$hiredApplicants" },
            { $size: "$hiredApplicants" },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        totalApplicants: {
          $cond: [{ $isArray: "$applicants" }, { $size: "$applicants" }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id", lastVisited: "$lastVisited" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: { $eq: "shortlisted" } },
                { $expr: { $gte: ["$createdAt", "$$lastVisited"] } },
              ],
            },
          },
        ],
        as: "newApplicants",
      },
    },
    { $addFields: { newApplicants: { $size: "$newApplicants" } } },
    { $project: { lastVisited: 0 } },
  ]);
};

exports.getCrewShortlistedApplicant = (selfMasterId, jobId, page) => {
  let pagination = page ? page : 1;

  return jobs.aggregate([
    { $match: { _id: ObjectId(jobId) } },
    { $project: { _id: 1, lastVisited: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$jobId", "$$jobId"] },
              status: { $eq: "shortlisted" },
            },
          },
          { $project: { _id: 0, userId: 1, status: 1, updatedAt: 1 } },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
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
                      profileCrew: "$profileJoblinks.profileCrew",
                      greetVideo: "$profileJoblinks.greetVideo",
                      greetText: "$profileJoblinks.greetText",
                    },
                  },
                },
              ],
              as: "profile",
            },
          },
          {
            $lookup: {
              from: "hiringprofiles",
              let: { profileId: { $first: "$profile.profileCrew" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
                {
                  $project: {
                    _id: 0,
                    workExperience: 1,
                    achievements: 1,
                    experienceLevel: 1,
                  },
                },
              ],
              as: "hiringProfile",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { profileJoblinks: { $first: "$profile._id" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$profileJoblinks"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
                {
                  $project: {
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    followersCount: 1,
                    dob: 1,
                    profileFamelinks: 1,
                  },
                },
                {
                  $set: {
                    profileImage: {
                      $cond: [
                        { $eq: [null, "$profileImage"] },
                        null,
                        { $concat: ["$profileImage", "-", "xs"] },
                      ],
                    },
                  },
                },
                {
                  $set: {
                    age: {
                      $dateDiff: {
                        startDate: "$dob",
                        endDate: "$$NOW",
                        unit: "year",
                      },
                    },
                  },
                },
                { $project: { dob: 0 } },
              ],
              as: "masterProfile",
            },
          },
          { $match: { $expr: { $ne: [0, { $size: "$masterProfile" }] } } },
          { $set: { masterProfile: { $first: "$masterProfile" } } },
          {
            $lookup: {
              from: "famelinks",
              let: { userId: "$masterProfile._id" },
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
                  $set: {
                    likesCount: { $sum: ["$likes1Count", "$likes2Count"] },
                  },
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
          {
            $lookup: {
              from: "chats",
              let: { member1: "$masterProfile._id", member2: selfMasterId },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: [2, { $size: "$members" }] } },
                      { isGroup: false },
                      { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                      { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                      { category: "jobChat" },
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "chatDetails",
            },
          },
          { $addFields: { chatId: { $first: "$chatDetails" } } },
          { $addFields: { chatId: "$chatId._id" } },
          {
            $group: {
              _id: { $first: "$profile._id" },
              name: { $first: { $first: "$profile.name" } },
              status: { $first: "$status" },
              updatedAt: { $first: "$updatedAt" },
              profileImage: { $first: { $first: "$profile.profileImage" } },
              profileImageType: {
                $first: { $first: "$profile.profileImageType" },
              },
              greetVideo: { $first: { $first: "$profile.greetVideo" } },
              hiringProfile: { $first: { $first: "$hiringProfile" } },
              masterProfile: { $first: "$masterProfile" },
              chatId: { $first: "$chatId" },
              posts: { $first: "$posts" },
            },
          },
          { $sort: { updatedAt: -1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "applicants",
      },
    },
    {
      $addFields: {
        Hired: {
          $cond: [
            { $isArray: "$hiredApplicants" },
            { $size: "$hiredApplicants" },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        totalApplicants: {
          $cond: [{ $isArray: "$applicants" }, { $size: "$applicants" }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id", lastVisited: "$lastVisited" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: { $eq: "shortlisted" } },
                { $expr: { $gte: ["$createdAt", "$$lastVisited"] } },
              ],
            },
          },
        ],
        as: "newApplicants",
      },
    },
    { $addFields: { newApplicants: { $size: "$newApplicants" } } },
    { $project: { lastVisited: 0 } },
  ]);
};

exports.getSotedApplicantsFaces = (selfMasterId, jobId, page, sort) => {
  let pagination = page ? page : 1;
  let sorted = sort === "asc" ? 1 : -1;

  return jobs.aggregate([
    { $match: { _id: ObjectId(jobId) } },
    { $project: { _id: 1, lastVisited: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$jobId", "$$jobId"] },
              status: { $ne: "withdrew" },
            },
          },
          { $project: { _id: 0, userId: 1, status: 1, updatedAt: 1 } },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
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
                      profileFaces: "$profileJoblinks.profileFaces",
                      greetVideo: "$profileJoblinks.greetVideo",
                      greetText: "$profileJoblinks.greetText",
                    },
                  },
                },
              ],
              as: "profile",
            },
          },
          {
            $lookup: {
              from: "hiringprofiles",
              let: { profileId: { $first: "$profile.profileFaces" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
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
                  },
                },
              ],
              as: "hiringProfile",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { profileJoblinks: { $first: "$profile._id" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$profileJoblinks"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
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
                //MasterIdMigration
                {
                  $lookup: {
                    from: "uers",
                    let: { profileFamelinks: "$_id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ["$_id", "$$profileFamelinks"] },
                        },
                      },
                      { $project: { _id: 0, trendWinner: "$profileFamelinks.trendWinner" } },
                    ],
                    as: "trendsWon",
                  },
                },
                // { $project: { trendsWon: 1, ambassador: 1, username: 1, profileImage: 1, profileImageType: 1, followersCount: 1, dob: 1, profileFamelinks: 1 } },
                {
                  $set: {
                    ambassador: {
                      $cond: [
                        { $ne: [0, { $size: "$ambassador" }] },
                        { $first: "$ambassador.title" },
                        "",
                      ],
                    },
                  },
                },
                { $set: { trendsWon: { $first: "$trendsWon" } } },
                {
                  $set: {
                    trendsWon: {
                      $cond: [
                        { $ne: [0, { $size: "$trendsWon.trendWinner" }] },
                        "Trend Setter",
                        "",
                      ],
                    },
                  },
                },
                {
                  $set: {
                    achievements: {
                      $cond: [{ $ne: ["", "$ambassador"] }, "$ambassador", ""],
                    },
                  },
                },
                {
                  $set: {
                    achievements: {
                      $cond: [
                        { $ne: ["", "$achievements"] },
                        { $concat: ["$achievements", ", ", "$trendsWon"] },
                        "$trendsWon",
                      ],
                    },
                  },
                },
                {
                  $project: {
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    followersCount: 1,
                    dob: 1,
                    achievements: 1,
                    profileFamelinks: 1,
                  },
                },
                {
                  $set: {
                    profileImage: {
                      $cond: [
                        { $eq: [null, "$profileImage"] },
                        null,
                        { $concat: ["$profileImage", "-", "xs"] },
                      ],
                    },
                  },
                },
                {
                  $set: {
                    age: {
                      $dateDiff: {
                        startDate: "$dob",
                        endDate: "$$NOW",
                        unit: "year",
                      },
                    },
                  },
                },
                { $project: { dob: 0, trendsWon: 0, ambassador: 0 } },
              ],
              as: "masterProfile",
            },
          },
          { $set: { masterProfile: { $first: "$masterProfile" } } },
          {
            $lookup: {
              from: "famelinks",
              let: { userId: "$masterProfile._id" },
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
                  $set: {
                    likesCount: { $sum: ["$likes1Count", "$likes2Count"] },
                  },
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
          {
            $set: {
              MasterProfile: {
                _id: "$masterProfile._id",
                profileImage: "$masterProfile.profileImage",
                followersCount: "$masterProfile.followersCount",
                username: "$masterProfile.username",
                profileImageType: "$masterProfile.profileImageType",
                achievements: "$masterProfile.achievements",
                age: "$masterProfile.age",
              },
            },
          },
          {
            $lookup: {
              from: "chats",
              let: { member1: "$masterProfile._id", member2: selfMasterId },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: [2, { $size: "$members" }] } },
                      { isGroup: false },
                      { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                      { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                      { category: "jobChat" },
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "chatDetails",
            },
          },
          { $addFields: { chatId: { $first: "$chatDetails" } } },
          { $addFields: { chatId: "$chatId._id" } },
          {
            $group: {
              _id: { $first: "$profile._id" },
              name: { $first: { $first: "$profile.name" } },
              status: { $first: "$status" },
              updatedAt: { $first: "$updatedAt" },
              profileImage: { $first: { $first: "$profile.profileImage" } },
              profileImageType: {
                $first: { $first: "$profile.profileImageType" },
              },
              greetVideo: { $first: { $first: "$profile.greetVideo" } },
              hiringProfile: { $first: { $first: "$hiringProfile" } },
              masterProfile: { $first: "$MasterProfile" },
              posts: { $first: "$posts" },
              chatId: { $first: "$chatId" },
            },
          },
          { $match: { $expr: { $ne: [null, "$masterProfile"] } } },
          { $sort: { createdAt: sorted } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "applicants",
      },
    },
    {
      $addFields: {
        Hired: {
          $cond: [
            { $isArray: "$hiredApplicants" },
            { $size: "$hiredApplicants" },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        totalApplicants: {
          $cond: [{ $isArray: "$applicants" }, { $size: "$applicants" }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id", lastVisited: "$lastVisited" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: { $ne: "withdraw" } },
                { $expr: { $gte: ["$createdAt", "$$lastVisited"] } },
              ],
            },
          },
        ],
        as: "newApplicants",
      },
    },
    { $addFields: { newApplicants: { $size: "$newApplicants" } } },
    { $project: { lastVisited: 0 } },
  ]);
};

exports.getSortedApplicantsCrew = (selfMasterId, jobId, page, sort) => {
  let pagination = page ? page : 1;
  let sorted = sort == "asc" ? 1 : -1;

  return jobs.aggregate([
    { $match: { _id: ObjectId(jobId) } },
    { $project: { _id: 1, lastVisited: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$jobId", "$$jobId"] },
              status: { $ne: "withdrew" },
            },
          },
          { $project: { _id: 0, userId: 1, status: 1, updatedAt: 1 } },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
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
                      profileCrew: "$profileJoblinks.profileCrew",
                      greetVideo: "$profileJoblinks.greetVideo",
                      greetText: "$profileJoblinks.greetText",
                    },
                  },
                },
              ],
              as: "profile",
            },
          },
          {
            $lookup: {
              from: "hiringprofiles",
              let: { profileId: { $first: "$profile.profileCrew" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
                {
                  $project: {
                    _id: 0,
                    workExperience: 1,
                    achievements: 1,
                    experienceLevel: 1,
                  },
                },
              ],
              as: "hiringProfile",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { profileJoblinks: { $first: "$profile._id" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$profileJoblinks"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
                {
                  $project: {
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    followersCount: 1,
                    dob: 1,
                    profileFamelinks: 1,
                  },
                },
                {
                  $set: {
                    profileImage: {
                      $cond: [
                        { $eq: [null, "$profileImage"] },
                        null,
                        { $concat: ["$profileImage", "-", "xs"] },
                      ],
                    },
                  },
                },
                {
                  $set: {
                    age: {
                      $dateDiff: {
                        startDate: "$dob",
                        endDate: "$$NOW",
                        unit: "year",
                      },
                    },
                  },
                },
                { $project: { dob: 0 } },
              ],
              as: "masterProfile",
            },
          },
          { $match: { $expr: { $ne: [0, { $size: "$masterProfile" }] } } },
          { $set: { masterProfile: { $first: "$masterProfile" } } },
          {
            $lookup: {
              from: "famelinks",
              let: { userId: "$masterProfile._id" },
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
                  $set: {
                    likesCount: { $sum: ["$likes1Count", "$likes2Count"] },
                  },
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
          {
            $lookup: {
              from: "chats",
              let: { member1: "$masterProfile._id", member2: selfMasterId },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: [2, { $size: "$members" }] } },
                      { isGroup: false },
                      { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                      { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                      { category: "jobChat" },
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "chatDetails",
            },
          },
          { $addFields: { chatId: { $first: "$chatDetails" } } },
          { $addFields: { chatId: "$chatId._id" } },
          {
            $group: {
              _id: { $first: "$profile._id" },
              name: { $first: { $first: "$profile.name" } },
              status: { $first: "$status" },
              updatedAt: { $first: "$updatedAt" },
              profileImage: { $first: { $first: "$profile.profileImage" } },
              profileImageType: {
                $first: { $first: "$profile.profileImageType" },
              },
              greetVideo: { $first: { $first: "$profile.greetVideo" } },
              hiringProfile: { $first: { $first: "$hiringProfile" } },
              masterProfile: { $first: "$masterProfile" },
              chatId: { $first: "$chatId" },
              posts: { $first: "$posts" },
            },
          },
          { $sort: { createdAt: sorted } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "applicants",
      },
    },
    {
      $addFields: {
        Hired: {
          $cond: [
            { $isArray: "$hiredApplicants" },
            { $size: "$hiredApplicants" },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        totalApplicants: {
          $cond: [{ $isArray: "$applicants" }, { $size: "$applicants" }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id", lastVisited: "$lastVisited" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: { $ne: "withdraw" } },
                { $expr: { $gte: ["$createdAt", "$$lastVisited"] } },
              ],
            },
          },
        ],
        as: "newApplicants",
      },
    },
    { $addFields: { newApplicants: { $size: "$newApplicants" } } },
    { $project: { lastVisited: 0 } },
  ]);
};

exports.getApplicantsFacesBySearch = (
  selfMasterId,
  jobId,
  name,
  age,
  gender,
  complexion,
  eyeColor,
  weight,
  height,
  bust,
  waist,
  hip,
  page
) => {
  let pagination = page ? page : 1;

  return jobs.aggregate([
    { $match: { _id: ObjectId(jobId) } },
    { $project: { _id: 1, lastVisited: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: { $ne: "withdrew" } },
              ],
            },
          },
          { $project: { _id: 0, userId: 1, status: 1, updatedAt: 1 } },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
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
                      profileFaces: "$profileJoblinks.profileFaces",
                      greetVideo: "$profileJoblinks.greetVideo",
                      greetText: "$profileJoblinks.greetText",
                    },
                  },
                },
              ],
              as: "profile",
            },
          },
          {
            $lookup: {
              from: "hiringprofiles",
              let: { profileId: { $first: "$profile.profileFaces" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
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
                  },
                },
              ],
              as: "hiringProfile",
            },
          },

          {
            $lookup: {
              from: "users",
              let: { profileJoblinks: { $first: "$profile._id" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$profileJoblinks"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
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
                //MasterIdMigration
                {
                  $lookup: {
                    from: "uers",
                    let: { profileFamelinks: "$_id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ["$_id", "$$profileFamelinks"] },
                        },
                      },
                      { $project: { _id: 0, trendWinner: "$profileFamelinks.trendWinner" } },
                    ],
                    as: "trendsWon",
                  },
                },
                // { $project: { trendsWon: 1, ambassador: 1, username: 1, profileImage: 1, profileImageType: 1, followersCount: 1, dob: 1, profileFamelinks: 1 } },
                {
                  $set: {
                    ambassador: {
                      $cond: [
                        { $ne: [0, { $size: "$ambassador" }] },
                        { $first: "$ambassador.title" },
                        "",
                      ],
                    },
                  },
                },
                { $set: { trendsWon: { $first: "$trendsWon" } } },
                {
                  $set: {
                    trendsWon: {
                      $cond: [
                        { $ne: [0, { $size: "$trendsWon.trendWinner" }] },
                        "Trend Setter",
                        "",
                      ],
                    },
                  },
                },
                {
                  $set: {
                    achievements: {
                      $cond: [{ $ne: ["", "$ambassador"] }, "$ambassador", ""],
                    },
                  },
                },
                {
                  $set: {
                    achievements: {
                      $cond: [
                        { $ne: ["", "$achievements"] },
                        { $concat: ["$achievements", ", ", "$trendsWon"] },
                        "$trendsWon",
                      ],
                    },
                  },
                },
                {
                  $project: {
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    followersCount: 1,
                    dob: 1,
                    gender: 1,
                    achievements: 1,
                    profileFamelinks: 1,
                  },
                },
                {
                  $set: {
                    profileImage: {
                      $cond: [
                        { $eq: [null, "$profileImage"] },
                        null,
                        { $concat: ["$profileImage", "-", "xs"] },
                      ],
                    },
                  },
                },
                {
                  $set: {
                    age: {
                      $dateDiff: {
                        startDate: "$dob",
                        endDate: "$$NOW",
                        unit: "year",
                      },
                    },
                  },
                },
                { $project: { dob: 0, trendsWon: 0, ambassador: 0 } },
              ],
              as: "masterProfile",
            },
          },
          { $set: { masterProfile: { $first: "$masterProfile" } } },
          {
            $lookup: {
              from: "famelinks",
              let: { userId: "$masterProfile._id" },
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
                  $set: {
                    likesCount: { $sum: ["$likes1Count", "$likes2Count"] },
                  },
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
          {
            $set: {
              MasterProfile: {
                _id: "$masterProfile._id",
                profileImage: "$masterProfile.profileImage",
                followersCount: "$masterProfile.followersCount",
                username: "$masterProfile.username",
                profileImageType: "$masterProfile.profileImageType",
                achievements: "$masterProfile.achievements",
                age: "$masterProfile.age",
                gender: "$masterProfile.gender",
              },
            },
          },

          {
            $lookup: {
              from: "chats",
              let: { member1: "$masterProfile._id", member2: selfMasterId },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: [2, { $size: "$members" }] } },
                      { isGroup: false },
                      { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                      { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                      { category: "jobChat" },
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "chatDetails",
            },
          },
          { $addFields: { chatId: { $first: "$chatDetails" } } },
          { $addFields: { chatId: "$chatId._id" } },
          {
            $group: {
              _id: { $first: "$profile._id" },
              name: { $first: { $first: "$profile.name" } },
              status: { $first: "$status" },
              updatedAt: { $first: "$updatedAt" },
              profileImage: { $first: { $first: "$profile.profileImage" } },
              profileImageType: {
                $first: { $first: "$profile.profileImageType" },
              },
              greetVideo: { $first: { $first: "$profile.greetVideo" } },
              hiringProfile: { $first: { $first: "$hiringProfile" } },
              complexion: { $first: { $first: "$hiringProfile.complexion" } },
              eyeColor: { $first: { $first: "$hiringProfile.eyeColor" } },
              weight: { $first: { $first: "$hiringProfile.weight" } },
              height: { $first: { $first: "$hiringProfile.height" } },
              bust: { $first: { $first: "$hiringProfile.bust" } },
              waist: { $first: { $first: "$hiringProfile.waist" } },
              hip: { $first: { $first: "$hiringProfile.hip" } },
              masterProfile: { $first: "$MasterProfile" },
              age: { $first: "$masterProfile.age" },
              gender: { $first: "$masterProfile.gender" },
              posts: { $first: "$posts" },
              chatId: { $first: "$chatId" },
            },
          },
          {
            $match: {
              $or: [
                { name: { $regex: `^.*?${name}.*?$`, $options: "gi" } },
                { age: age },
                { gender: { $regex: `^.*?${gender}.*?$`, $options: "gi" } },
                {
                  complexion: {
                    $regex: `^.*?${complexion}.*?$`,
                    $options: "gi",
                  },
                },
                {
                  eyeColor: {
                    $regex: `^.*?${eyeColor}.*?$`,
                    $options: "gi",
                  },
                },
                {
                  weight: weight,
                },
                {
                  height: {
                    $regex: `^.*?${height}.*?$`,
                    $options: "gi",
                  },
                },
                {
                  bust: bust,
                },
                {
                  waist: waist,
                },
                {
                  hip: hip,
                },
              ],
            },
          },
          {
            $project: {
              complexion: 0,
              age: 0,
              gender: 0,
              eyeColor: 0,
              weight: 0,
              height: 0,
              bust: 0,
              waist: 0,
              hip: 0,
            },
          },
          { $sort: { updatedAt: -1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "applicants",
      },
    },
    {
      $addFields: {
        Hired: {
          $cond: [
            { $isArray: "$hiredApplicants" },
            { $size: "$hiredApplicants" },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        totalApplicants: {
          $cond: [{ $isArray: "$applicants" }, { $size: "$applicants" }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id", lastVisited: "$lastVisited" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: { $ne: "withdraw" } },
                { $expr: { $gte: ["$createdAt", "$$lastVisited"] } },
              ],
            },
          },
        ],
        as: "newApplicants",
      },
    },
    { $addFields: { newApplicants: { $size: "$newApplicants" } } },
    { $project: { lastVisited: 0 } },
  ]);
};

exports.getApplicantsCrewBySearch = (
  selfMasterId,
  jobId,
  experienceLevel,
  page
) => {
  let pagination = page ? page : 1;

  return jobs.aggregate([
    { $match: { _id: ObjectId(jobId) } },
    { $project: { _id: 1, lastVisited: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$jobId", "$$jobId"] },
              status: { $ne: "withdrew" },
            },
          },
          { $project: { _id: 0, userId: 1, status: 1, updatedAt: 1 } },
          //MasterIdMigration
          {
            $lookup: {
              from: "users",
              let: { userId: "$userId" },
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
                      profileCrew: "$profileJoblinks.profileCrew",
                      greetVideo: "$profileJoblinks.greetVideo",
                      greetText: "$profileJoblinks.greetText",
                    },
                  },
                },
              ],
              as: "profile",
            },
          },
          {
            $lookup: {
              from: "hiringprofiles",
              let: { profileId: { $first: "$profile.profileCrew" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$profileId"] } } },
                {
                  $project: {
                    _id: 0,
                    workExperience: 1,
                    achievements: 1,
                    experienceLevel: 1,
                  },
                },
              ],
              as: "hiringProfile",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { profileJoblinks: { $first: "$profile._id" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$profileJoblinks"] },
                    isDeleted: false,
                    isSuspended: false,
                  },
                },
                {
                  $project: {
                    username: 1,
                    profileImage: 1,
                    profileImageType: 1,
                    followersCount: 1,
                    dob: 1,
                    profileFamelinks: 1,
                  },
                },
                {
                  $set: {
                    profileImage: {
                      $cond: [
                        { $eq: [null, "$profileImage"] },
                        null,
                        { $concat: ["$profileImage", "-", "xs"] },
                      ],
                    },
                  },
                },
                {
                  $set: {
                    age: {
                      $dateDiff: {
                        startDate: "$dob",
                        endDate: "$$NOW",
                        unit: "year",
                      },
                    },
                  },
                },
                { $project: { dob: 0 } },
              ],
              as: "masterProfile",
            },
          },
          { $match: { $expr: { $ne: [0, { $size: "$masterProfile" }] } } },
          { $set: { masterProfile: { $first: "$masterProfile" } } },
          {
            $lookup: {
              from: "famelinks",
              let: { userId: "$masterProfile._id" },
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
                  $set: {
                    likesCount: { $sum: ["$likes1Count", "$likes2Count"] },
                  },
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
          {
            $lookup: {
              from: "chats",
              let: { member1: "$masterProfile._id", member2: selfMasterId },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: [2, { $size: "$members" }] } },
                      { isGroup: false },
                      { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                      { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                      { category: "jobChat" },
                      { $expr: { $eq: ["$jobId", "$$jobId"] } },
                    ],
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "chatDetails",
            },
          },
          { $addFields: { chatId: { $first: "$chatDetails" } } },
          { $addFields: { chatId: "$chatId._id" } },
          {
            $group: {
              _id: { $first: "$profile._id" },
              name: { $first: { $first: "$profile.name" } },
              status: { $first: "$status" },
              updatedAt: { $first: "$updatedAt" },
              profileImage: { $first: { $first: "$profile.profileImage" } },
              profileImageType: {
                $first: { $first: "$profile.profileImageType" },
              },
              greetVideo: { $first: { $first: "$profile.greetVideo" } },
              hiringProfile: { $first: { $first: "$hiringProfile" } },
              experienceLevel: {
                $first: { $first: "$hiringProfile.experienceLevel" },
              },
              masterProfile: { $first: "$masterProfile" },
              chatId: { $first: "$chatId" },
              posts: { $first: "$posts" },
            },
          },
          {
            $match: {
              $or: [
                {
                  experienceLevel: {
                    $regex: `^.*?${experienceLevel}.*?$`,
                    $options: "gi",
                  },
                },
              ],
            },
          },
          { $project: { experienceLevel: 0 } },
          { $sort: { updatedAt: -1 } },
          { $skip: (pagination - 1) * 10 },
          { $limit: 10 },
        ],
        as: "applicants",
      },
    },
    {
      $addFields: {
        Hired: {
          $cond: [
            { $isArray: "$hiredApplicants" },
            { $size: "$hiredApplicants" },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        totalApplicants: {
          $cond: [{ $isArray: "$applicants" }, { $size: "$applicants" }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { jobId: "$_id", lastVisited: "$lastVisited" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: { $ne: "withdraw" } },
                { $expr: { $gte: ["$createdAt", "$$lastVisited"] } },
              ],
            },
          },
        ],
        as: "newApplicants",
      },
    },
    { $addFields: { newApplicants: { $size: "$newApplicants" } } },
    { $project: { lastVisited: 0 } },
  ]);
};

exports.getAppliedJobs = (page, joblinksId, masterId) => {
  let pagination = page ? page : 1;
  return UsersDB.aggregate([
    { $match: { profileJoblinks: joblinksId } },
    { $project: { _id: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: joblinksId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "applied",
            },
          },
          { $set: { appliedOn: "$createdAt" } },
          { $set: { applicationId: "$_id" } },
          { $project: { _id: 0, jobId: 1, appliedOn: 1, applicationId: 1, } },
          {
            $lookup: {
              from: "jobs",
              let: {
                jobId: "$jobId",
                appliedOn: "$appliedOn",
                applicationId: "$applicationId",
              },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$jobId"] } } },
                { $set: { appliedOn: "$$appliedOn" } },
                { $set: { applicationId: "$$applicationId" } },
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
                {
                  $project: {
                    createdAt: 1,
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
                    createdBy: 1,
                    appliedOn: 1,
                    applicationId: 1,
                  },
                },
                {
                  $lookup: {
                    from: "jobcategories",
                    let: { jobCategory: "$jobCategory" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
                      { $project: { jobName: 1, jobCategory: 1 } },
                    ],
                    as: "jobDetails",
                  },
                },
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
                  $project: {
                    jobCategory: 0,
                    createdBy: 0,
                    chatDetails: 0,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (pagination - 1) * 10 },
                { $limit: 10 },
              ],
              as: "job",
            },
          },
          { $project: { jobId: 0, } },
          { $set: { job: { $first: "$job" } } },
        ],
        as: "applied",
      },
    },
    { $set: { applied: "$applied.job" } },
    // {
    //   $lookup: {
    //     from: "hiringprofiles",
    //     pipeline: [
    //       { $match: { userId: joblinksId } },
    //       { $project: { _id: 1 } },
    //       {
    //         $lookup: {
    //           from: "invitations",
    //           let: { profileId: "$_id"},
    //           pipeline: [
    //             {
    //               $match: {
    //                 $expr: { $eq: ["$to", "$$profileId"] },
    //               },
    //             },
    //             // {
    //             //   $match: {
    //             //     $or: [
    //             //       { $expr: { $eq: ["$to", ObjectId('661e29a8f96ccc649460e3da')] } },
    //             //       { $expr: { $eq: ["$to", "$$profileId"] } }
    //             //     ],
    //             //   }
    //             // },
    //             { $group: { _id: null, invitesCount: { $sum: 1 } } },
    //             { $project: { _id: 0 } }
    //           ],
    //           as: "invitations",
    //         },
    //       },
    //       { $set: { invitesCount: { $first: "$invitations.invitesCount" } } },
    //     ],
    //     as: "hiringprofiles",
    //   },
    // },
    // { $set: { hiringprofiles: "$hiringprofiles" } },
    // {
    //   $lookup: {
    //     from: "invitations",
    //     let: { profileId: "$hiringprofiles"},
    //     pipeline: [
    //       {
    //         $match: {
    //           $or: [
    //             { $expr: { $eq: ["$to", ObjectId('661e29a8f96ccc649460e3da')] } },
    //             { $expr: { $eq: ["$to", "$$profileId"] } }
    //           ],
    //         }
    //       },
    //       { $group: { _id: null, invitesCount: { $sum: 1 } } },
    //       { $project: { _id: 0 } }
    //     ],
    //     as: "invitations",
    //   },
    // },
    // { $set: { invitesCount: { $first: "$invitations.invitesCount" } } },
  ]);
};

exports.getHiredJobs = (page, joblinksId, masterId) => {
  let pagination = page ? page : 1;
  return UsersDB.aggregate([
    { $match: { profileJoblinks: joblinksId } },
    { $project: { _id: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: joblinksId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "hired",
            },
          },
          { $set: { appliedOn: "$createdAt" } },
          { $set: { applicationId: "$_id" } },
          { $project: { _id: 0, jobId: 1, appliedOn: 1, applicationId: 1 } },
          {
            $lookup: {
              from: "jobs",
              let: {
                jobId: "$jobId",
                appliedOn: "$appliedOn",
                applicationId: "$applicationId",
              },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$jobId"] } } },
                { $set: { appliedOn: "$$appliedOn" } },
                { $set: { applicationId: "$$applicationId" } },
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
                    createdBy: 1,
                    createdAt: 1,
                    appliedOn: 1,
                    applicationId: 1,
                  },
                },
                {
                  $lookup: {
                    from: "jobcategories",
                    let: { jobCategory: "$jobCategory" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
                      { $project: { jobName: 1, jobCategory: 1 } },
                    ],
                    as: "jobDetails",
                  },
                },
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
                  $project: {
                    jobCategory: 0,
                    createdBy: 0,
                    chatDetails: 0,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (pagination - 1) * 10 },
                { $limit: 10 },
              ],
              as: "job",
            },
          },
          // {
          //     $addFields: {
          //         'faces': {
          //             $filter: {
          //                 input: '$jobs',
          //                 as: 'job',
          //                 cond: { $eq: ['faces', '$$job.jobType'] }
          //             }
          //         }
          //     }
          // },
          // {
          //     $set: {
          //         'faces': {
          //             $map: {
          //                 input: '$faces',
          //                 as: 'faceJob',
          //                 in: {
          //                     _id: '$$faceJob._id',
          //                     jobType: '$$faceJob.jobType',
          //                     title: '$$faceJob.title',
          //                     jobLocation: '$$faceJob.jobLocation',
          //                     description: '$$faceJob.description',
          //                     startDate: '$$faceJob.startDate',
          //                     endDate: '$$faceJob.endDate',
          //                     deadline: '$$faceJob.deadline',
          //                     ageGroup: '$$faceJob.ageGroup',
          //                     height: '$$faceJob.height',
          //                     gender: '$$faceJob.gender',
          //                     jobDetails: '$$faceJob.jobDetails'
          //                 }
          //             }
          //         }
          //     }
          // },
          // {
          //     $addFields: {
          //         'crew': {
          //             $filter: {
          //                 input: '$jobs',
          //                 as: 'job',
          //                 cond: { $eq: ['crew', '$$job.jobType'] }
          //             }
          //         }
          //     }
          // },
          // {
          //     $set: {
          //         'crew': {
          //             $map: {
          //                 input: '$crew',
          //                 as: 'crewJob',
          //                 in: {
          //                     _id: '$$crewJob._id',
          //                     jobType: '$$crewJob.jobType',
          //                     title: '$$crewJob.title',
          //                     jobLocation: '$$crewJob.jobLocation',
          //                     description: '$$crewJob.description',
          //                     startDate: '$$crewJob.startDate',
          //                     endDate: '$$crewJob.endDate',
          //                     deadline: '$$crewJob.deadline',
          //                     experienceLevel: '$$crewJob.experienceLevel',
          //                     jobDetails: '$$crewJob.jobDetails'
          //                 }
          //             }
          //         }
          //     }
          // },
          { $project: { jobId: 0 } },
          { $set: { job: { $first: "$job" } } },
        ],
        as: "hired",
      },
    },
    { $set: { hired: "$hired.job" } },
  ]);
};

exports.getShortlistedJobs = (page, joblinksId, masterId) => {
  let pagination = page ? page : 1;
  return UsersDB.aggregate([
    { $match: { profileJoblinks: joblinksId } },
    { $project: { _id: 1 } },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: joblinksId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              status: "shortlisted",
            },
          },
          { $set: { appliedOn: "$createdAt" } },
          { $set: { applicationId: "$_id" } },
          { $project: { _id: 0, jobId: 1, appliedOn: 1, applicationId: 1 } },
          {
            $lookup: {
              from: "jobs",
              let: {
                jobId: "$jobId",
                appliedOn: "$appliedOn",
                applicationId: "$applicationId",
              },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$jobId"] } } },
                { $set: { appliedOn: "$$appliedOn" } },
                { $set: { applicationId: "$$applicationId" } },
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
                    createdBy: 1,
                    createdAt: 1,
                    appliedOn: 1,
                    applicationId: 1,
                  },
                },
                {
                  $lookup: {
                    from: "jobcategories",
                    let: { jobCategory: "$jobCategory" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
                      { $project: { jobName: 1, jobCategory: 1 } },
                    ],
                    as: "jobDetails",
                  },
                },
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
                  $project: {
                    jobCategory: 0,
                    createdBy: 0,
                    chatDetails: 0,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (pagination - 1) * 10 },
                { $limit: 10 },
              ],
              as: "job",
            },
          },
          { $project: { jobId: 0 } },
          { $set: { job: { $first: "$job" } } },
        ],
        as: "shortlisted",
      },
    },
    { $set: { shortlisted: "$shortlisted.job" } },
  ]);
};

exports.getSavedJobs = (page, joblinksId, masterId) => {
  let pagination = page ? page : 1;
  return UsersDB.aggregate([
    { $match: { profileJoblinks: joblinksId } },
    { $project: { _id: 1 } },
    {
      $lookup: {
        from: "users",
        let: { joblinksId: joblinksId },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$joblinksId"] } } },
          { $project: { _id: 0, savedJobs: "$profileJoblinks.savedJobs" } },
          {
            $lookup: {
              from: "jobs",
              let: { jobId: "$savedJobs" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobId") ? "$$jobId" : []] } } },
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
                {
                  $project: {
                    createdAt: 1,
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
                    createdBy: 1,
                  },
                },
                {
                  $lookup: {
                    from: "jobcategories",
                    let: { jobCategory: "$jobCategory" },
                    pipeline: [
                      { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
                      { $project: { jobName: 1, jobCategory: 1 } },
                    ],
                    as: "jobDetails",
                  },
                },
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
                  $project: {
                    jobCategory: 0,
                    createdBy: 0,
                    chatDetails: 0,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (pagination - 1) * 10 },
                { $limit: 10 },
              ],
              as: "job",
            },
          },
        ],
        as: "savedJobs",
      },
    },
    { $addFields: { savedJobs: "$savedJobs.job" } },
    { $addFields: { savedJobs: { $first: "$savedJobs" } } },
    { $project: { _id: 0 } },
  ]);
};

exports.getJobInvites = (page, joblinksId, masterId) => {
  let pagination = page ? page : 1;
  return invitations.aggregate([
    { $match: { to: joblinksId, category: "job", status: "invited" } },
    {
      $lookup: {
        from: "jobs",
        let: { jobId: "$jobId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$jobId"],
              },
            },
          },
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
              from: "jobcategories",
              let: { jobCategory: "$jobCategory" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] } } },
                { $project: { jobName: 1, jobCategory: 1 } },
              ],
              as: "jobCategory",
            },
          },
          {
            $project: {
              hiredApplicants: 0,
              shortlistedApplicants: 0,
              lastVisited: 0,
              createdAt: 0,
              createdBy: 0,
              updatedAt: 0,
            },
          },
        ],
        as: "jobDetails",
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.acceptRejectJobInvite = (jobId, selfId, userId, action, jobType) => {
  if (action == "accept") {
    return jobApplications.create({
      jobId: jobId,
      jobType: jobType,
      userId: selfId,
      status: "applied",
    });
  }

  if (action == "reject") {
    return invitations.deleteOne({ jobId: jobId, jobType: jobType, from: userId, to: selfId });
  }
};

exports.deleteInvite = (jobId, selfId, userId, jobType) => {
  return invitations.deleteOne({ jobId: jobId, jobType: jobType, from: userId, to: selfId });
};

exports.getMyOpenJobs = (joblinksId, page, userId, typeObj) => {
  let pagination = page ? page : 1;
  return jobs.aggregate([
    {
      $match: { isClosed: false, createdBy: joblinksId },
    },
    {
      $match: typeObj,
    },
    {
      $lookup: {
        from: "jobcategories",
        let: { jobCategory: "$jobCategory" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", Array.isArray("$$jobCategory") ? "$$jobCategory" : []] },
            },
          },
          { $project: { _id: 0, jobName: 1, jobCategory: 1 } },
        ],
        as: "jobDetails",
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: ObjectId(userId), jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$userId", "$$userId"] } },
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: "applied" },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "Applied",
      },
    },
    {
      $set: {
        Applied: {
          $cond: [{ $eq: [0, { $size: "$Applied" }] }, false, true],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: ObjectId(userId), jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$userId", "$$userId"] } },
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: "hired" },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "Hired",
      },
    },
    {
      $set: {
        Hired: {
          $cond: [{ $eq: [0, { $size: "$Hired" }] }, false, true],
        },
      },
    },
    {
      $lookup: {
        from: "jobapplications",
        let: { userId: ObjectId(userId), jobId: "$_id" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$userId", "$$userId"] } },
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { status: "shortlisted" },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "Shortlisted",
      },
    },
    {
      $set: {
        Shortlisted: {
          $cond: [{ $eq: [0, { $size: "$Shortlisted" }] }, false, true],
        },
      },
    },
    {
      $lookup: {
        from: "invitations",
        let: {
          joblinksId: joblinksId,
          userId: ObjectId(userId),
          jobId: "$_id",
          jobType: "$jobType",
        },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$from", "$$joblinksId"] } },
                { $expr: { $eq: ["$to", "$$userId"] } },
                { $expr: { $eq: ["$jobId", "$$jobId"] } },
                { $expr: { $eq: ["$jobType", "$$jobType"] } },
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
        invitation: {
          $cond: [{ $eq: [0, { $size: "$invitation" }] }, false, true],
        },
      },
    },
    {
      $project: {
        jobCategory: 0,
        shortlistedApplicants: 0,
        hiredApplicants: 0,
        isClosed: 0,
        updatedAt: 0,
        createdBy: 0,
        // createdByCrew: 0,
        // savedJobs: 0,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};

exports.getNewTalents = (page, masterId, joblinksId) => {
  let pagination = page ? page : 1;
  return hiringprofile.aggregate([
    {
      $match: {
        userId: { $ne: joblinksId },
      },
    },
    {
      $lookup: {
        from: "jobcategories",
        let: { interestCat: "$interestCat" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", Array.isArray("$$interestCat") ? "$$interestCat" : []] },
            },
          },
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
          { $match: { $expr: { $in: ["$_id", Array.isArray("$$value") ? "$$value" : []] } } },
          {
            $lookup: {
              from: "locatns",
              let: { value: "$scopes" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", Array.isArray("$$value") ? "$$value" : []] } } },
                { $project: { type: 1, value: 1, } },
                { $sort: { _id: -1 } },
              ],
              as: "scopes",
            },
          },
          {
            $project: {
              type: 1, value: 1
              //  {
              //   $concat: [
              //     '$value',
              //     ', ',
              //     {
              //       $reduce: {
              //         input: "$scopes",
              //         initialValue: "",
              //         in: {
              //           $concat: [
              //             "$$value",
              //             { $cond: { if: { $eq: ["$$value", ""] }, then: "", else: ", " } },
              //             "$$this.value"
              //           ]
              //         }
              //       }
              //     },
              //   ],
              // },
            }
          },
        ],
        as: "interestedLoc",
      },
    },
    {
      $lookup: {
        from: "users",
        let: { joblinksId: joblinksId, profileJoblinks: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$joblinksId"] } } },
          { $project: { _id: 0, savedTalents: "$profileJoblinks.savedTalents" } },
          {
            $match: { $expr: { $in: ["$$profileJoblinks", Array.isArray("$savedTalents") ? "$savedTalents" : []] } },
          },
        ],
        as: "saved",
      },
    },
    {
      $set: {
        saved: {
          $cond: [{ $ne: [0, { $size: "$saved" }] }, true, false],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
          { $project: { _id: 0, greetVideo: "$profileJoblinks.greetVideo" } },
        ],
        as: "greetVideo",
      },
    },
    { $set: { greetVideo: { $first: "$greetVideo.greetVideo" } } },
    {
      $lookup: {
        from: "invitations",
        let: { to: "$userId", from: joblinksId, type: "$type" },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: ["$to", "$$to"] } },
                { $expr: { $eq: ["$from", "$$from"] } },
                { $expr: { $eq: ["$jobType", "$$type"] } },
                { status: "invited" },
                { category: "job" },
              ],
            },
          },
        ],
        as: "invitationStatus",
      },
    },
    {
      $set: {
        invitationStatus: {
          $cond: [{ $ne: [0, { $size: "$invitationStatus" }] }, true, false],
        },
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
              isRegistered: true,
            },
          },
          {
            $project: {
              type: 1,
              name: 1,
              username: 1,
              profileImage: 1,
              profileImageType: 1,
              gender: 1,
              dob: 1,
              followersCount: 1,
              profile: {
                name: "$profileJoblinks.name",
                profileImage: "$profileJoblinks.profileImage",
                profileImageType: "$profileJoblinks.profileImageType",
              }
            },
          },
          {
            $set: {
              age: {
                $dateDiff: {
                  startDate: "$dob",
                  endDate: "$$NOW",
                  unit: "year",
                },
              },
            },
          },
        ],
        as: "userDetail",
      },
    },
    { $addFields: { userDetail: { $first: "$userDetail" } } },
    {
      $lookup: {
        from: "users",
        let: {
          userId: "$userId",
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userId"] },
              isDeleted: false,
              isSuspended: false,
              isRegistered: true,
            },
          },
          {
            $match: {
              $or: [{ type: "individual" }],
            },
          },
          { $project: { _id: 1, profileFamelinks: 1 } },
        ],
        as: "user",
      },
    },
    { $match: { $expr: { ne: [0, { $size: "$user" }] } } },
    { $set: { profileFamelinks: { $first: "$user._id" } } },
    {
      $lookup: {
        from: "users",
        let: {
          profileJoblinks: "$userId",
          profileFamelinks: "$profileFamelinks",
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$profileJoblinks"] },
              isDeleted: false,
              isSuspended: false,
              isRegistered: true,
            },
          },
          {
            $match: {
              $or: [{ type: "individual" }],
            },
          },
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
          //MasterIdMigration
          {
            $lookup: {
              from: "uers",
              let: { profileFamelinks: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$profileFamelinks"] } } },
                { $project: { _id: 0, trendWinner: "$profileFamelinks.trendWinner" } },
              ],
              as: "trendsWon",
            },
          },
          {
            $project: {
              name: 1,
              trendsWon: 1,
              ambassador: 1,
              username: 1,
              profileImage: 1,
              profileImageType: 1,
              followersCount: 1,
              dob: 1,
              gender: 1,
              type: 1,
              ageGroup: 1,
            },
          },
          {
            $set: {
              profileImage: {
                $cond: [
                  { $eq: [null, "$profileImage"] },
                  null,
                  { $concat: ["$profileImage", "-", "xs"] },
                ],
              },
            },
          },
          {
            $set: {
              age: {
                $dateDiff: {
                  startDate: "$dob",
                  endDate: "$$NOW",
                  unit: "year",
                },
              },
            },
          },
          {
            $set: {
              ambassador: {
                $cond: [
                  { $ne: [0, { $size: "$ambassador" }] },
                  { $first: "$ambassador.title" },
                  "",
                ],
              },
            },
          },
          { $set: { trendsWon: { $first: "$trendsWon" } } },
          // {
          //   $set: {
          //     trendsWon: {
          //       $cond: [
          //         { $ne: [0, { $size: "$trendsWon.trendWinner" }] },
          //         "Trend Setter",
          //         "",
          //       ],
          //     },
          //   },
          // },
          {
            $set: {
              achievements: {
                $cond: [{ $ne: ["", "$ambassador"] }, "$ambassador", ""],
              },
            },
          },
          {
            $set: {
              achievements: {
                $cond: [
                  { $ne: ["", "$achievements"] },
                  { $concat: ["$achievements", ", ", "$trendsWon"] },
                  "$trendsWon",
                ],
              },
            },
          },
          { $project: { dob: 0, trendsWon: 0, ambassador: 0 } },
        ],
        as: "masterProfile",
      },
    },
    { $match: { $expr: { $ne: [0, { $size: "$masterProfile" }] } } },
    { $addFields: { masterProfile: { $first: "$masterProfile" } } },
    {
      $lookup: {
        from: "chats",
        let: { member1: "$masterProfile._id", member2: masterId },
        pipeline: [
          {
            $match: {
              $and: [
                { $expr: { $eq: [2, { $size: "$members" }] } },
                { isGroup: false },
                { $expr: { $in: ["$$member1", Array.isArray("$members") ? "$members" : []] } },
                { $expr: { $in: ["$$member2", Array.isArray("$members") ? "$members" : []] } },
                { category: "conversation" },
              ],
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "chatId",
      },
    },
    // { $addFields: { chatId: { $first: "$chatId" } } },
    // { $addFields: { chatId: "$chatId._id" } },
    {
      $set: {
        chatId: {
          $cond: [
            { $eq: [0, { $size: "$chatId" }] },
            null,
            { $first: "$chatId._id" },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "famelinks",
        let: { userId: "$profileFamelinks" },
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
          // { $skip: ((postsPagination - 1) * 3) },
          { $limit: 10 },
        ],
        as: "posts",
      },
    },
    { $project: { profileFamelinks: 0, profileJoblinks: 0, user: 0 } },
    { $sort: { createdAt: -1 } },
    { $skip: (pagination - 1) * 10 },
    { $limit: 10 },
  ]);
};
