const {
  getOpenFametrendzs,
  getUpcomingFametrendzs,
  getOpenFametrendzsBySearch,
  getUpcomingFamecontest,
} = require("../../../data-access/v2/challenges");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = async (
  status,
  page,
  search,
  type,
  sponsorId,
  gender,
  ageGroup,
  location,
  userId,
) => {
  let filterObj = {};
  if (sponsorId != "*") {
    filterObj.$expr = { $eq: ["$sponsor", ObjectId(sponsorId)] };
  }

  if (type === "fameContest") {
    return getUpcomingFamecontest(page);
  }
  switch (status) {
    case "open":
      if (page) {
        return getOpenFametrendzs(search, page, [type]);
      } else {
        return getOpenFametrendzsBySearch(search, [type]);
      }

    case "upcoming":
      let result1 = await getUpcomingFametrendzs(page, [type], filterObj, userId);
      let result = await getUpcomingFamecontest(
        page,
        gender,
        ageGroup,
        location
      );
      return [...result, ...result1];
  }
};
