const { default: axios } = require("axios");
const mongoose = require("mongoose");
const appConfig = require("../../../../configs/app.config");

const { addPost } = require("../../../data-access/v2/brandProducts");

module.exports = async (user, files, payload, token, profileId, isWelcomeVideo) => {
  //hashTag, id) => {
  let data, buttonData, descriptionData;
  payload.purchaseUrl === null ||
    payload.purchaseUrl === "" ||
    payload.purchaseUrl === undefined ||
    !payload.purchaseUrl
    ? (data = null)
    : (data = payload.purchaseUrl);
  payload.buttonName === null ||
    payload.buttonName === "" ||
    payload.buttonName === undefined ||
    !payload.buttonName
    ? (buttonData = null)
    : (buttonData = payload.buttonName);
  payload.description === null ||
    payload.description === "" ||
    payload.description === undefined ||
    !payload.description
    ? (descriptionData = null)
    : (descriptionData = payload.description);
  payload.buttonName === null ||
    payload.buttonName === "" ||
    payload.buttonName === undefined ||
    !payload.buttonName
    ? (buttonData = null)
    : (buttonData = payload.buttonName);

  const postObject = {
    media: files,
    purchaseUrl: data,
    buttonName:
      payload.purchaseUrl === null ||
        payload.purchaseUrl === "" ||
        payload.purchaseUrl === undefined ||
        !payload.purchaseUrl
        ? null
        : buttonData,
    description: descriptionData,
    challengeId: payload.challengeId,
    // hashTag: hashTag && hashTag.length ? [{ name: hashTag[0], _id: id }] : [],
    hashTag: payload.hashTag,
    name: payload.name,
    price: payload.price,
    location: user.location,
    userId: profileId, //user._id,
    allotedCoins: payload.allotedCoins || 0,
    isSafe: true,
  };

  if (isWelcomeVideo) {
      postObject.isWelcomeVideo = isWelcomeVideo;
  }

  let urls = files
    .filter((image) => image.type === "image")
    .map(
      (image) =>
        `https://${appConfig.s3.bucket.name}.s3.ap-south-1.amazonaws.com/famelinks-posts/${image.media}`
    );

  files
    .filter((video) => video.type === "video")
    .forEach((video) => {
      urls = urls.concat(
        [1, 2, 3, 4].map(
          (_item, index) =>
            `https://${appConfig.s3.bucket.name
            }.s3.ap-south-1.amazonaws.com/famelinks-posts/${video.media}-${index + 1
            }`
        )
      );
    });

  const post = await addPost(postObject);
  return post;
  // return axios.post(`${appConfig.mediaFilter.baseUrl}/filter/images`, {
  //     method: 'put',
  //     callbackUrl: `${appConfig.userApi.baseUrl}/v2/media/followlinks/${post._id.toString()}/mark-safe`,
  //     urls,
  //     token
  // });
};
