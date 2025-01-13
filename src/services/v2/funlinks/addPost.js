const mongoose = require('mongoose');
const appConfig = require('../../../../configs/app.config');

const { addPost, addMusic } = require("../../../data-access/v2/funlinks");

const ObjectId = mongoose.Types.ObjectId;

module.exports = async (
  profileId,
  user,
  files,
  payload,
  token,
  isWelcomeVideo
) => {
  let musicId = null;
  if (files.audio && !payload.musicId && payload.musicName) {
    const music = await addMusic(files["audio"], payload.musicName, 30, files["video"].concat("-xs"));
    musicId = music._id;
  }

  const postObject = {
    video: files["video"] || null,
    challengeId:
      payload.challengeId && payload.challengeId.length
        ? payload.challengeId.map((challengeId) => ObjectId(challengeId))
        : [],
    description: payload.description,
    location: user.location,
    userId: profileId,
    musicName: payload.musicName || "",
    musicId: musicId || payload.musicId,
    audio: files["audio"] || null,
    isSafe: true,
    tags: payload.tags || [],
    talentCategory: payload.talentCategory || [],
  };
  //console.log(isWelcomeVideo);

  if (isWelcomeVideo) {
    postObject.isWelcomeVideo = isWelcomeVideo;
  }
  //console.log(postObject);

  let urls = [1, 2, 3, 4].map(
    (_item, index) =>
      `https://${appConfig.s3.bucket.name
      }.s3.ap-south-1.amazonaws.com/funlinks-posts/${postObject.video}-${index + 1
      }`
  );
  const post = await addPost(postObject);
  return post;
  // return axios.post(`${appConfig.mediaFilter.baseUrl}/filter/images`, {
  //     method: 'put',
  //     callbackUrl: `${appConfig.userApi.baseUrl}/v2/media/funlinks/${post._id.toString()}/mark-safe`,
  //     urls,
  //     token
  // });
};
