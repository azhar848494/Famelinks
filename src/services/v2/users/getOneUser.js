const { getChatByMembers } = require("../../../data-access/v2/chats");
const {
  getOneUser,
  getUserFollowStatus,
  getRecommendations,
  offlineUser,
} = require("../../../data-access/v2/users");
const {
  getTodaysPosts,
  getUnseenGeneralCount,
  getUnseenRequestCount,
  getUnseenOfferCount,
  getUnseenMessageCount,
  getTodaysfamelinksContestPost,
  getTodaysambassadorTrendzPost,
} = require("../../../data-access/v2/famelinks");
const { getPhoneNumberDetails } = require("../../../utils/phoneNumber");
const settingDB = require("../../../models/v2/settings");

const getFamelinksProfile = require("../../../services/v2/users/getChildProfile");

module.exports = async (userId, selfUserId, swapId) => {
  let fameLinksProfile = await getFamelinksProfile(userId, "famelinks");

  const settingDetail = await settingDB.find();
  const user = await getOneUser(userId);
  await offlineUser({ id: userId });
  user.profileImage = user.profileImage || "avatar.png";
  user.verificationStatus = settingDetail[0].isVerifiedAll || "Pending";
  if (user) {
    if (selfUserId) {
      if (swapId) {
        //swap the follower and followee Id whille accepting/rejecting follow request
        let temp = selfUserId;
        selfUserId = userId;
        userId = temp;
      }
      const result = await getUserFollowStatus(selfUserId, userId);
      if (result && result.acceptedDate) {
        user.followStatus = "accepted";
      } else if (result) {
        user.followStatus = "pending";
      } else {
        user.followStatus = undefined;
      }
      delete user.email;
      delete user.mobileNumber;
      // delete user.settings; // Commented due to dependency on other controllers
      delete user.referralCode;
      delete user.referredBy;
      if (fameLinksProfile && fameLinksProfile.length != 0) {
        user.todaysPosts = await getTodaysPosts(userId);
      } else {
        user.todaysPosts = 0;
      }
      if (fameLinksProfile && fameLinksProfile.length != 0) {
        user.famelinksContestpost = await getTodaysfamelinksContestPost(
          userId
        );
        user.ambassadorTrendzPost = await getTodaysambassadorTrendzPost(
          userId
        );
      } else {
        user.famelinksContestpost = 0
        user.ambassadorTrendzPost = 0
      }
      const chat = await getChatByMembers([userId, selfUserId]);
      user.perdayPost = (await settingDetail[0].famelinksDailyPosts) || 5;
      user.chatId = chat ? chat._id : null;
    } else {
      if (fameLinksProfile && fameLinksProfile.length != 0) {
        user.todaysPosts = await getTodaysPosts(userId);
      } else {
        user.todaysPosts = 0;
      }
      user.perdayPost = (await settingDetail[0].famelinksDailyPosts) || 5;
      if (fameLinksProfile && fameLinksProfile.length != 0) {
        user.famelinksContestpost = await getTodaysfamelinksContestPost(
          userId
        );
        user.ambassadorTrendzPost = await getTodaysambassadorTrendzPost(
          userId
        );
      } else {
        user.famelinksContestpost = 0
        user.ambassadorTrendzPost = 0
      }
      const phoneNumberDetails = getPhoneNumberDetails(user.mobileNumber);
      user.countryCode = phoneNumberDetails.countryCode;
      user.mobileNumber = phoneNumberDetails.nationalNumber;
      user.referralLink = `https://famelinks.in/ref/${user.username}`;
      // user.challengesWon = '(1) Beautiful Hair Challenge';
      user.challengesWon = null;
      // user.challengesSponsered = '(1) Flip the Shirt Challenge';
      user.challengesSponsered = null;
    }
    user.contestPath = {
      district: {
        name: "Mumbai",
        isWinner: true,
      },
      state: {
        name: "Maharashtra",
        isWinner: false,
      },
      country: {
        name: "India",
        isWinner: false,
      },
      continent: {
        name: "Asia",
        isWinner: false,
      },
      world: {
        name: "World",
        isWinner: false,
      },
    };
    if (user.type === "agency") {
      user.recommendationCount = (
        await getRecommendations(null, user._id)
      ).length;
    }
    user.unSeenGeneralCount = await getUnseenGeneralCount(userId);
    user.unSeenRequestCount = await getUnseenRequestCount(userId);
    user.unSeenOfferCount = await getUnseenOfferCount(userId);
    user.unseenMessageCount = await getUnseenMessageCount(userId);
  }
  return user;
};
