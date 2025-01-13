const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const { isValidObjectId } = require("../../../utils/db");
const addPostService = require("../../../services/v2/famelinks/addPost");
const settingDB = require("../../../models/v2/settings");
const getTodaysPostsService = require("../../../services/v2/famelinks/getTodaysPosts");
const famelinksDB = require("../../../models/v2/famelinks");
const FametrendzDB = require("../../../models/v2/fametrendzs");
const { getChallengeWinners } = require("../../../data-access/v2/challenges");
const { getFameLinksById } = require("../../../data-access/v2/famelinks");
const { getWinner } = require("../../../utils/getWinners");

const appConfig = require("../../../../configs/app.config");
const { getWelcomeVideo } = require("../../../data-access/v2/famelinks");
const {
  updateFamelinksPost,
  getTodaysfamelinksContestPost,
  getTodaysambassadorTrendzPost,
} = require("../../../data-access/v2/famelinks");

module.exports = async (request) => {
  const SettingDetail = await settingDB.find();

  if (request.body.isWelcomeVideo && request.body.isWelcomeVideo === true) {
    let uploadPost;

    let result = await getWelcomeVideo(request.user._id);
    if (result && result.length > 0) {
      result[0].video = request.files["video"];
      await updateFamelinksPost(result[0]._id, result[0]);

      return serializeHttpResponse(200, {
        message: "Post upload successful",
      });
    }

    uploadPost = await addPostService(
      request.user._id,
      request.user,
      request.files,
      request.body,
      request.headers.authorization,
      request.body.isWelcomeVideo
    );

    if (uploadPost) {
      return serializeHttpResponse(200, {
        message: "Post upload successful",
      });
    }

    // if (uploadPost === false) {
    //   return serializeHttpResponse(400, {
    //     message: "One of the images not allowed to be uploaded",
    //   });
    // }

    return serializeHttpResponse(500, {
      message: "Post upload unsuccessful",
    });
  }

  const todaysPosts = await getTodaysPostsService(request.user._id);
  if (todaysPosts >= parseInt(appConfig.dailyPostLimit)) {
    return serializeHttpResponse(200, {
      message:
        "Daily Limit to upload posts has been reached. Please try again tomorrow",
    });
  }

  const todaysfamelinksContestPost = await getTodaysfamelinksContestPost(
    request.user._id,
    request.body.famelinksContest
  );
  
  const todayssambassadorTrendzPost = await getTodaysambassadorTrendzPost(
    request.user._id,
    request.body.ambassadorTrendz
  );

  if (
    todaysfamelinksContestPost.length > 0 ||
    todayssambassadorTrendzPost.length > 0
  ) {
    return serializeHttpResponse(200, {
      message: "Only one post per day is allowed in both Trendz",
    });
  }
  if (request.body.challengeId && request.body.challengeId.length) {
    const challengeIds = await Promise.all(
      request.body.challengeId.map(async (challengeId) => {
        const isValid = isValidObjectId(challengeId);
        if (!isValid) {
          return null;
        }
        const challenge = await FametrendzDB.findOne({
          _id: challengeId,
          isDeleted: false,
        });
        if (!challenge) {
          return null;
        }
        return challengeId;
      })
    );

    const validChallengeIds = challengeIds.filter(
      (isChallengeId) => isChallengeId
    );

    if (!validChallengeIds.length) {
      return serializeHttpResponse(400, {
        message: "Challenge Ids are not valid",
      });
    }

    request.body.challengeId = validChallengeIds;
  }

  let upcomingChallenges = [];

  if (request.body.challengeId && request.body.challengeId.length) {
    await Promise.all(
      request.body.challengeId.map(async (challengeId) => {
        let challengeDetail = await FametrendzDB.findOne({
          _id: challengeId,
          isDeleted: false,
        });
        if (challengeDetail) {
          if (new Date() < challengeDetail["startDate"]) {
            upcomingChallenges.push(challengeDetail);
          }
        }
      })
    );
  }

  if (upcomingChallenges.length > 0) {
    let message = "These challenges are upcoming challenges:- ";
    for (let counter = 0; counter < upcomingChallenges.length; counter++) {
      if (counter == upcomingChallenges.length - 1) {
        message += `${upcomingChallenges[counter].hashTag}`;
      } else {
        message += `${upcomingChallenges[counter].hashTag}` + ", ";
      }
    }
    return serializeHttpResponse(400, { message });
  }

  let uploadPost = await addPostService(
    request.user._id,
    request.user,
    request.files,
    request.body,
    request.headers.authorization,
    request.body.isWelcomeVideo
  );
  
  if (!uploadPost) {
    return serializeHttpResponse(500, {
      message: "Post not uploaded",
    });
  }

  if (request.body.challengeId && request.body.challengeId.length) {
    let items, requiredItems, Completed;

    await FametrendzDB.updateMany(
      { _id: request.body.challengeId },
      { $inc: { totalPost: 1 } }
    );

    request.body.challengeId.map(async (challengeId) => {
      let famelinksDetailChallenge = await famelinksDB.find({
        userId: request.user._id, //request.user._id,
        challengeId: challengeId,
        isDeleted: false,
      });

      if (famelinksDetailChallenge.length === 1) {
        await FametrendzDB.updateOne(
          { _id: challengeId },
          { $inc: { totalParticipants: 1 } }
        );
      }
    });

    let challenges = request.body.challengeId;
  }
  return serializeHttpResponse(200, {
    message: "Famelinks Added",
  });
};
//----------------------------v2-----------------------------//
