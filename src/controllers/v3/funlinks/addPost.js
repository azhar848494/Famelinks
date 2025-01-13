const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const { isValidObjectId } = require("../../../utils/db");
const addPostService = require("../../../services/v3/funlinks/addPost");
const ChallengeDB = require("../../../models/v2/challenges");
const getFunlinksProfile = require("../../../services/v2/users/getChildProfile");
const { getWelcomeVideo } = require("../../../data-access/v2/funlinks");
const { updatePost } = require("../../../data-access/v2/funlinks");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const { updateProduct, updateTags, getBrandProductsById } = require("../../../data-access/v2/brandProducts");
const { updateUser } = require("../../../data-access/v2/users");
const settingsDB = require('../../../models/v2/settings')
const getClubOfferByCode = require('../../../services/v2/clubOffers/getClubOfferByCode')
const updateClubOffer = require('../../../services/v2/clubOffers/updateClubOffer')
const appConfig = require('../../../../configs/app.config')
const getTodaysOfferPosts = require('../../../services/v3/funlinks/getTodaysOfferPosts')

module.exports = async (request) => {
  let tags = request.body.tags;
  let brandHashtags = []
  let brandProductTags
  let updateBrandProducts = []
  let earnedFamecoins = 0
  let offerCode = request.body.offerCode
  let clubOffer

  let funLinksProfile = await getFunlinksProfile(request.user._id, "funlinks");

  if (!funLinksProfile) {
    return serializeHttpResponse(500, {
      message: "Funlinks profile of requested user not found",
    });
  }

  if (request.body.isWelcomeVideo && request.body.isWelcomeVideo === true) {
    let uploadPost;
    let result = await getWelcomeVideo(funLinksProfile[0]._id);
    if (result && result.length > 0) {
      result[0].video = request.files.video;
      result[0].description = request.body.description;
      await updatePost(result[0]._id, result[0]);

      return serializeHttpResponse(200, {
        message: "Post upload successful",
      });
    }
    uploadPost = await addPostService(
      funLinksProfile[0]._id,
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

    return serializeHttpResponse(500, {
      message: "Post upload unsuccessful",
    });
  }

  if (offerCode) {
    clubOffer = await getClubOfferByCode(offerCode)
    if (!clubOffer) {
      return serializeHttpResponse(400, {
        message: "Offer code invalid",
      });
    }

    if (clubOffer.type != 'funlinks') {
      return serializeHttpResponse(400, {
        message: "Selected offer code is not applicable to funlinks' post",
      });
    }

    if (clubOffer.postId) {
      return serializeHttpResponse(400, {
        message: "Bad request. Club offer already applied to some another post",
      });
    }

    if (clubOffer.selectedPromoter.toString() != funLinksProfile[0]._id.toString()) {
      return serializeHttpResponse(400, {
        message: "Cannot apply this offer code. You are not selected for this club offer",
      });
    }

    let settings = await settingsDB.findOne({ _id: appConfig.settingsId })
    let todaysOfferPosts = await getTodaysOfferPosts(funLinksProfile[0]._id)

    if (todaysOfferPosts >= settings.clubOfferDailyPosts) {
      return serializeHttpResponse(400, {
        message: 'Daily limit reached to upload club offer posts'
      })
    }

    request.body.offerId = clubOffer._id
  }

  if (tags && tags.length > 0) {
    brandProductTags = await Promise.all(
      tags
        .map(async (tag) => {
          let brandProduct = await getBrandProductsById(tag);
          return brandProduct;
        })
    );

    brandProductTags = brandProductTags.filter(x => !!x)

    if (brandProductTags && brandProductTags.length > 1) {
      return serializeHttpResponse(400, {
        message: "Only one brand product is allowed to tag",
      });
    }
  }

  if (request.body.challenges && request.body.challenges.length) {
    const challengeIds = await Promise.all(
      request.body.challenges.map(async (hashTag) => {
        let temp = hashTag.replace(/ /g, "").toLowerCase();
        let splitTemp = temp.split("");
        if (splitTemp[0] == '#') {
          splitTemp[1] = splitTemp[1].toUpperCase();
        } else {
          splitTemp[0] = splitTemp[0].toUpperCase();
          splitTemp = ['#'].concat(splitTemp)
        }
        temp = splitTemp.join("");

        let challenge = await ChallengeDB.findOne({ hashTag: temp, type: 'brand' }).lean();

        if (challenge) {
          brandHashtags.push(challenge)
        }

        if (!challenge) {
          challenge = await ChallengeDB.findOne({ hashTag: temp, type: 'funlinks' }).lean();
        }

        if (!challenge) {
          challenge = await ChallengeDB.create({
            hashTag: temp,
            type: "funlinks",
            createdBy: funLinksProfile[0]._id,
          });
        }

        return challenge["_id"];
      })
    );
    request.body.challengeId = challengeIds;
  }

  if ((brandHashtags && brandHashtags.length > 0) && (brandProductTags && brandProductTags.length > 0)) {
    let temp = brandHashtags.filter((hashTag) => {
      let temp = brandProductTags.filter((product) => {
        if (hashTag.hashTag == product.hashTag) {
          if (product.allotedCoins >= hashTag.giftCoins) {
            product.allotedCoins = (product.allotedCoins - hashTag.giftCoins)
            updateBrandProducts.push(product)
            earnedFamecoins = earnedFamecoins + hashTag.giftCoins
            return product
          }
        }
      })
      if (temp && temp.length > 0) { return hashTag }
    })

    if (temp && temp.length == 0) {
      return serializeHttpResponse(400, {
        message: "Cannot tag selected brand product. Insufficient famecoins",
      });
    }
  }

  if (request.body.musicId) {
    const isValid = isValidObjectId(request.body.musicId);
    if (!isValid) {
      return serializeHttpResponse(400, {
        message: "Invalid music Id",
      });
    }
  }

  if (request.body.tags && request.body.tags.length > 0) {
    request.body.tags = await Promise.all(
      request.body.tags.map(async (tag) => {
        let product = await getBrandProductsById(tag);

        if (product && brandHashtags.includes(product.hashTag)) {
          return { tagId: tag, accepted: true };
        } else if (product) {
          return { tagId: tag, accepted: false };
        }

        let userData = await getOneUserService(tag);
        if (userData) {
          if (userData.type != "agency") {
            return { tagId: tag, accepted: false };
          } else {
            return { tagId: userData.profileCollablinks, accepted: false };
          }
        }
      })
    );
  }

  let result = await addPostService(
    funLinksProfile[0]._id,
    request.user,
    request.files,
    request.body,
    request.headers.authorization
  );

  if (!result) {
    return serializeHttpResponse(200, {
      message: "Funlinks not Added",
    });
  }

  if (tags && tags.length > 0) {
    await Promise.all(
      tags.map(async (tag) => {
        let brandProduct = await getBrandProductsById(tag);
        if (brandProduct) {
          await updateTags(tag, funLinksProfile[0]._id);
        }
      })
    );
  }

  if (updateBrandProducts && updateBrandProducts.length > 0) {
    updateBrandProducts.map(async (product) => {
      await updateProduct(product._id, product)
    })
  }

  if (earnedFamecoins) {
    let payload = {}
    payload.fameCoins = request.user.fameCoins + earnedFamecoins

    await updateUser(request.user._id, payload)
  }

  if (offerCode && clubOffer) {
    clubOffer.postId = result._id
    await updateClubOffer(clubOffer._id, clubOffer)
  }

  return serializeHttpResponse(200, {
    message: "Funlinks Added",
  });
};
