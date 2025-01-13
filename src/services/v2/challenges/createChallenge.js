const { createChallenge } = require('../../../data-access/v2/challenges');

module.exports = ({ hashTag, type }) => {
    return createChallenge({
        name: hashTag,
        startDate: new Date().toISOString(),
        // endDate: new Date().toISOString(),
        type,
        for: ['male', 'female'],
        mediaPreference: ['video', 'photo'],
        hashTag: [ hashTag ]
    });
};