const {
  getProfileFamelinks,
  getProfileFollowlinks,
  getProfileFunlinks,
  getOtherProfileFunlinks,
  getProfileJoblinks,
  getStorelinks,
  getSelfCollablinks,
  getOtherCollablinks,
  getBrandProfileJoblinks,
  getAgencyProfileJoblinks,
  getOtherProfileJoblinks,
} = require("../../../data-access/v2/users");
const { getOneUser } = require("../../../data-access/v2/users");
const {
  getTotalLikesViews,
  getTotalVideos,
} = require("../../../data-access/v2/funlinks");
const { getClubs } = require("../../../data-access/v2/clubs");
const { getClubOffersNew } = require("../../../data-access/v2/clubOffers");
const brandVisitService = require("../../../services/v2/users/brandVisit");

module.exports = async (
  userId,
  linkType,
  profile,
  followerId,
  page,
  selfJoblinksId,
  selfStorelinksId
) => {
  let temp;
  let result = await getOneUser(userId);

  if (!result) {
    return;
  }

  switch (linkType) {
    case "famelinks":
      {
        try {
          //MasterIdMigration
          result = await getProfileFamelinks(
            userId,
            followerId,
            page
          );
          if (result && result.length > 0) {
            result[0].hearts = result[0].likes2Count + Math.round(result[0].likes1Count / 2);
            result[0].score = 0;
            result[0].trendzSet = result[0].trendsWon.length;
            if (result[0].titlesWon && result[0].titlesWon.length == 0) {
              result[0].Contesting = result[0].masterUser.location.value;
            }
            return result;
          }
        } catch (error) {
          console.log('Error :: ', error)
        }
        return;
      }
      break;
    case "followlinks":
      {
        let followlinksId = userId;
        let funlinksId = userId;
        let userType = result.type;
        result = await getProfileFollowlinks(
          userId,
          followerId,
          page
        );
        if (result && result.length == 0) {
          return;
        }
        let clubs = await getClubs();
        result[0].clubs = clubs;

        result[0].newOffers = 0;
        let newOffers = await getClubOffersNew(
          followlinksId,
          funlinksId,
          userType,
          page
        );
        if (newOffers && newOffers.length > 0) {
          result[0].newOffers = newOffers.length;
        }
        // const clubDetails = await getClubsService()
        // result[0].clubDetails = clubDetails;
        result[0].clubDetails = [
          {
            clubName: "Bud",
            clubOffer: "10-50",
            clubRange: "0-5K",
          },
          {
            clubName: "Rising",
            clubOffer: "20-100",
            clubRange: "5K-50K",
          },
          {
            clubName: "Known",
            clubOffer: "50-500",
            clubRange: "50K-200K",
          },
          {
            clubName: "Celebrity",
            clubOffer: "500-1K",
            clubRange: "200K-1M",
          },
          {
            clubName: "Star",
            clubOffer: "1K-10K",
            clubRange: "1M-5M",
          },
          {
            clubName: "Superstar",
            clubOffer: "10K-100K",
            clubRange: "5M-5M+",
          },
        ];
        return result;
      }
      break;
    case "funlinks":
      {
        let profileId = userId;
        if (profile == "other") {
          result = await getOtherProfileFunlinks(profileId, followerId, page);
          if (result && result.length == 0) {
            return;
          }
          result[0].totalLikes = 0;
          result[0].totalViews = 0;
          result[0].videos = 0;
          temp = await getTotalVideos(profileId);
          if (temp.length > 0) {
            result[0].videos = temp.length;
          }
          temp = null;
          temp = await getTotalLikesViews(profileId);
          if (temp.length > 0) {
            result[0].totalLikes = temp[0].totalLikes;
            result[0].totalViews = temp[0].totalViews;
          }
          return result;
        } else {
          result = await getProfileFunlinks(profileId, followerId, page);
          if (result && result.length == 0) {
            return;
          }
          result[0].totalLikes = 0;
          result[0].totalViews = 0;
          result[0].videos = 0;
          temp = await getTotalVideos(profileId);
          if (temp.length > 0) {
            result[0].videos = temp.length;
          }
          temp = null;
          temp = await getTotalLikesViews(profileId);
          if (temp.length > 0) {
            result[0].totalLikes = temp[0].totalLikes;
            result[0].totalViews = temp[0].totalViews;
          }
          return result;
        }
      }
      break;
    case "joblinks":
      try {
        if (profile == "other") {
          return await getOtherProfileJoblinks(
            userId,
            result.type,
            followerId,
            selfJoblinksId,
            page
          );
        }
        
        if (result.type == "brand") {
          return await getBrandProfileJoblinks(userId, page);
        }

        // if (result.type == "agency") {
        //   return await getAgencyProfileJoblinks(result.profileJoblinks);
        // }

        return await getProfileJoblinks(result.profileJoblinks, page);
      } catch (error) {
        console.log('Error :: ', error)
      }
      break;
    case "storelinks":
      if (followerId) {
        if (profile == "other") {
          await brandVisitService(
            followerId,
            "profile",
            userId
          );
        }
      }
      result = await getStorelinks(userId, followerId, page);
      return result;
      break;
    case "collablinks":
      if (profile == "other") {
        result = await getOtherCollablinks(
          userId,
          followerId,
          page
        );
        return result;
      }

      result = await getSelfCollablinks(
        userId,
        followerId,
        page,
        result._id
      );
      return result;
      break;
    default:
      return;
  }
};
