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

module.exports = async (masterId) => {
    let user = await getOneUser(masterId)

    let updateObjMaster = {}
    let updateObjChild = {}

    updateObjMaster.isSuspended = true
    updateObjMaster.isDeleted = false
    updateObjMaster.deleteDate = null

    updateObjChild.isSuspended = true
    updateObjChild.isDeleted = false

    //NOTE:- If you uncomment below switch case then also uncomment the switch case present in 'verifyOtp.js && loginWithEmail.js'

    // switch (user.type) {
    //     case 'brand': await updateStorelinks(user.profileStorelinks, updateObjChild)
    //         break;
    //     case 'agency': await updateCollablinks(user.profileCollablinks, updateObjChild)
    //         break;
    //     default: await updateProfileFamelinks(user.profileFamelinks, updateObjChild)
    //         break;
    // }

    // await updateProfileFunlinks(user.profileFunlinks, updateObjChild)
    // await updateProfileFollowlinks(user.profileFollowlinks, updateObjChild)
    // await updateProfileJoblinks(user.profileJoblinks, updateObjChild)

    return await updateUser(masterId, updateObjMaster)
}