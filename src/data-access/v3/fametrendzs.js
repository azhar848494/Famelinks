const mongoose = require("mongoose");
const fameTrendzDB = require("../../models/v2/fametrendzs");
const trendzSuggestionsDB = require("../../models/v2/trendzSuggestions");
const paymentsDB = require("../../models/v2/payments")
const ObjectId = mongoose.Types.ObjectId;
const settingDB = require("../../models/v2/settings");
const fameContestDB = require("../../models/v2/fameContest")
const ChallengeDB = require("../../models/v2/challenges");

const createfametrendz = (payload) => {
  return fameTrendzDB.create(payload);
};

const createFunChallenge = (payload) => {
  return ChallengeDB.create(payload);
};

const getOneFametrendz = (trendId) => {
  return fameTrendzDB
    .findOne({ _id: ObjectId(trendId), isDeleted: false })
    .lean();
};

const updateFametrendz = (trendzId, data) => {
  return fameTrendzDB.updateOne({ _id: trendzId }, { $set: data });
};

const addTrendzSuggestion = (payload) => {
  return trendzSuggestionsDB.create(payload);
};

const uploadFametrendzBanner = async (files, image_name) => {
  return image_name;
};

const getTrendSettingData = () => {
  return settingDB.findOne(
    { _id: ObjectId("652a6c970ca4bd828f543bad") },
    {
      _id: 0,
      famelinksDailyPosts: 0,
      isVerifiedAll: 0,
      clubOfferDailyPosts: 0,
      clubOffersLimit: 0,
      followInviteDailyLimit: 0,
      clubOffersApplicationDailyLimit: 0,
    }
  );
};

const getTrendzSuggestions = (page, userId) => {
  return trendzSuggestionsDB
    .aggregate([
      {
        $match: {
          userId: { $ne: userId },
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "userId",
          pipeline: [
            {
              $project: {
                _id: 0,
                name: 1,
              },
            },
          ],
          as: "suggestedBy",
        },
      },
    ])
    .sort({ createdAt: "desc" })
    .skip((page - 1) * 10)
    .limit(10);
};

const deleteFametrendz = (trendId) => {
  return fameTrendzDB.deleteOne({ _id: ObjectId(trendId) });
};

const addPaymentId = (trendId, paymentId) => {
  return fameTrendzDB.updateOne(
    { _id: ObjectId(trendId) },
    { paymentId: paymentId }
  );
};

const addPayments = (
  userId,
  purposeId,
  amount,
  paymentPurpose,
  paymentRef,
  currency,
  txType
) => {
  return paymentsDB.create({
    userId,
    purposeId,
    amount,
    paymentPurpose,
    paymentRef,
    currency,
    txType,
  });
};

const addFameContest = (payload) => {
  return fameContestDB.create(payload);
};


module.exports = {
  createfametrendz,
  createFunChallenge,
  getOneFametrendz,
  addTrendzSuggestion,
  uploadFametrendzBanner,
  getTrendSettingData,
  getTrendzSuggestions,
  updateFametrendz,
  deleteFametrendz,
  addPayments,
  addPaymentId,
  addFameContest,
};
