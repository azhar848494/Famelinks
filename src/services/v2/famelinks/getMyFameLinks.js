const { getMyFameLinks } = require("../../../data-access/v2/famelinks");
var ObjectId = require("mongoose").Types.ObjectId;

// module.exports = async (userId, page, selfUserId) => {
//     const result = await getMyFameLinks(userId, page, selfUserId);
//     return result.map(item => {
//         item.media = item.media.filter(oneImage => {
//             return oneImage.path;
//         });
//         return item;
//     });
// };

//-----------------------v2------------------------//
module.exports = async (profileId, page, childProfileId, selfMasterId, hashTagId) => {
    let filterObj = {};
    let sorted = {};
 
    if (hashTagId != null) {
      {}
      filterObj = {
        challengeId: {$in:[ObjectId(hashTagId)]},
        isDeleted: false,
        isSafe: true,
        isBlocked: false,
      };
    } else {
      filterObj = {
        userId: ObjectId(profileId),
        isDeleted: false,
        isSafe: true,
        isBlocked: false,
      };
    }
    sorted = { createdAt: -1 };

    // if (postId != "*") {
    //   filterObj = {
    //     $or: [
    //       { $expr: { $eq: ["$_id", ObjectId(postId)] } },
    //       { $expr: { $lt: ["$_id", ObjectId(postId)] } },
    //     ],
    //   };
    //   sorted = { createdAt: -1 };
    // } else{
    //   sorted = { isWelcomeVideo: -1, createdAt: -1 };
    // }
    const result = await getMyFameLinks(
      profileId,
      page,
      childProfileId,
      selfMasterId,
      filterObj,
      sorted
    );
    return result.map(item => {
        item.media = item.media.filter(oneImage => {
            return oneImage.path;
        });
        return item;
    });
};
//-----------------------v2------------------------//