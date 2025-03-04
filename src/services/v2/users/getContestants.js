const { getOpenChallenges, getOpenChallengesHashTag, getOpenFametrendzs, getOpenFametrendzsHashTag } = require("../../../data-access/v2/challenges");
const { getUserMostLikedPost, getFameLinks } = require("../../../data-access/v2/famelinks");
const { getContestants, getSearchContestants, getRecommendedContestants, getTrendingContestants, getUserFollowStatus, getUsers } = require("../../../data-access/v2/users");
const { searchChannel } = require('../../../data-access/v2/channels')
const { searchClubOffersByName } = require('../../../data-access/v2/clubOffers')
const { getFameLinksById } = require("../../../data-access/v2/famelinks");
const { getFunLinksById } = require('../../../data-access/v2/funlinks');
const { getSearchJobs } = require('../../../data-access/v2/joblinks');

module.exports = async (userId, { type, ageGroup, gender, district, state, country, continent, search, page, postType }, isSearch, followlinksId, funlinksId, userType) => {
    const condition = {};
    let result = {};
    if (isSearch) {
        result.users = await getSearchContestants(search, page, userId, postType);

        switch (postType) {
            case 'famelinks':
                let res = await getOpenFametrendzs(search, page, userId);
                await Promise.all(
                    res.map(async (item) => {
                        item.posts = await Promise.all(
                            item.posts.map(async (post) => {
                                const [res] = await getFameLinksById(userId, userId, post._id);
                                if (res != undefined || res != null) {
                                    res.media = res.media.filter((item) => {
                                        return item.path;
                                    });
                                    return res;
                                }
                            })
                        );
                        item.posts = item.posts.filter((post) => !!post);
                        let items, requiredItems;
                        item.category === "post"
                            ? (items = item.totalPost)
                            : item.category === "participants"
                                ? (items = item.totalParticipants)
                                : item.category === "impression"
                                    ? (items = item.totalImpressions)
                                    : "default";
                        requiredItems = item.milestoneAggrement.milestoneValue;
                        item.percentCompleted = items > requiredItems ? 100 : Math.round((items / requiredItems) * 100);
                        item.isCompleted = Math.round((items / requiredItems) * 100) >= 100;
                        return item;
                    })
                );
                result.trendz = res;
                break;
            case 'funlinks':
                var result2 = await getOpenChallenges(search, page, userId);
                result.challenges = await Promise.all(result2.map(async item => {
                    item.posts = await Promise.all(item.posts.map(async post => {
                        const [result] = await getFunLinksById(userId, post._id, userId);
                        return result;
                    }));
                    // item.participantsCount = await getChallengeParticipantsCount(item._id);
                    item.posts = item.posts.filter(post => post)
                    return item;
                },
                ));
                break;
            case 'followlinks':
                result.channels = await searchChannel(userId, search, page)
                result.clubOffers = await searchClubOffersByName(userId, search, followlinksId, funlinksId, userType, page)
                break;
            case 'joblinks':
                result.jobs = await getSearchJobs(userId, page, search)
                break;
        }
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
                    case 'individual': break;
                    case 'brand': break;
                    case 'agency': break;
                    default: break;
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