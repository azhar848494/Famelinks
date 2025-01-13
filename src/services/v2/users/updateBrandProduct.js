const { values } = require("lodash");
const BrandProductDB = require("../../../models/v2/brandProducts");
const ChallengeDB = require("../../../models/v2/challenges");
const createChallengeService = require("../../../services/v2/challenges/createChallenge");

module.exports = async (postId, payload) => {
    // if (payload.tags && payload.tags.length) {
    //     var brandTags = await ChallengeDB.findOne({ hashTag: [payload.tags] });
    //     if (!brandTags) {
    //         brandTags = await createChallengeService({
    //             hashTag: payload.tags,
    //             type: "brand",
    //         });
    //     }
    // } else {
    //     var brandTag = await BrandProductDB.findOne({ _id: postId });
    // }
    // const postObject = {
    //     description: payload.description,
    //     purchaseUrl: payload.purchaseUrl && payload.purchaseUrl.length ? payload.purchaseUrl : brandTag['purchaseUrl'],
    //     buttonName: payload.buttonName && payload.buttonName.length ? payload.buttonName : brandTag['buttonName'],
    //     name: payload.name && payload.name.length ? payload.name : brandTag['name'],
    //     hashTag: payload.tags && payload.tags.length ? { name: payload.tags, _id: brandTags['_id'] } : brandTag['hashTag'],
    //     price: payload.price && payload.price.length ? payload.price : brandTag['price'],
    //     district: payload.district && payload.district.length ? payload.district : brandTag['district'],
    //     state: payload.state && payload.state.length ? payload.state : brandTag['state'],
    //     country: payload.country && payload.country.length ? payload.country : brandTag['country'],
    // };

    // if (payload.isSafe === true || payload.isSafe === false) {
    //     postObject.isSafe = payload.isSafe;
    // }

    // return BrandProductDB.updateOne({ _id: postId }, postObject);
    
    let postObject = {}

    for (const [key, value] of Object.entries(payload)) {
        postObject[key] = value
    }

    if (payload.isSafe === true || payload.isSafe === false) {
        postObject.isSafe = payload.isSafe;
    }

    return BrandProductDB.updateOne({ _id: postId }, { $set: postObject });
};