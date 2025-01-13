const { searchFunlinksById, updatePostFunlinks } = require('../../../data-access/v2/funlinks')
const { searchFollowlinksById, updatePostFollowlinks } = require('../../../data-access/v2/followlinks')

module.exports = async (profileId, postId, action) => {
    let postlink = 'funlinks'
    let tagFound = false
    let accept = false
    if (action == 'accept') { accept = true }

    let post = await searchFunlinksById(postId)
    if (post.length == 0) {
        post = await searchFollowlinksById(postId)
        postlink = 'followlinks'
    }

    if (post.length == 0) {
        return
    }

    if (accept) {
        post[0].tags = post[0].tags.map((tag) => {
            if (tag.tagId.toString() == profileId.toString()) {
                tag.accepted = accept
                tagFound = true
            }
            return tag
        })
    }

    if (!accept) {
        post[0].tags = post[0].tags.map((tag) => {
            if (tag.tagId.toString() != profileId.toString()) {
                return tag
            } else {
                tagFound = true
                return null
            }
        }).filter(x => !!x)
    }

    if (!tagFound) {
        return //Tag not found
    }

    switch (postlink) {
        case 'funlinks':
            return await updatePostFunlinks(post[0]._id, post[0])
            break;
        case 'followlinks':
            return await updatePostFollowlinks(post[0]._id, post[0])
            break;
        default: return
    }

    return
}