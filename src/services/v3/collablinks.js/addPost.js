const { default: axios } = require("axios");
const mongoose = require("mongoose");
const appConfig = require("../../../../configs/app.config");

const { addPost } = require("../../../data-access/v3/collablinks");


module.exports = async (
  profileId,
  user,
  files,
  payload,
) => {
  const postObject = {
    media: files,
    description: payload.description,
    location: user.location,
    userId: profileId, //=>v2
    isSafe: true,
  };


  let urls = files
    .filter((image) => image.type === "image")
    .map(
      (image) =>
        `https://${appConfig.s3.bucket.name}.s3.ap-south-1.amazonaws.com/followlinks-posts/${image.media}`
    );

  // files
  //     .filter(video => video.type === 'video')
  //     .forEach(video => {
  //         urls = urls.concat([1, 2, 3, 4].map((_item, index) => `https://${appConfig.s3.bucket.name}.s3.ap-south-1.amazonaws.com/followlinks-posts/${video.media}-${index + 1}`));
  //     });

  const post = await addPost(postObject);
  return post;
};
