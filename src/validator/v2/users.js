const joi = require("joi").extend(require("@joi/date"));

module.exports = {
  login: {
    payload: joi
      .object({
        mobileNumber: joi.number().required(),
        code: joi.number().required(),
      })
      .required(),
  },

  email: {
    payload: joi
      .object({
        email: joi.string().trim().email().required(),
        pushToken: joi.string().trim().optional(),
      })
      .required(),
  },

  apple: {
    payload: joi.object().keys({
      email: joi.string().trim().email(),
      mobileNumber: joi.number(),
      pushToken: joi.string().trim().optional(),
      appleId: joi.string().trim().required(),
    }),
  },

  verifyOtp: {
    payload: joi.object({
      otp: joi.number().required(),
      otpHash: joi.string().trim().required(),
      pushToken: joi.string().trim().optional(),
    }),
  },

  contactVerify: {
    payload: joi.object({
      otp: joi.number().required(),
      otpHash: joi.string().trim().required(),
    }),
  },

  emailVerify: {
    payload: joi.object({
      otp: joi.number().required(),
      otpHash: joi.string().trim().required(),
    }),
  },

  register: {
    files: joi.object({
      profileImage: joi.string().trim(),
      profileImageX50: joi.string().trim(),
      profileImageX300: joi.string().trim(),
    }),
    payload: joi.object({
      gender: joi.string().trim().valid("male", "female", "other").required(),
      name: joi.string().trim().required(),
      dob: joi.date().format("DD-MM-YYYY").utc().required(),
      location: joi.string().trim().required(),
      username: joi.string().trim().min(3).max(30).lowercase().optional(),
      type: joi
        .string()
        .trim()
        .valid("individual", "agency", "brand")
        .required(),
      profileImage: joi.string().trim(),
      profileImageType: joi.string().trim().valid("avatar", "image"),
    }),
  },

  updateUser: {
    payload: joi
      .object()
      .keys({
        name: joi.string().trim().optional(),
        profession: joi.string().trim().optional().allow(null, ""),
        dob: joi.date().format("DD-MM-YYYY").utc().optional(),
        bio: joi.string().trim().optional().allow(null, ""),
        type: joi
          .string()
          .trim()
          .valid("individual", "agency", "brand")
          .optional(),
        location: joi.string().trim(),
        username: joi.string().trim().min(3).max(30).lowercase().optional(),
        ageGroup: joi
          .string()
          .trim()
          .valid(
            "groupA",
            "groupB",
            "groupC",
            "groupD",
            "groupE",
            "groupF",
            "groupG",
            "groupH"
          )
          .optional(),
        brandWebsite: joi.string().trim(),
        brandDoc: joi.array().items(joi.string().trim()),
        agencyWebsite: joi.string().trim(),
        agencyDoc: joi.array().items(joi.string().trim()),
        websiteUrl: joi.string().trim(),
        // verificationDoc: joi.array().items(joi.string().trim())
        verificationDoc: joi.array().items(joi.string().trim()),
      })
      .required()
      .min(1),
  },

  updateBrandUpload: {
    payload: joi.object({
      description: joi.string().trim().optional().allow("", null),
      purchaseUrl: joi.string().trim().optional().allow("", null),
      buttonName: joi.string().trim().optional().allow("", null),
      name: joi.string().trim().optional().allow("", null),
      price: joi.number().optional().allow("", null),
      location: joi.string().trim().required(),
      tags: joi.array().optional(),
      hashTag: joi.string().optional(),
    }),
    files: joi
      .array()
      .items(
        joi.object().keys({
          type: joi.string().valid("image", "video"),
          media: joi.string().required(),
        })
      )
      .label("media"),
  },

  getOneUser: {
    params: joi.object({
      userId: joi.string().trim().required(),
    }),
  },

  followUser: {
    params: joi.object({
      followeeId: joi.string().trim().required(),
    }).required(),
    payload: joi.object({
      postId: joi.string().trim().optional(),
    }),
  },

  removeFollower: {
    params: joi
      .object({
        followerId: joi.string().trim().required(),
      })
      .required(),
  },

  getFollowersFollowees: {
    params: joi
      .object({
        userId: joi.string().trim().required(),
        type: joi.string().trim().valid("followers", "followees").required(),
      })
      .required(),
    query: joi.object({
      page: joi.number().min(1).required(),
      requestType: joi.string().trim().valid("all", "channel", "user"),
    }),
  },

  getMyFollowersFollowees: {
    params: joi
      .object({
        type: joi.string().trim().valid("followers", "followees").required(),
      })
      .required(),
    query: joi.object({
      page: joi.number().required(),
      requestType: joi.string().trim().valid("all", "channel", "user"),
      search: joi.string().trim(),
    }),
  },

  // loginGoogle: {
  //     payload: joi.object({
  //         email: joi.string().trim().email().required()
  //     })
  // },

  feedback: {
    payload: joi
      .object({
        body: joi.string().trim().required(),
      })
      .required(),
  },

  reportIssue: {
    payload: joi
      .object()
      .keys({
        name: joi.string().trim(),
        mobileNumber: joi.number(),
        email: joi.string().trim().email(),
        body: joi.string().trim().required(),
      })
    // .or("mobileNumber", "email")
    // .required(),
  },

  reportPost: {
    params: joi.object({
      mediaId: joi.string().trim().required(),
    }),
    payload: joi
      .object()
      .keys({
        body: joi.string().trim().allow(null).default(null).optional(),
        type: joi
          .string()
          .trim()
          .valid(
            "nudity",
            "spam",
            "vulgarity",
            "abusive",
            "rasicm",
            "copyright",
            "other"
          )
          .required(),
      })
      .required(),
  },

  reportComment: {
    params: joi.object({
      commentId: joi.string().trim().required(),
    }),
    payload: joi.object().keys({
      body: joi.string().trim().allow(null).default(null).optional(),
      type: joi
        .string()
        .trim()
        .valid(
          "nudity",
          "spam",
          "vulgarity",
          "abusive",
          "rasicm",
          "copyright",
          "other"
        )
        .required(),
    }),
  },

  reportUser: {
    params: joi.object({
      userId: joi.string().trim().required(),
    }),
    payload: joi.object().keys({
      body: joi.string().trim().allow(null).default(null).optional(),
      type: joi
        .string()
        .trim()
        .valid(
          "nudity",
          "spam",
          "vulgarity",
          "abusive",
          "rasicm",
          "copyright",
          "other"
        )
        .required(),
    }),
  },

  getFollowSuggestions: {
    query: joi.object({
      page: joi.number().min(1).required(),
      search: joi.string().trim(),
    }),
  },

  uploadProfileImage: {
    files: joi
      .object({
        profileImage: joi.string().trim(),
        profileImageX50: joi.string().trim(),
        profileImageX300: joi.string().trim(),
      })
      .exist()
      .invalid(null, {})
      .label("file"),
    payload: joi.object({
      profileImageType: joi.string().trim().valid("avatar", "image"),
      profileImage: joi.string().trim(),
      profileImageX50: joi.string().trim(),
      profileImageX300: joi.string().trim(),
    }),
  },

  setting: {
    query: joi.object({
      type: joi.string().trim().optional(),
    }),
  },

  notificationSettings: {
    payload: joi.object({
      settings: joi
        .object({
          notification: joi
            .object({
              comments: joi.boolean(),
              likes: joi.boolean(),
              trendingPosts: joi.boolean(),
              followRequest: joi.boolean(),
              newFollower: joi.boolean(),
              sponser: joi.boolean(),
              liveEvents: joi.boolean(),
              upcomingChallenges: joi.boolean(),
              endingChallenges: joi.boolean(),
              requestAccepted: joi.boolean(),
            })
            .invalid(null, {}),
        }).optional(),
      isSeenContest: joi.boolean().optional(),
    }),
  },

  contestants: {
    query: joi.object({
      type: joi.string().trim().valid("recommended", "trending"),
      ageGroup: joi
        .string()
        .trim()
        .valid(
          "groupA",
          "groupB",
          "groupC",
          "groupD",
          "groupE",
          "groupF",
          "groupG",
          "groupH"
        ),
      gender: joi.string().trim().valid("male", "female"),
      location: joi.string().trim(),
      page: joi.number().min(1).required(),
    }),
  },

  search: {
    payload: joi.object({
      search: joi.string().trim(),
      page: joi.number().min(1),
      type: joi.string().trim().valid("famelinks", "funlinks", "followlinks", "joblinks"),
    }),
  },

  searchUser: {
    params: joi.object().keys({
      data: joi.string().trim().required(),
    }),
    payload: joi.object().keys({
      challenges: joi.array().items(joi.string().trim().allow("", null)),
    }),
  },

  getNotifications: {
    query: joi.object({
      page: joi.number().min(1).required(),
      type: joi.string().trim().valid("received", "gifted"),
      category: joi.string().trim().valid("general", "request", "jobs_offers"),
    }),
  },

  getFollowRequest: {
    query: joi.object({
      page: joi.number().min(1).required(),
    }),
  },

  checkUsername: {
    params: joi.object({
      username: joi.string().trim().min(6).max(30).required(),
    }),
  },

  verifyProfile: {
    // files: joi.object({
    //     video: joi.string().trim().required()
    // }).exist().invalid(null, {}).label('file')
  },

  blockUser: {
    params: joi.object({
      userId: joi.string().trim().required(),
    }),
  },

  unblockUser: {
    params: joi.object({
      userId: joi.string().trim().required(),
    }),
  },

  restrictUser: {
    params: joi.object({
      userId: joi.string().trim().required(),
    }),
  },

  unrestrictUser: {
    params: joi.object({
      userId: joi.string().trim().required(),
    }),
  },

  getHallOfFame: {
    payload: joi.object().keys({
      state: joi.string().trim(),
      district: joi.string().trim(),
      country: joi.string().trim(),
      ageGroup: joi
        .string()
        .trim()
        .valid(
          "groupA",
          "groupB",
          "groupC",
          "groupD",
          "groupE",
          "groupF",
          "groupG",
          "groupH"
        )
        .default("groupD"),
      year: joi.string().trim(),
    }),
  },

  bannerUpload: {
    // params: joi.object().keys({
    //     userType: joi.string().valid('brand', 'agency').required()
    // }),
    files: joi.array().items(joi.string()).min(1).required(),
  },

  saveMusic: {
    params: joi.object({
      musicId: joi.string().required(),
    }),
  },

  unsaveMusic: {
    params: joi.object({
      musicId: joi.string().required(),
    }),
  },

  fameCoins: {
    payload: joi.object({
      toUserId: joi.string(),
      fameCoins: joi.number(),
      fromUserId: joi.string(),
    }),
  },
  recieveFameCoin: {
    payload: joi.object().keys({
      type: joi.string(),
      coins: joi.number(),
      toUserId: joi.string(),
    }),
  },

  bannerDelete: {
    params: joi.object().keys({
      filename: joi.string().required(),
    }),
  },

  addRecommendation: {
    payload: joi.object().keys({
      agencyId: joi.string().required(),
      recommendations: joi.string().required(),
    }),
  },

  getRecommendations: {
    params: joi.object().keys({
      agencyId: joi.string().required(),
    }),
  },

  getBrandProducts: {
    query: joi.object({
      page: joi.number().min(1).required(),
      postId: joi.string().trim(),
    }),
  },

  brandUpload: {
    files: joi
      .array()
      .items(
        joi.object().keys({
          type: joi.string().valid("image", "video"),
          media: joi.string().required(),
        })
      )
      .label("media")
      .min(1)
      .required(),
    payload: joi.object({
      buttonName: joi.string().optional().allow("", null),
      description: joi.string().trim().optional().allow("", null),
      price: joi.number().default(0).allow("", null),
      purchaseUrl: joi.string().trim().allow("", null),
      hashTag: joi.string().optional(),
      name: joi.string(),
      tags: joi.array().optional(),
      giftCoins: joi.number().default(0).allow("", null),
      allotedCoins: joi.number().default(0).allow("", null),
      isWelcomeVideo: joi.boolean(),
    }),
  },

  getProfile: {
    params: joi.object({
      linkType: joi.string().valid("famelinks", "funlinks", "followlinks", "joblinks", "storelinks", "collablinks").required(),
      masterUserId: joi.string().trim().required(),
    }),
    query: joi.object({
      page: joi.number(),
    }),
    body: joi.object({
      jobType: joi.string().valid("faces", "crew").required(),
    }),
    payload: joi
      .object({
        postId: joi.string().trim().optional(),
      }),
  },

  updateProfile: {
    files: joi.object({
      profileImage: joi.string().trim(),
      profileImageX50: joi.string().trim(),
      profileImageX300: joi.string().trim(),
    }),
    params: joi.object({
      linkType: joi
        .string()
        .trim()
        .valid(
          "famelinks",
          "funlinks",
          "followlinks",
          "joblinks",
          "storelinks",
          "collablinks"
        )
        .required(),
      masterUserId: joi.string().trim().required(),
    }),
    payload: joi.object({
      jobType: joi.string().valid("faces", "crew").optional(),
      name: joi.string().trim().allow("", null).optional(),
      bio: joi.string().trim().allow("", null).optional(),
      profession: joi.string().trim().allow("", null).optional(),
      url: joi.string().trim().allow("", null).optional(),
      profileImage: joi.string().trim(),
      profileImageX50: joi.string().trim(),
      profileImageX300: joi.string().trim(),
      profileImageType: joi.string().trim().valid("avatar", "image"),
      greetText: joi.string().trim().allow("", null).optional(),
      clubCategory: joi.array().items(joi.string().trim()).allow(null, ""),
    }),
  },

  followRequest: {
    params: joi.object({
      action: joi.string().trim().valid("accept", "reject").required(),
      followerId: joi.string().trim().required(),
    }),
  },

  brandVisit: {
    params: joi.object({
      type: joi.string().trim().valid("profile", "url").required(),
      brandId: joi.string().trim().required(),
    }),
  },

  tags: {
    params: joi.object({
      action: joi.string().trim().valid("accept", "reject").required(),
      postId: joi.string().trim().required(),
    }),
  },

  markAsRead: {
    query: joi.object({
      type: joi.string().trim().required(),
    }),
  },

  productId: {
    params: joi.object({
      productId: joi.string().trim().required(),
    }),
  },

  checkFameCoins: {
    params: joi.object({
      fameCoins: joi.number().min(0).required(),
    }),
  },

  checkProductByHashtag: {
    payload: joi.object({
      hashTag: joi.string().trim().allow("", null),
      productName: joi.string().trim(),
    }),
  },

  accountSettings: {
    payload: joi.object({
      action: joi
        .string()
        .trim()
        .valid("suspend", "delete", "restore")
        .required(),
    }),
  },

  session: {
    params: joi.object({
      type: joi.string().trim().valid("in", "out").required(),
    }),
  },

  invitation: {
    params: joi.object({
      action: joi.string().trim().valid("send", "withdraw").required(),
      userId: joi.string().trim().required(),
    }),
  },

  searchAgency: {
    params: joi.object().keys({
      data: joi.string().trim().required(),
    }),
  },

  getBrandProductsBySearch: {
    query: joi.object({
      page: joi.number().min(1).required(),
      search: joi.string().trim(),
      type: joi.string().trim(),
    }),
  },

  getBrandProduct: {
    params: joi.object({
      productId: joi.string().trim(),
    }),
  },

  removeProfileImage: {
    query: joi.object({
      masterId: joi.string().trim(),
      profileId: joi.string().trim(),
    }),
  },

  updatePrivacy: {
    query: joi.object({
      action: joi.string().trim().valid("public", "private", "licvate").required(),
    }),
  },
};
