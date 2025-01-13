const mongoose = require("mongoose");
const ratingDB = require("../../models/v2/rating");
const ObjectId = mongoose.Types.ObjectId;


const addRating = (userId, trendId, rating) => {
  return ratingDB.updateOne(
    { userId: ObjectId(userId), trendId: ObjectId(trendId) },
    { $set: { rating: rating } },
    { upsert: true }
  );
};

const getRating = (ratingId) => {
  return ratingDB.findOne({ _id: ObjectId(ratingId) }).lean();
};

const getMyRating = (trendId, userId) => {
  return ratingDB
    .findOne(
      { trendId: ObjectId(trendId), userId: ObjectId(userId) }
    )
    .lean();
};

const removeRating = (ratingId) => {
  return ratingDB.deleteOne({ _id: ObjectId(ratingId) })
}

const deleteRating = (userId, trendId) => {
  return ratingDB.deleteOne({ userId: ObjectId(userId), trendId: ObjectId(trendId) });
}


module.exports = {
  addRating,
  getRating,
  removeRating,
  deleteRating,
  getMyRating,
};