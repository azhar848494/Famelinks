const { getFamelinks, getFameLinksOfficialPosts, getUser } = require('../../../data-access/v3/famelinks')
// const { getFamelinks, getFameLinksOfficialPosts } = require('../../../data-access/v3/famelinks')
const { getBrandPosts } = require('../../../data-access/v3/brandProducts')


exports.getUserService = async (id) => {
    return await getUser(id);
}

exports.getFamelinksService = async (page, location, ageGroup, gender, famelinksDate, famelinks) => {
    let filterObj = {}
    if (famelinksDate != '*' && famelinks == 'next') {
        filterObj.$expr = { $lt: ['$createdAt', famelinksDate] }
    }

    if (famelinksDate != '*' && famelinks == 'prev') {
        filterObj.$expr = { $gt: ['$createdAt', famelinksDate] }
    }

    let result = await getFamelinks(page, location, ageGroup, gender, filterObj)
    if (page === 1) {
        const famelinksPosts = await getFameLinksOfficialPosts(1);
        if (famelinksPosts.length) {
            result = [famelinksPosts[0]].concat(result);
        }
    }
    let getBrandPost = await getBrandPosts(page)
    result = result.concat(getBrandPost)
    result = result.map(item => {
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
                    path: images[0] ? images[0].media : null,
                    type: 'closeUp'
                },
                {
                    path: images[1] ? images[1].media : null,
                    type: 'closeUp'
                },
                {
                    path: images[2] ? images[2].media : null,
                    type: 'medium'
                },
                {
                    path: images[3] ? images[3].media : null,
                    type: 'long'
                },
                {
                    path: images[4] ? images[4].media : null,
                    type: 'pose1'
                },
                {
                    path: images[5] ? images[5].media : null,
                    type: 'pose2'
                },
                {
                    path: images[6] ? images[6].media : null,
                    type: 'additional'
                }
            ];
        }
        item.media = item.media.filter(oneImage => {
            return oneImage.path;
        });
        return item;
    });
    return result
} 