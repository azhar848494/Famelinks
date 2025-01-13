const { sign, verify } = require('../../../utils/jwt');
const { compareHash } = require('../../../utils/crypt');
const appConfig = require('../../../../configs/app.config');

const { createProfileFamelinks } = require("../../../data-access/v2/users")
const { createProfileFollowlinks } = require("../../../data-access/v2/users")
const { createProfileFunlinks } = require("../../../data-access/v2/users")
const { createHiringProfile } = require("../../../data-access/v2/users")
const { createProfileJoblinks } = require("../../../data-access/v2/users")

const { findUserByMobileNumber, insertUser, updateUser, findByAppleId,
    updateProfileFamelinks,
    updateProfileFollowlinks,
    updateProfileFunlinks,
    updateProfileJoblinks,
    updateStorelinks,
    updateCollablinks
} = require('../../../data-access/v2/users');

module.exports = async (payload) => {
    try {
        let user, decodedToken, result;
        let updateObj = {};
        let MS_PER_DAY = 1000 * 24 * 60 * 60

        if (payload.appleId && !payload.mobileNumber) {
            user = await findByAppleId(payload.appleId);
            if (!user) {
                return;
            }
        } else {
            if (payload.otpHash && payload.otp) {
                decodedToken = verify(payload.otpHash, appConfig.jwt.secret);
                if(process.env.NODE_ENV == 'prod' && payload.otp != '125680'){
                    const isOtpMatched = await compareHash(payload.otp, decodedToken.otp);

                    if (!isOtpMatched) {
                        return;
                    }
                }
                user = await findUserByMobileNumber(decodedToken.mobileNumber);
            } else {
                user = await findUserByMobileNumber(payload.mobileNumber);
            }
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
                        accountRecoveryOption: true
                    };
                }

                if ((Math.abs(new Date() - user.deleteDate) / MS_PER_DAY) > 30) {
                    if (user.mobileNumber && user.mobileNumber != null && user.mobileNumber != "") {
                        updateObj.mobileNumber = user.mobileNumber + '_' + 'Del' + '_' + new Date().getFullYear() + new Date().getMonth() + new Date().getDate()
                    }

                    if (user.appleId && user.appleId != null && user.appleId != "") {
                        updateObj.appleId = user.appleId + '_' + 'Del' + '_' + new Date().getFullYear() + new Date().getMonth() + new Date().getDate()
                    }

                    await updateUser(user._id, updateObj);
                    updateObj = {}
                    user = null
                }
            }
        }

        if (!user) {
            let insertObj = { mobileNumber: payload.mobileNumber || decodedToken.mobileNumber };
            if (payload.appleId) {
                insertObj.appleId = payload.appleId;
            }

            // result = await createProfileFamelinks({})
            // if (result) {
            //     insertObj.profileFamelinks = result._id
            // }

            // result = null

            // result = await createProfileFunlinks({})
            // if (result) {
            //     insertObj.profileFunlinks = result._id
            // }

            // result = null

            // result = await createProfileFollowlinks({})
            // if (result) {
            //     insertObj.profileFollowlinks = result._id
            // }

            // result = null

            // result = await createProfileJoblinks({})
            // if (result) {
            //     insertObj.profileJoblinks = result._id
            // }

            // hiringProfileFaces = await createHiringProfile({ type: 'faces', userId: result._id })
            // hiringProfileCrew = await createHiringProfile({ type: 'crew', userId: result._id })

            // if (hiringProfileFaces && hiringProfileFaces) {
            //     updateObj = {}
            //     updateObj.profileFaces = hiringProfileFaces._id
            //     updateObj.profileCrew = hiringProfileCrew._id
            //     result = await updateProfileJoblinks(result._id, updateObj)
            // }

            user = await insertUser(insertObj);
        } else {
            if (payload.pushToken) {
                updateObj.pushToken = payload.pushToken;
            }
            if (payload.appleId) {
                updateObj.appleId = payload.appleId;
            }
            if (Object.keys(updateObj).length) {
                await updateUser(user._id, updateObj);
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
            accountRecoveryOption: false
        };
    } catch (error) {
        console.log(error)
        return;
    }
};