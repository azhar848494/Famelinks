const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const { isValidObjectId } = require("../../../utils/db");
const addPostService = require("../../../services/v2/funlinks/addPost");
const ChallengeDB = require("../../../models/v2/challenges");

const { getWelcomeVideo } = require("../../../data-access/v2/funlinks");
const { updatePost } = require("../../../data-access/v2/funlinks");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const { updateProduct, updateTags, getBrandProductsById } = require("../../../data-access/v2/brandProducts");
const { updateUser } = require("../../../data-access/v2/users");

module.exports = async (request) => {
  let tags = request.body.tags;
  let brandHashtags = []
  let brandProductTags
  let updateBrandProducts = []
  let earnedFamecoins = 0

  //MasterIdMigration
  if (request.body.isWelcomeVideo && request.body.isWelcomeVideo === true) {
    let uploadPost;
    let result = await getWelcomeVideo(request.user._id);
    if (result && result.length > 0) {
      result[0].video = request.files.video;
      result[0].description = request.body.description;
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

    return serializeHttpResponse(500, {
      message: "Post upload unsuccessful",
    });
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

  if (request.body.challenges && request.body.challenges.length > 0) {
    const challengeIds = await Promise.all(
      request.body.challenges.map(async (hashTag) => {
        let temp = hashTag.replace(/ /g, "").toLowerCase();
        let splitTemp = temp.split("");
        if (splitTemp[0] == '#') {
          splitTemp[1] = splitTemp[1].toUpperCase();
        } else {
          splitTemp[0] = splitTemp[0].toUpperCase();
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
            createdBy: request.user._id,
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
    request.user._id,
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
          await updateTags(tag, request.user._id);
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
  return serializeHttpResponse(200, {
    message: "Funlinks Added",
  });
  //     //-----------------------v2-----------------------//
};
