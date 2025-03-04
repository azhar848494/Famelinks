module.exports = (data) => {
    return [
        {
            $lookup: {
                from: 'followers',
                let: { value: data.followeeId },
                pipeline: [
                    {
                        $match: {
                            type: 'user',
                            $expr: {
                                $and: [
                                    { $eq: ['$followeeId', '$$value'] },
                                    { $eq: ['$followerId', data.userId] },
                                ],
                            },
                        },
                    },
                    { $project: { _id: 0, acceptedDate: 1 } },
                ],
                as: 'followStatus',
            },
        },
        { $addFields: { followStatus: { $first: '$followStatus' } } },
        {
            $addFields: {
                followStatus: {
                    $cond: {
                        if: { $ne: [data.followeeId, data.userId] },
                        then: {
                            $cond: {
                                if: { $ne: [{ $type: '$followStatus' }, 'missing'] },
                                then: {
                                    $cond: {
                                        if: { $ne: ['$followStatus.acceptedDate', null] },
                                        then: 'Following',
                                        else: 'Requested'
                                    },
                                },
                                else: 'Follow'
                            },
                        },
                        else: null
                    },
                },
            },
        },
    ]
};