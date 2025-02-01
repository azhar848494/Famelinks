const { getOpenChallenges, getOpenChallengesHashTag, getOpenFametrendzs, getOpenFametrendzsHashTag } = require("../../../data-access/v2/challenges");
const { getUserMostLikedPost, getFameLinks } = require("../../../data-access/v2/famelinks");
const { getContestants,getSearchContestants, getRecommendedContestants, getTrendingContestants, getUserFollowStatus, getUsers } = require("../../../data-access/v2/users");
const { searchChannel } = require('../../../data-access/v2/channels')
const { searchClubOffersByName } = require('../../../data-access/v2/clubOffers')

module.exports = async (userId, { type, ageGroup, gender, district, state, country, continent, search, page, postType }, isSearch, followlinksId, funlinksId, userType) => {
    const condition = {};
    let result = {};
    let childProfile
    if (isSearch) {        
        condition.name = {name: {$regex: `^.*?${search}.*?$`}};
        condition.blockList = { $nin: [userId] };
        condition.isDeleted = false
        condition.isSuspended = false

        if (postType == 'followlinks') {
            // result.users = await getUsers(userId, search, page)
            result.channels = await searchChannel(userId, search, page)
            result.clubOffers = await searchClubOffersByName(userId, search, followlinksId, funlinksId, userType, page)
            // return result
        }

        result.challenges = []
        result.hashTags = []
        if (postType == 'famelinks') {
            result.challenges = await getOpenFametrendzs(search, page, [postType]);
            result.hashTags = await getOpenFametrendzsHashTag(search, page, [postType]);
        } else {
            result.challenges = await getOpenChallenges(search, page, [postType]);
            result.hashTags = await getOpenChallengesHashTag(search, page, [postType]);
        }
        result.users = await getSearchContestants(search, page);
        const statusList = await Promise.all(result.users.map(fetchedUser => {
            return getUserFollowStatus(userId, fetchedUser._id);
        }));
        statusList.forEach((status, index) => {
            if (status) {
                result.users[index].followStatus = true;
            } else {
                result.users[index].followStatus = false;
            }
        });
        result.users = result.users.map(user => {
            user.media = [{
                image: user.profileImage,
                imageType: user.profileImageType,
                likesCount: 0
            }];
            return user;
        });
    } else {
        if (district) condition.district = district;
        if (state) condition.state = state;
        if (country) condition.country = country;
        if (continent) condition.continent = continent;
        if (ageGroup) condition.ageGroup = ageGroup;
        if (gender) condition.gender = gender;

        condition.isDeleted = false
        condition.isSuspended = false

        // condition.likes2Count = { $gt: 0 };

        if (type === 'recommended') {
            result.users = await getRecommendedContestants(condition, page);
        } else if (type === 'trending') {
            result.users = await getTrendingContestants(condition, page);
        } else {
            result.users = await getContestants(condition, page);
        }
        result.users = await Promise.all(result.users.map(async user => {
            if (user.type) {
                switch (user.type) {
                    case 'individual': childProfile = user.profileFamelinks
                        break;
                    case 'brand': childProfile = user.profileStorelinks
                        break;
                    case 'agency': childProfile = user.profileCollablinks
                        break;
                    default: childProfile = user._id
                        break;
                }
                const [post] = await getUserMostLikedPost(user._id);
                if (post) {
                    user.media = [{
                        image: [
                            {
                              path: post.closeUp,
                              type: "closeUp",
                            },
                            {
                              path: post.medium,
                              type: "medium",
                            },
                            {
                              path: post.long,
                              type: "long",
                            },
                            {
                              path: post.pose1,
                              type: "pose1",
                            },
                            {
                              path: post.pose2,
                              type: "pose2",
                            },
                            {
                              path: post.additional,
                              type: "additional",
                            },
                            {
                              path: post.video,
                              type: "video",
                            },
                          ],
                        likesCount: post.likesCount
                    }];
                } else {
                    user.media = [];
                }
            } else {
                user.media = [];
            }
            return user;
        }));
    }
    return result;
};