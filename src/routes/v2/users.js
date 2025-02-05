const express = require("express");
const router = express.Router();

const validator = require("../../validator/v2/users");
const expressCallback = require("../../helpers/express-callback");
const requestValidatorCallback = require("../../helpers/request-validator-callback");

const {
  uploadProfileImage,
  uploadVerificationVideo,
  uploadBannerMedia,
  uploadVerificationDoc,
  uploadBrandProductsMedia,
} = require("../../utils/fileUploadS3");

const registerController = require("../../controllers/v2/users/register");
const getChildProfileController = require("../../controllers/v2/users/getChildProfile");
const getFollowRequestController = require("../../controllers/v2/users/getFollowRequest");
const rateLimiter = require("../../helpers/rate-limiter");
const loginController = require("../../controllers/v2/users/login");
const verifyOtpController = require("../../controllers/v2/users/verifyOtp");
const brandProductUpdateController = require("../../controllers/v2/users/updateBrandProduct");
const getOneUserController = require("../../controllers/v2/users/getOneUser");
const getMeController = require("../../controllers/v2/users/getMe");
const getNotificationsController = require("../../controllers/v2/users/getNotifications");
const followUserController = require("../../controllers/v2/users/followUser");
const unfollowUserController = require("../../controllers/v2/users/unfollowUser");
const getFollowersFollowees = require("../../controllers/v2/users/getFollowersFollowees");
const getMyFollowersFollowees = require("../../controllers/v2/users/getMyFollowersFollowees");
const removeFollowerController = require("../../controllers/v2/users/removeFollower");
const feedbackController = require("../../controllers/v2/users/feedback");
const reportIssueController = require("../../controllers/v2/users/reportIssue");
const reportPostController = require("../../controllers/v2/users/reportPost");
const reportCommentController = require("../../controllers/v2/users/reportComment");
const getFollowSuggestionsController = require("../../controllers/v2/users/getFollowSuggestions");
// const googleLoginController = require('../../controllers/v2/users/googleLogin');
// const googleRedirectController = require('../../controllers/v2/users/googleRedirect');
const loginWithEmailController = require("../../controllers/v2/users/loginWithEmail");
const updateContactController = require("../../controllers/v2/users/updateContact");
const updateMailController = require("../../controllers/v2/users/updateMail");
const verifyUpdateContactController = require("../../controllers/v2/users/verifyUpdateContact");
const verifyUpdateMailController = require("../../controllers/v2/users/verifyUpdateMail");
const getContestantsController = require("../../controllers/v2/users/getContestants");
const searchController = require("../../controllers/v2/users/search");
const checkUsernameController = require("../../controllers/v2/users/checkUsername");
const updateUserController = require("../../controllers/v2/users/updateUser");
const updateSettingController = require("../../controllers/v2/users/updateSetting");
const getSettingController = require("../../controllers/v2/users/getSetting");
const verifyProfileController = require("../../controllers/v2/users/verifyProfile");
const adFrequencyController = require("../../controllers/v2/users/adFrequency");
const blockUserController = require("../../controllers/v2/users/blockUser");
const unblockUserController = require("../../controllers/v2/users/unblockUser");
const restrictUserController = require("../../controllers/v2/users/restrictUser");
const unrestrictUserController = require("../../controllers/v2/users/unrestrictUser");
const loginWithAppleController = require("../../controllers/v2/users/loginWithApple");
const getHallOfFameController = require("../../controllers/v2/users/getHallOfFame");
const bannerUploadController = require("../../controllers/v2/users/bannerUpload");
const saveMusicController = require("../../controllers/v2/users/saveMusic");
const unsaveMusicController = require("../../controllers/v2/users/unsaveMusic");
const reportUserController = require("../../controllers/v2/users/reportUser");
const fameCoinsController = require("../../controllers/v2/users/fameCoins");
const recieveFameCoinController = require("../../controllers/v2/users/recieveFameCoin");
const bannerDeleteController = require("../../controllers/v2/users/bannerDelete");
const addRecommendationController = require("../../controllers/v2/users/addRecommendation");
const getRecommendationsController = require("../../controllers/v2/users/getRecommendations");
const getBrandProductsController = require("../../controllers/v2/users/getBrandProducts");
const getOneBrandProductsController = require("../../controllers/v2/users/getOneBrandProduct");
const getMyBrandProductsController = require("../../controllers/v2/users/getMyBrandProduct");
const readNotificationsController = require("../../controllers/v2/users/readNotifications");
const addBrandProductsController = require("../../controllers/v2/users/addBrandProducts");
const getMyFollowLinksController = require("../../controllers/v2/followlinks/getMyFollowLinks");
const updateChildProfileController = require("../../controllers/v2/users/updateChildProfile");
const followRequestController = require("../../controllers/v2/users/followRequest");
const brandVisitController = require("../../controllers/v2/users/brandVisit");
const tagsController = require("../../controllers/v2/users/tags");
const acceptRejectTag = require("../../controllers/v2/users/acceptRejectTag")
const searchUserController = require("../../controllers/v2/users/searchUser");
const saveProductController = require("../../controllers/v2/users/saveProduct");
const unsaveProductController = require("../../controllers/v2/users/unsaveProduct");
const checkFamecoinController = require("../../controllers/v2/users/checkFameCoins");
const checkProductByHashtagController = require("../../controllers/v2/users/checkProductByHashtag");
const accountSettings = require('../../controllers/v2/users/accountSettings')
const inviteToFollowController = require('../../controllers/v2/users/inviteToFollow')
const searchAgencyController = require('../../controllers/v2/users/searchAgency')
const getBrandProductController = require('../../controllers/v2/users/getBrandProductsBySearch')
const getBrandProduct = require('../../controllers/v2/users/getBrandProduct')
const removeProfileImageController = require('../../controllers/v2/users/removeProfileImage')
const updatePrivacyController = require('../../controllers/v2/users/updatePrivacy')
const deleteProductcontroller = require('../../controllers/v2/users/deleteBrandProduct')
const getParticipatedTrendzController = require('../../controllers/v2/users/getParticipatedTrendz')

router.post(
  "/login",
  rateLimiter(3),
  requestValidatorCallback(validator.login),
  expressCallback(loginController),
);
router.post(
  "/login/email",
  requestValidatorCallback(validator.email),
  expressCallback(loginWithEmailController),
);
router.post(
  "/login/apple",
  requestValidatorCallback(validator.apple),
  expressCallback(loginWithAppleController),
);
router.post(
  "/verifyOtp",
  requestValidatorCallback(validator.verifyOtp),
  expressCallback(verifyOtpController),
);
router.post(
  "/brand/upload",
  uploadBrandProductsMedia,
  requestValidatorCallback(validator.brandUpload),
  expressCallback(addBrandProductsController)
);
router.post(
  "/follow/:followeeId",
  requestValidatorCallback(validator.followUser),
  expressCallback(followUserController)
);
router.post(
  "/feedback",
  requestValidatorCallback(validator.feedback),
  expressCallback(feedbackController)
);
router.post(
  "/report/issue",
  requestValidatorCallback(validator.reportIssue),
  expressCallback(reportIssueController)
);
router.post(
  "/report/post/:mediaId",
  requestValidatorCallback(validator.reportPost),
  expressCallback(reportPostController)
);
router.post(
  "/report/comment/:commentId",
  requestValidatorCallback(validator.reportComment),
  expressCallback(reportCommentController)
);
router.post(
  "/report/:userId",
  requestValidatorCallback(validator.reportUser),
  expressCallback(reportUserController)
);
router.post(
  "/contact/verify",
  requestValidatorCallback(validator.contactVerify),
  expressCallback(verifyUpdateContactController)
);
router.post(
  "/email/verify",
  requestValidatorCallback(validator.emailVerify),
  expressCallback(verifyUpdateMailController)
);
router.post(
  "/profile/verify",
  uploadVerificationVideo,
  requestValidatorCallback(validator.verifyProfile),
  expressCallback(verifyProfileController)
);
router.post(
  "/block/:userId",
  requestValidatorCallback(validator.blockUser),
  expressCallback(blockUserController)
);
router.post(
  "/unblock/:userId",
  requestValidatorCallback(validator.unblockUser),
  expressCallback(unblockUserController)
);
router.post(
  "/restrict/:userId",
  requestValidatorCallback(validator.restrictUser),
  expressCallback(restrictUserController)
);
router.post(
  "/unrestrict/:userId",
  requestValidatorCallback(validator.unrestrictUser),
  expressCallback(unrestrictUserController)
);
router.post(
  "/banner/upload",
  uploadBannerMedia,
  requestValidatorCallback(validator.bannerUpload),
  expressCallback(bannerUploadController)
);
router.post(
  "/fameCoins",
  requestValidatorCallback(validator.fameCoins),
  expressCallback(fameCoinsController)
);
router.post(
  "/recieveFameCoin",
  requestValidatorCallback(validator.recieveFameCoin),
  expressCallback(recieveFameCoinController)
);
router.post(
  "/agency/recommendations",
  requestValidatorCallback(validator.addRecommendation),
  expressCallback(addRecommendationController)
);
router.post(
  "/follow/request/:action/:followerId",
  requestValidatorCallback(validator.followRequest),
  expressCallback(followRequestController)
);
router.post(
  "/brand/visit/:type/:brandId",
  requestValidatorCallback(validator.brandVisit),
  expressCallback(brandVisitController)
);
router.post(
  "/tags/:action/:postId",
  requestValidatorCallback(validator.tags),
  expressCallback(acceptRejectTag)
);
router.post(
  "/search/tags/:data",
  requestValidatorCallback(validator.searchUser),
  expressCallback(searchUserController)
);
router.post(
  "/check/product/hashTag",
  requestValidatorCallback(validator.checkProductByHashtag),
  expressCallback(checkProductByHashtagController)
);
router.post(
  '/account/settings',
  requestValidatorCallback(validator.accountSettings),
  expressCallback(accountSettings),
)
router.post(
  '/invitation/:action/:userId',
  requestValidatorCallback(validator.invitation),
  expressCallback(inviteToFollowController),
)
router.put(
  "/register",
  uploadProfileImage,
  requestValidatorCallback(validator.register),
  expressCallback(registerController)
);
router.put(
  "/update",
  uploadVerificationDoc,
  requestValidatorCallback(validator.updateUser),
  expressCallback(updateUserController)
);
router.put(
  "/settings",
  requestValidatorCallback(validator.notificationSettings),
  expressCallback(updateSettingController)
);

router.get(
  "/settings",
  requestValidatorCallback(validator.setting),
  expressCallback(getSettingController)
);
router.put(
  "/profile/image/upload",
  uploadProfileImage,
  requestValidatorCallback(validator.uploadProfileImage),
  expressCallback(registerController)
);
router.put(
  "/songs/:musicId/save",
  requestValidatorCallback(validator.saveMusic),
  expressCallback(saveMusicController)
);
router.put(
  "/songs/:musicId/unsave",
  requestValidatorCallback(validator.unsaveMusic),
  expressCallback(unsaveMusicController)
);

router.get(
  "/profile/:linkType/:masterUserId",
  requestValidatorCallback(validator.getProfile),
  expressCallback(getChildProfileController)
);

router.get(
  "/participatedTrendz",
  expressCallback(getParticipatedTrendzController)
);

router.get(
  "/followRequest",
  requestValidatorCallback(validator.getFollowRequest),
  expressCallback(getFollowRequestController)
);

router.get(
  "/me",
  expressCallback(getMeController),
);

router.get(
  "/check/username/:username",
  requestValidatorCallback(validator.checkUsername),
  expressCallback(checkUsernameController)
);

router.get(
  "/notifications",
  requestValidatorCallback(validator.getNotifications),
  expressCallback(getNotificationsController)
);
router.get(
  "/contestants",
  requestValidatorCallback(validator.contestants),
  expressCallback(getContestantsController)
);
router.post(
  "/search",
  requestValidatorCallback(validator.search),
  expressCallback(searchController)
);
router.get(
  "/ad-frequency",
  expressCallback(adFrequencyController),
);

router.get(
  "/halloffame",
  requestValidatorCallback(validator.getHallOfFame),
  expressCallback(getHallOfFameController)
);

router.get(
  "/searchAgency/:data",
  requestValidatorCallback(validator.searchAgency),
  expressCallback(searchAgencyController)
);
router.get(
  "/:userId",
  requestValidatorCallback(validator.getOneUser),
  expressCallback(getOneUserController)
);
router.get(
  "/me/:type",
  requestValidatorCallback(validator.getMyFollowersFollowees),
  expressCallback(getMyFollowersFollowees)
);
router.get(
  "/follow/suggestions",
  requestValidatorCallback(validator.getFollowSuggestions),
  expressCallback(getFollowSuggestionsController)
);
router.get(
  "/:userId/:type",
  requestValidatorCallback(validator.getFollowersFollowees),
  expressCallback(getFollowersFollowees)
);
router.get(
  "/agency/:agencyId/recommendations",
  requestValidatorCallback(validator.getRecommendations),
  expressCallback(getRecommendationsController)
);
router.get(
  "/brand/products/me",
  requestValidatorCallback(validator.getBrandProducts),
  expressCallback(getMyBrandProductsController)
);
router.get(
  "/brand/:brandId/products",
  requestValidatorCallback(validator.getBrandProducts),
  expressCallback(getBrandProductsController)
);
router.get(
  "/brandOne/:userId/products",
  requestValidatorCallback(validator.getBrandProducts),
  expressCallback(getOneBrandProductsController)
);
router.get(
  "/check/fameCoins/:fameCoins",
  requestValidatorCallback(validator.checkFameCoins),
  expressCallback(checkFamecoinController)
);
router.get(
  "/search/brand/Products",
  requestValidatorCallback(validator.getBrandProductsBySearch),
  expressCallback(getBrandProductController)
);

router.get(
  "/brand/product/:productId",
  requestValidatorCallback(validator.getBrandProduct),
  expressCallback(getBrandProduct)
);

router.put(
  "/edit/:brandId/brandUpload",
  uploadBrandProductsMedia,
  requestValidatorCallback(validator.updateBrandUpload),
  expressCallback(brandProductUpdateController)
);

router.delete(
  "/banner/:filename",
  requestValidatorCallback(validator.bannerDelete),
  expressCallback(bannerDeleteController)
);
router.delete(
  "/unfollow/:followeeId",
  requestValidatorCallback(validator.followUser),
  expressCallback(unfollowUserController)
);
router.delete(
  "/removeFollower/:followerId",
  requestValidatorCallback(validator.removeFollower),
  expressCallback(removeFollowerController)
);

router.delete(
  "/productDelete/:productId",
  requestValidatorCallback(validator.productId),
  expressCallback(deleteProductcontroller)
);

router.patch(
  "/notifications/mark-as-read",
  expressCallback(readNotificationsController)
);

router.patch(
  "/profile/:linkType/:masterUserId",
  uploadProfileImage,
  requestValidatorCallback(validator.updateProfile),
  expressCallback(updateChildProfileController)
);

router.patch(
  "/contact",
  requestValidatorCallback(validator.login),
  expressCallback(updateContactController)
);
router.patch(
  "/email",
  requestValidatorCallback(validator.email),
  expressCallback(updateMailController)
);
router.patch(
  "/brand/save/:productId",
  requestValidatorCallback(validator.productId),
  expressCallback(saveProductController)
);
router.patch(
  "/brand/unsave/:productId",
  requestValidatorCallback(validator.productId),
  expressCallback(unsaveProductController)
);

router.patch(
  "/removeProfileImage",
  requestValidatorCallback(validator.removeProfileImage),
  expressCallback(removeProfileImageController)
);

router.patch(
  "/privacy",
  requestValidatorCallback(validator.updatePrivacy),
  expressCallback(updatePrivacyController)
);
module.exports = router;
