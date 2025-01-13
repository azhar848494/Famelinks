const { getAdFameLinks, getAdFameLinksOfficialPosts } = require("../../../data-access/v2/famelinks");
const { getAdBrandPosts, getsAdBrandPosts } = require("../../../data-access/v2/brandProducts");

module.exports = async (userId, page) => {
    let result = await getAdFameLinks(userId, page);
    if (page === 1) {
        const famelinksPosts = await getAdFameLinksOfficialPosts(userId, 1);
        if (famelinksPosts.length) {
            result = [famelinksPosts[0]].concat(result);
        }
    }
    let getBrandPost = await  getAdBrandPosts(userId,page)
    let getAdBrandPost = await  getsAdBrandPosts('62343ba3459eca165beff26e',page)
    result = result.concat(getAdBrandPost)
    result = result.concat(getBrandPost)
    return result.map(item => {
        // if (item.user.ambassador) {
        //     item.winnerTitles = [item.user.ambassador];
        // }
        if (item.type === 'brand') {
            let video = item.media.filter(i => i.type === 'video');
            const images = item.media.filter(i => i.type === 'image');
            if (video.length) {
                video = video[0].media;
            } else {
                video = null;
            }
            item.media = [
                {
                    path: video,
                    type: 'video'
                },
                {
                    path: images[0] ? images[1].media: null,
                    type: 'closeUp'
                },
                {
                    path: images[1] ? images[1].media: null,
                    type: 'closeUp'
                },
                {
                    path: images[2] ? images[2].media: null,
                    type: 'medium'
                },
                {
                    path: images[3] ? images[3].media: null,
                    type: 'long'
                },
                {
                    path: images[4] ? images[4].media: null,
                    type: 'pose1'
                },
                {
                    path: images[5] ? images[5].media: null,
                    type: 'pose2'
                },
                {
                    path: images[6] ? images[6].media: null,
                    type: 'additional'
                }
            ];
        }
        item.media = item.media.filter(oneImage => {
            return oneImage.path;
        });
        return item;
    });
};