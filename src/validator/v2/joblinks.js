const joi = require("joi").extend(require("@joi/date"));

module.exports = {
  addJobCategory: {
    payload: joi.object({
      jobName: joi.string().trim().required(),
      jobType: joi.string().trim().required().valid("faces", "crew"),
      // userType: joi
      //   .array()
      //   .items(
      //     joi.string().trim().valid("individual", "brand", "agency").required()
      //   ),
      jobCategory: joi.string().trim(),
    }),
  },

  getAllJobCategories: {
    params: joi.object({
      jobType: joi.string().trim().valid("faces", "crew").required(),
    }),
  },

  createJob: {
    payload: joi.object({
      jobType: joi.string().trim().required().valid("faces", "crew"),
      title: joi.string().trim().required(),
      jobLocation: joi.string().trim().required(),
      description: joi.string().trim().required(),
      experienceLevel: joi
        .string()
        .trim()
        .valid("fresher", "experienced", "any"),
      startDate: joi.date().format("DD-MM-YYYY").utc().required(),
      endDate: joi.date().format("DD-MM-YYYY").utc().required(),
      deadline: joi.date().format("DD-MM-YYYY").utc().required(),
      ageGroup: joi.array().items(joi.string().trim()),
      height: joi.object().keys({
        foot: joi.number().required(),
        inch: joi.number().required(),
      }),
      gender: joi.string().trim().valid("male", "female", "all").optional(),
      jobCategory: joi.array().items(joi.string().trim()).required(),
      status: joi.string().trim(),
    }),
  },

  applyJob: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
  },

  withdrawJob: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
  },

  saveUnsaveJob: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
    query: joi.object({
      action: joi.string().trim().valid("save", "unsave").required(),
    }),
  },

  unsaveJob: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
  },

  updateJobFaces: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
    payload: joi.object({
      jobType: joi.string().trim().required().valid("faces").optional(),
      title: joi.string().trim().optional(),
      jobLocation: joi.string().trim().required(),
      description: joi.string().trim().optional(),
      startDate: joi.date().format("DD-MM-YYYY").utc().optional(),
      endDate: joi.date().format("DD-MM-YYYY").utc().optional(),
      deadline: joi.date().format("DD-MM-YYYY").utc().optional(),
      ageGroup: joi.array().items(joi.string().trim()),
      height: joi.object().keys({
        foot: joi.number().optional(),
        inch: joi.number().optional(),
      }),
      gender: joi.string().trim().valid("male", "female", "all").optional(),
      jobCategory: joi.array().items(joi.string().trim()).optional(),
      status: joi.string().trim(),
    }),
  },

  updateJobCrew: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
    payload: joi.object({
      jobType: joi.string().trim().required().valid("crew").optional(),
      title: joi.string().trim().optional(),
      jobLocation: joi.string().trim().required(),
      description: joi.string().trim().optional(),
      experienceLevel: joi
        .string()
        .trim()
        .valid("fresher", "experienced", "any")
        .optional(),
      startDate: joi.date().format("DD-MM-YYYY").utc().optional(),
      endDate: joi.date().format("DD-MM-YYYY").utc().optional(),
      deadline: joi.date().format("DD-MM-YYYY").utc().optional(),
      jobCategory: joi.array().items(joi.string().trim()).optional(),
      status: joi.string().trim(),
    }),
  },

  createProfileFaces: {
    payload: joi.object({
      height: joi
        .object()
        .keys({
          foot: joi.number().optional(),
          inch: joi.number().optional(),
        })
        .optional(),
      weight: joi.string().optional(),
      bust: joi.string().optional(),
      waist: joi.string().optional(),
      hip: joi.string().optional(),
      eyeColor: joi.string().optional(),
      complexion: joi.string().optional(),
      interestedLoc: joi.array().items(joi.string().trim()).optional(),
      interestCat: joi
        .array()
        .items(joi.string().trim().allow("", null))
        .optional(),
    }),
  },

  updateProfileFaces: {
    payload: joi.object({
      height: joi
        .object()
        .keys({
          foot: joi.number().optional(),
          inch: joi.number().optional(),
        })
        .optional(),
      weight: joi.string().optional(),
      bust: joi.string().optional(),
      waist: joi.string().optional(),
      hip: joi.string().optional(),
      eyeColor: joi.string().optional(),
      complexion: joi.string().optional(),
      interestedLoc: joi.array().items(joi.string().trim()).optional(),
      interestCat: joi
        .array()
        .items(joi.string().trim().allow("", null))
        .optional(),
    }),
  },

  createProfileCrew: {
    payload: joi.object({
      experienceLevel: joi
        .string()
        .trim()
        .valid("fresher", "experienced")
        .optional(),
      workExperience: joi.string().trim().allow("", null).optional(),
      achievements: joi.string().trim().allow("", null).optional(),
      interestedLoc: joi.array().items(joi.string().trim()).optional(),
      interestCat: joi
        .array()
        .items(joi.string().trim().allow("", null))
        .optional(),
    }),
  },

  updateProfileCrew: {
    payload: joi.object({
      experienceLevel: joi
        .string()
        .trim()
        .valid("fresher", "experienced")
        .optional(),
      workExperience: joi.string().trim().allow("", null).optional(),
      achievements: joi.string().trim().allow("", null).optional(),
      interestedLoc: joi.array().items(joi.string().trim()).optional(),
      interestCat: joi
        .array()
        .items(joi.string().trim().allow("", null))
        .optional(),
    }),
  },

  feed: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  userExplore: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  brandAgencyExplore: {
    query: joi.object({
      page: joi.number().min(1),
      search: joi.string().trim().allow("", null),
    }),
  },

  hire: {
    payload: joi.object({
      jobId: joi.string().trim().required(),
      userId: joi.string().trim().required(),
      closeJob: joi.boolean().required(),
    }),
  },

  shortlist: {
    payload: joi.object({
      jobId: joi.string().trim().required(),
      userId: joi.string().trim().required(),
      shortlist: joi.boolean().required(),
    }),
  },

  saveTalent: {
    payload: joi.object({
      userId: joi.string().trim().required(),
      save: joi.boolean().required(),
    }),
  },

  getSavedTalents: {
    query: joi.object({
      page: joi.number().min(1),
    }),
  },

  greeting: {
    files: joi
      .object({
        greetVideo: joi.string().trim().required(),
      })
      .required(),
  },

  getApplicants: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
      sort: joi.string().trim(),
    }),
  },

  searchJobs: {
    params: joi.object({
      title: joi.string().trim().required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  invitation: {
    params: joi.object({
      action: joi.string().trim().valid("send", "withdraw").required(),
      userId: joi.string().trim().required(),
    }),
    query: joi.object({
      jobId: joi.string().trim().required(),
      jobType: joi.string().trim().required(),
    }),
  },

  getJobDetails: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
  },
  getshortlistedApplicant: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
  },

  closeJob: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
  },

  deleteJob: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
  },

  shortlist: {
    payload: joi.object({
      jobId: joi.string().trim().required(),
      userId: joi.string().trim().required(),
      shortlist: joi.boolean().required(),
    }),
  },

  greeting: {
    files: joi
      .object({
        greetVideo: joi.string().trim().required(),
      })
      .required(),
  },

  getApplicants: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  searchJobs: {
    params: joi.object({
      title: joi.string().trim().required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  invitation: {
    params: joi.object({
      action: joi.string().trim().valid("send", "withdraw").required(),
      userId: joi.string().trim().required(),
    }),
  },

  getJobDetails: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
  },

  closeJob: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
    payload: joi.object({
      close: joi.boolean().required(),
    }),
  },
  getSortedApplicant: {
    params: joi.object({
      jobId: joi.string().trim().required(),
      sort: joi.string().trim().valid("asc", "desc").required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },
  getApplicantsBySearch: {
    params: joi.object({
      jobId: joi.string().trim().required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
      name: joi.string().trim(),
      age: joi.number(),
      gender: joi.string().trim(),
      complexion: joi.string().trim(),
      eyeColor: joi.string().trim(),
      weight: joi.number(),
      height: joi.string().trim(),
      bust: joi.number(),
      waist: joi.number(),
      hip: joi.number(),
      experienceLevel: joi.string().trim(),
    }),
  },

  getAllJobs: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getAppliedJobs: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getShortlistedJobs: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getHiredJobs: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },
  getSavedJobs: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getJobInvites: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },
  acceptRejectInvite: {
    params: joi.object({
      action: joi.string().trim().valid("accept", "reject").required(),
    }),
    query: joi.object({
      jobId: joi.string().trim().required(),
      jobType: joi.string().trim().required(),
    }),
  },

  getOpenJobs: {
    query: joi.object({
      page: joi.number().min(1).required(),
      userId: joi.string().trim().required(),
      type: joi.string().trim().optional(),
    }),
  },

  addCategorySuggestion: {
    payload: joi.object({
      name: joi.string().trim().required(),
      type: joi.string().trim().required().valid("faces", "crew"),
      suggestedBy: joi.string(),
    }),
  },

  getExploreTalents: {
    query: joi.object({
      page: joi.number().min(1),
    }),
  },

  getPastJobs: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getYourJobs: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },
  
  getJobs: {
    params: joi.object({
      type: joi.string().trim().valid("open", "closed", "draft").required(),
    }),
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  getExploreJobs: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },
};
