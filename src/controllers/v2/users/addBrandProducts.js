const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const addPostService = require("../../../services/v2/users/addBrandProducts");
const ChallengeDB = require("../../../models/v2/challenges");
const { updateUser } = require("../../../data-access/v2/users");
const { addBrandProductCoins } = require("../../../data-access/v2/brandProducts");
const { getWelcomeVideo, updatePost2 } = require("../../../data-access/v2/brandProducts");

module.exports = async (request) => {
  console.log('request ::: ', request.body);
  let giftCoins = request.body.giftCoins
  let allotedCoins = request.body.allotedCoins

  if (request.body.isWelcomeVideo && request.body.isWelcomeVideo === true) {
    let uploadPost;

    let result = await getWelcomeVideo(request.user._id);
    if (result && result.length > 0) {
      result[0].media[0].media = request.files[0]["media"];
      await updatePost2(result[0]._id, result[0]);

      return serializeHttpResponse(200, {
        message: "Post upload successful",
      });
    }

    uploadPost = await addPostService(
      request.user,
      request.files,
      request.body,
      request.headers.authorization,
      request.user._id,
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

  if (request.body.hashTag && request.body.hashTag != "") {
    let temp = request.body.hashTag.replace(/ /g, "").toLowerCase();
    // let splitTemp = temp.split("");
    // if (splitTemp[0] == '#') {
    //   splitTemp[1] = splitTemp[1].toUpperCase();
    // } else {
    //   splitTemp[0] = splitTemp[0].toUpperCase();
    // }
    // temp = splitTemp.join("");

    let challenge = await ChallengeDB.findOne({ hashTag: temp }).lean();

    if (!challenge) {
      challenge = await ChallengeDB.create({
        hashTag: temp,
        type: "brand",
        giftCoins: request.body.giftCoins || 0,
        createdBy: request.user._id,
      });
    }

    if (challenge) {
      giftCoins = challenge.giftCoins
    }

    request.body.challengeId = challenge["_id"];
    request.body.hashTag = temp

    if (!giftCoins && !allotedCoins) {
      return serializeHttpResponse(400, {
        message: "Please provide gift coins for this product. Also total gift coins alloted for this product",
      });
    }

    if (!giftCoins && allotedCoins) {
      return serializeHttpResponse(400, {
        message: "Please provide gift coins for this product",
      });
    }

    if (giftCoins && !allotedCoins) {
      return serializeHttpResponse(400, {
        message: "Please provide total gift coins alloted for this product",
      });
    }

    if (giftCoins && allotedCoins) {
      if (giftCoins > allotedCoins) {
        return serializeHttpResponse(400, {
          message: "Gift coins cannot be more than alloted coins",
        });
      }
    }

    if (allotedCoins) {
      if (allotedCoins > request.user.fameCoins) {
        return serializeHttpResponse(400, {
          message: "Alloted famecoins is greater than available famecoins with user",
        });
      }
    }
  }

  let result = await addPostService(
    request.user,
    request.files,
    request.body,
    request.headers.authorization,
    request.user._id
  );

  if (result) {
    await addBrandProductCoins(
      result._id,
      allotedCoins,
      giftCoins,
      allotedCoins
    );

    let updateObj = {}
    updateObj.fameCoins = (request.user.fameCoins - allotedCoins)
    await updateUser(request.user._id, updateObj)
  }

  if (!result) {
    return serializeHttpResponse(200, {
      message: "Brand Product not added",
    });
  }

  return serializeHttpResponse(200, {
    message: "Brand Product Added",
  });
};
