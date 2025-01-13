const { removeRating } = require("../../../data-access/v3/rating");

module.exports = async (ratingId) => {
  return await removeRating(ratingId);
};
