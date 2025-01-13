const {fameCoin, updateUserCoin} = require("../../../data-access/v2/users");

module.exports = async(toUserId, fameCoins,fromUserId) => {
    await updateUserCoin(toUserId, fameCoins);
    await updateUserCoin(fromUserId, -fameCoins);
    return fameCoin(toUserId, fameCoins, fromUserId);
};