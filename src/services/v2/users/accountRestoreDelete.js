const {
    getOneUser,
    updateUser,
    updateProfileFamelinks,
    updateProfileFollowlinks,
    updateProfileFunlinks,
    updateProfileJoblinks,
    updateStorelinks,
    updateCollablinks
} = require('../../../data-access/v2/users')

module.exports = async (masterId, action) => {
    let user = await getOneUser(masterId)

    let updateObjMaster = {}
    let updateObjChild = {}

    if (action == 'delete') {
        updateObjMaster.deleteDate = new Date()
        updateObjMaster.isDeleted = true
        updateObjChild.isDeleted = true
    }

    if (action == 'restore') {
        updateObjMaster.deleteDate = null
        updateObjMaster.isDeleted = false
        updateObjChild.isDeleted = false
    }

    switch (user.type) {
        case 'brand': await updateStorelinks(user.profileStorelinks, updateObjChild)
            break;
        case 'agency': await updateCollablinks(user.profileCollablinks, updateObjChild)
            break;
        default: await updateProfileFamelinks(user.profileFamelinks, updateObjChild)
            break;
    }

    await updateProfileFunlinks(user.profileFunlinks, updateObjChild)
    await updateProfileFollowlinks(user.profileFollowlinks, updateObjChild)
    await updateProfileJoblinks(user.profileJoblinks, updateObjChild)

    return await updateUser(masterId, updateObjMaster)
}