const { default: axios } = require('axios');
const mongoose = require('mongoose');
const appConfig = require('../../../../configs/app.config');

const { addPost, updatePost } = require("../../../data-access/v2/followlinks");

const ObjectId = mongoose.Types.ObjectId;

module.exports = async (profileId, user, files, payload, token, isWelcomeVideo) => {

    const postObject = {
        media: files,
        challengeId: payload.challengeId && payload.challengeId.length ? payload.challengeId.map(challengeId => ObjectId(challengeId)) : [],
        description: payload.description,
        location: user.location,
        //userId: user._id, //=>v1
        userId: profileId, //=>v2
        isSafe: true,
        tags: payload.tags || [],
        channelId: payload.channelId || null,
        offerId: payload.offerId || null
    };

    if (isWelcomeVideo) {
        postObject.isWelcomeVideo = isWelcomeVideo;
    }


    let urls = files
        .filter(image => image.type === 'image')
        .map(image => `https://${appConfig.s3.bucket.name}.s3.ap-south-1.amazonaws.com/followlinks-posts/${image.media}`);

    // files
    //     .filter(video => video.type === 'video')
    //     .forEach(video => {
    //         urls = urls.concat([1, 2, 3, 4].map((_item, index) => `https://${appConfig.s3.bucket.name}.s3.ap-south-1.amazonaws.com/followlinks-posts/${video.media}-${index + 1}`));
    //     });

    const post = await addPost(postObject);
    return post
    // let result = await axios.post(`${appConfig.mediaFilter.baseUrl}/filter/images`, {
    //     method: 'put',
    //     callbackUrl: `${appConfig.userApi.baseUrl}/v2/media/followlinks/${post._id.toString()}/mark-safe`,
    //     urls,
    //     token
    // });

    // let markUnsafe = false

    // if (result && result.data.result && result.data.result.length > 0) {
    //     result.data.result.map((result) => {
    //         if (!result.isSafe) { markUnsafe = true }
    //     })
    // }

    // if (markUnsafe) {
    //     await updatePost(post._id, { isSafe: false })
    //     return false
    // }

    // return true
};