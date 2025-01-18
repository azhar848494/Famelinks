const { sign } = require('../../../utils/jwt');
const appConfig = require('../../../../configs/app.config');

const { insertUser, findUserByEmail, updateUser, findByAppleId } = require('../../../data-access/v2/users');

const { createProfileFamelinks } = require("../../../data-access/v2/users")
const { createProfileFollowlinks } = require("../../../data-access/v2/users")
const { createProfileFunlinks } = require("../../../data-access/v2/users")
const { createHiringProfile } = require("../../../data-access/v2/users")
const { createProfileJoblinks } = require("../../../data-access/v2/users")
const { updateProfileJoblinks } = require("../../../data-access/v2/users")
const { updateProfileFamelinks,
    updateProfileFollowlinks,
    updateProfileFunlinks,
    updateStorelinks,
    updateCollablinks
} = require("../../../data-access/v2/users")

module.exports = async (payload) => {
    let isWalkthrough = false;
    try {
        let user, result;
        let updateObj = {};
        let MS_PER_DAY = 1000 * 24 * 60 * 60

        if (payload.email) {
            user = await findUserByEmail(payload.email);

            if (user && user.isSuspended) {
                updateObj.isSuspended = false     
            }

            if (user) {
                if (user.deleteDate != null) {

                    if ((Math.abs(new Date() - user.deleteDate) / MS_PER_DAY) <= 30) {
                        const token = sign({
                            _id: user._id,
                        }, appConfig.jwt.secret, {
                            expiresIn: appConfig.jwt.expiryTimeInSeconds
                        });

                        return {
                            token,
                            _id: user._id,
                            email: user.email || null,
                            accountRecoveryOption: true
                        };
                    }

                    if ((Math.abs(new Date() - user.deleteDate) / MS_PER_DAY) > 30) {
                        updateObj = {}

                        if (user.email && user.email != null && user.email != "") {
                            updateObj.email = user.email + '_' + 'Del' + '_' + new Date().getFullYear() + new Date().getMonth() + new Date().getDate()
                        }

                        await updateUser(user._id, updateObj);
                        updateObj = {}
                        user = null
                    }
                }
            }

            if (!user) {
                isWalkthrough = true;
                let insertObj = { email: payload.email };

                if (payload.appleId) {
                    insertObj.appleId = payload.appleId;
                }
                user = await insertUser(insertObj);

            } else {
                updateObj = {}
                if (payload.appleId) {
                    updateObj.appleId = payload.appleId;
                }
                if (payload.pushToken) {
                    updateObj.pushToken = payload.pushToken;
                }
                if (Object.keys(updateObj).length) {
                    await updateUser(user._id, { pushToken: payload.pushToken });
                }
            }
        } else {
            user = await findByAppleId(payload.appleId);
            if (!user) {
                return;
            }

            if (user && user.isSuspended) {
                updateObj.isSuspended = false

                //NOTE:- If you uncomment below switch case then also uncomment the switch case present in 'accountSuspend.js'

                // switch (user.type) {
                //     case 'brand': await updateStorelinks(user.profileStorelinks, updateObj)
                //         break;
                //     case 'agency': await updateCollablinks(user.profileCollablinks, updateObj)
                //         break;
                //     default: await updateProfileFamelinks(user.profileFamelinks, updateObj)
                //         break;
                // }

                // await updateProfileFunlinks(user.profileFunlinks, updateObj)
                // await updateProfileFollowlinks(user.profileFollowlinks, updateObj)
                // await updateProfileJoblinks(user.profileJoblinks, updateObj)        
            }

            if (user) {
                if (user.deleteDate != null) {

                    if ((Math.abs(new Date() - user.deleteDate) / MS_PER_DAY) <= 30) {
                        const token = sign({
                            _id: user._id,
                        }, appConfig.jwt.secret, {
                            expiresIn: appConfig.jwt.expiryTimeInSeconds
                        });

                        return {
                            token,
                            _id: user._id,
                            email: user.email || null,
                            accountRecoveryOption: true
                        };
                    }

                    if ((Math.abs(new Date() - user.deleteDate) / MS_PER_DAY) > 30) {
                        updateObj = {}

                        if (user.appleId && user.appleId != null && user.appleId != "") {
                            updateObj.appleId = user.appleId + '_' + 'Del' + '_' + new Date().getFullYear() + new Date().getMonth() + new Date().getDate()
                        }

                        await updateUser(user._id, updateObj);
                        updateObj = {}
                        user = null
                    }
                }
            }
        }

        const token = sign({
            _id: user._id,
        }, appConfig.jwt.secret, {
            expiresIn: appConfig.jwt.expiryTimeInSeconds
        });

        return {
            token,
            _id: user._id,
            email: user.email || null,
            accountRecoveryOption: false,
            isWalkthrough: isWalkthrough,
        };
    } catch (error) {
        return;
    }
};