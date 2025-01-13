const { addRating, deleteRating } = require("../../../data-access/v3/rating");

exports.addRating = async (userId, trendId, rating) => {
  return await addRating(userId, trendId, rating);
};

exports.deleteRating = async (userId, trendId) => {
  return await deleteRating(userId, trendId);
};
