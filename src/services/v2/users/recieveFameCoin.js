const { recieveFameCoin, updateUserCoin } = require("../../../data-access/v2/users");

module.exports = async (type, toUserId, coins) => {
    let fameCoins;
    if (type === 'ads')
        fameCoins = 1;
    if (type === 'performance')
        fameCoins =  2;
    if (type === 'redeem')
        fameCoins =  7;
    if (type === 'gifted')
        fameCoins = coins;
    await updateUserCoin(toUserId, fameCoins);
    return recieveFameCoin(type, toUserId, fameCoins);
};
