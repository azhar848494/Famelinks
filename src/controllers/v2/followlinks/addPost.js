const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const addPostService = require("../../../services/v2/followlinks/addPost");
const ChallengeDB = require("../../../models/v2/challenges");
const { getWelcomeVideo } = require("../../../data-access/v2/followlinks");
const { updatePost } = require("../../../data-access/v2/followlinks");
const sendNotificationsService = require("../../../services/v2/users/sendNotifications");
const { getUserByTag } = require("../../../data-access/v2/users");
const getChannelById = require('../../../services/v2/channels/getChannelById')
const settingsDB = require('../../../models/v2/settings')
const getClubOfferByCode = require('../../../services/v2/clubOffers/getClubOfferByCode')
const updateClubOffer = require('../../../services/v2/clubOffers/updateClubOffer')
const appConfig = require('../../../../configs/app.config')
const getTodaysOfferPosts = require('../../../services/v3/followlinks/getTodaysOfferPosts')

const getOneUserService = require("../../../services/v2/users/getOneUser");
const {
  updateProduct,
  updateTags,
  getBrandProductsById,
  getBrandProductCoinsById,
  updateProductCoins,
  addBrandProductsTags,
  updateBrandProductsTag,
} = require("../../../data-access/v2/brandProducts");
const {
  updateUser,
  addAgencyTags,
  updateAgencyTag,
  getAgencyTag,
} = require("../../../data-access/v2/users");

module.exports = async (request) => {
  let agencyTags = request.body.agencyTags;
  let brandProductTags = [request.body.productId];
  let brandHashtags = [];
  let updateBrandProducts = [];
  let earnedFamecoins = 0;
  let brandProductCoins;

  let channelId = request.body.channelId
  let offerCode = request.body.offerCode
  let clubOffer

  if (request.body.isWelcomeVideo && request.body.isWelcomeVideo === true) {
    let uploadPost;

    let result = await getWelcomeVideo(request.user._id);
    if (result && result.length > 0) {
      result[0].video = request.files["video"];
      await updatePost(result[0]._id, result[0]);

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

    if (!uploadPost) {
      return serializeHttpResponse(500, {
        message: "Post upload unsuccessful",
      });
    }
  }

  if (channelId) {
    let channel = await getChannelById(channelId)
    if (!channel) {
      return serializeHttpResponse(500, {
        message: 'Channel does not exists. Failed to upload post'
      })
    }
  }

  if (offerCode) {
    clubOffer = await getClubOfferByCode(offerCode)
    if (!clubOffer) {
      return serializeHttpResponse(400, {
        message: "Offer code invalid",
      });
    }

    if (clubOffer.type != 'followlinks') {
      return serializeHttpResponse(400, {
        message: "Selected offer code is not applicable to followlinks' post",
      });
    }

    if (clubOffer.postId) {
      return serializeHttpResponse(400, {
        message: "Bad request. Club offer already applied to some another post",
      });
    }

    if (clubOffer.selectedPromoter.toString() != request.user._id.toString()) {
      return serializeHttpResponse(400, {
        message: "Cannot apply this offer code. You are not selected for this club offer",
      });
    }

    let settings = await settingsDB.findOne({ _id: appConfig.settingsId })
    let todaysOfferPosts = await getTodaysOfferPosts(request.user._id)

    if (todaysOfferPosts >= settings.clubOfferDailyPosts) {
      return serializeHttpResponse(400, {
        message: 'Daily limit reached to upload club offer posts'
      })
    }

    request.body.offerId = clubOffer._id;
  }

  if (brandProductTags && brandProductTags.length > 0) {
    brandProductTags = await Promise.all(
      brandProductTags.map(async (tag) => {
        let brandProduct = await getBrandProductsById(tag);
        return brandProduct;
      })
    );

    brandProductCoins = await Promise.all(
      brandProductTags.map(async (tag) => {
        let brandProductCoins = await getBrandProductCoinsById(tag);
        console.log('brandProductCoins ::: ', brandProductCoins)
        return brandProductCoins;
      })
    );
    console.log('brandProductCoins list ::: ', brandProductCoins)
    if (
      brandProductCoins[0].balance < brandProductCoins[0].giftCoins ||
      brandProductCoins[0].balance == 0
    ) {
      return serializeHttpResponse(400, {
        message: "Cannot tag selected brand product. Insufficient famecoins",
      });
    }

    brandProductTags = brandProductTags.filter((x) => !!x);
    console.log('brandProductTags ::: ', brandProductTags)

    //   if (brandProductTags && brandProductTags.length > 1) {
    //     return serializeHttpResponse(400, {
    //       message: "Only one brand product is allowed to tag",
    //     });
    //   }
  }

  if (request.body.challenges && request.body.challenges.length) {
    const challengeIds = await Promise.all(
      request.body.challenges.map(async (hashTag) => {
        let temp = hashTag.replace(/ /g, "").toLowerCase();
        let splitTemp = temp.split("");
        if (splitTemp[0] == "#") {
          splitTemp[1] = splitTemp[1].toUpperCase();
        } else {
          splitTemp[0] = splitTemp[0].toUpperCase();
          splitTemp = ["#"].concat(splitTemp);
        }
        temp = splitTemp.join("");

        let challenge = await ChallengeDB.findOne({
          hashTag: temp,
          type: "brand",
        }).lean();

        if (challenge) {
          brandHashtags.push(challenge);
        }

        challenge = await ChallengeDB.findOne({
          hashTag: temp,
          type: "followlinks",
        }).lean();

        if (!challenge) {
          challenge = await ChallengeDB.create({
            hashTag: temp,
            type: "followlinks",
            createdBy: request.user._id,
          });
        }

        return challenge["_id"];
      })
    );
    request.body.challengeId = challengeIds;
  }

  if (brandProductTags && brandProductTags.length > 0) {
    console.log('brandProductTags ::: ', brandProductTags)
    let temp = brandProductCoins.filter((product) => {
      if (product.allotedCoins >= product.giftCoins) {
        product.balance = product.balance - product.giftCoins;
        updateBrandProducts.push(product);
        earnedFamecoins = earnedFamecoins + product.giftCoins;
        return product;
      }
    });
  }

  if (
    brandProductTags &&
    brandProductTags.length > 0
  ) {
    brandProductTags = await Promise.all(
      brandProductTags.map(async (tag) => {
        let product = await getBrandProductsById(tag);
        let brandProductCoins = await getBrandProductCoinsById(tag);

        if (product) {
          await addBrandProductsTags(product._id, brandProductCoins.giftCoins);
        }
      })
    );
  }


  let result = await addPostService(
    request.user._id,
    request.user,
    request.files,
    request.body,
    request.headers.authorization
  );

  if (!result) {
    return serializeHttpResponse(500, {
      message: "Post not upload",
    });
  }

  if (brandProductTags && brandProductTags.length > 0) {
    await Promise.all(
      brandProductTags.map(async (tag) => {
        let brandProduct = await getBrandProductsById(tag);
        if (brandProduct) {
          await updateBrandProductsTag(tag, result._id);
        }
      })
    );
  }

  // if (agencyTags && agencyTags.length > 0) {
  //   agencyTags = await Promise.all(
  //     agencyTags.map(async (tag) => {
  //       let user = await getUserByTag(tag);
  //       if (user) {
  //         var TagId = await addAgencyTags(user._id, result._id);
  //       }
  //       return user;
  //     })
  //   );

  if (agencyTags && agencyTags.length > 0) {
    agencyTags.map(async (user) => {
      let User = await getUserByTag(user);
      let TagId = await addAgencyTags(User._id, result._id);
      await sendNotificationsService(
        "tag",
        {
          sourceName: request.user.name,
          sourceId: request.user._id,
          sourceMedia: request.user.profileImage,
          sourceType: request.user.type,
        },
        null,
        {
          targetId: User._id,
          pushToken: User.pushToken,
          //count: onePost.commentsCount,
          userId: User._id,
          targetMedia: User.profileImage,
          category: "request",
          tagId: TagId.postId,
        },
        true,
        true
      );
    });
  }
  //}

  console.log('updateBrandProducts ::: ', updateBrandProducts)
  if (updateBrandProducts && updateBrandProducts.length > 0) {
    updateBrandProducts.map(async (product) => {
      await updateProductCoins(product.productId, product.balance);
    });
  }

  console.log('earnedFamecoins ::: ', earnedFamecoins)
  if (earnedFamecoins) {
    let payload = {};
    payload.fameCoins = request.user.fameCoins + earnedFamecoins;

    await updateUser(request.user._id, payload);
  }

  if (request.body.productId) {
    //When user tag brand product
    let productCoin = await getBrandProductCoinsById(request.body.productId);
    console.log('productCoin ::: ', productCoin)
    if (productCoin.balance < productCoin.giftCoins || productCoin.balance == 0) {
      return serializeHttpResponse(400, {
        message: "Cannot tag selected brand product. Insufficient famecoins",
      });
    }
    //User get the coins
    let payload = {};
    payload.fameCoins = request.user.fameCoins + productCoin.perTagCoins;

    await updateUser(request.user._id, payload);

    //Update coin balance
    let balance = productCoin.balance - productCoin.perTagCoins;
    await updateProductCoins(request.body.productId, balance);
  }

  if (offerCode && clubOffer) {
    clubOffer.postId = result._id
    await updateClubOffer(clubOffer._id, clubOffer)
  }

  return serializeHttpResponse(200, {
    message: "Followlinks Added",
  });
  //-----------------------v2-----------------------//
};
