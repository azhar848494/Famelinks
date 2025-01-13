const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getProductByHashtagService = require("../../../services/v2/users/checkProductByHashtag");
const {
  getFunlinksChallengesBySearch,
} = require("../../../data-access/v2/challenges");

module.exports = async (request) => {

  if (request.body.hashTag === "") {
    return serializeHttpResponse(200, {
      message: "Product name available",
      result: {
        isAvailable: true,
      },
    });
  }

  if (request.body.hashTag && request.body.hashTag != "") {
    let temp = request.body.hashTag.replace(/ /g, "").toLowerCase();
    let splitTemp = temp.split("");
    if (splitTemp[0] == '#') {
      splitTemp[1] = splitTemp[1].toUpperCase();
    } else {
      splitTemp[0] = splitTemp[0].toUpperCase();
      splitTemp = ['#'].concat(splitTemp)
    }
    temp = splitTemp.join("");
    request.body.hashTag = temp
  }

  const products = await getProductByHashtagService(request.body.hashTag);

  let productName = [];
  if (products && products.length > 0) {
    productName = products.filter((product) => {
      if (product.name === request.body.productName) {
        return product
      }
    })
  }

  if (productName && productName.length == 0) {
    return serializeHttpResponse(200, {
      message: "Product Name Available",
      result: {
        isAvailable: true,
      },
    });
  }

  return serializeHttpResponse(400, {
    message: "Product Name Not Available",
    result: {
      isAvailable: false,
    },
  });
};
