exports.getWinner = (item) => {
    return [
        {
            _id: item.winner[0]._id,
            name: item.winner[0].name,
            type: item.winner[0].type,
            country: item.winner[0].country,
            profileImage: item.winner[0].profileImage,
            likes1Count: item.winner[0].likes1Count,
            likes2Count: item.winner[0].likes2Count,
            likesCount: item.winner[0].likesCount,
            totalHearts:
                2 * item.winner[0].likes2Count + item.winner[0].likes1Count,
            Position: 1,
            postId: item.winner[0].postId
        },
        {
            _id: item.winner[1]._id,
            name: item.winner[1].name,
            type: item.winner[1].type,
            country: item.winner[1].country,
            profileImage: item.winner[1].profileImage,
            likes1Count: item.winner[1].likes1Count,
            likes2Count: item.winner[1].likes2Count,
            likesCount: item.winner[1].likesCount,
            totalHearts:
                2 * item.winner[1].likes2Count + item.winner[1].likes1Count,
            Position: 2,
            postId: item.winner[1].postId
        },
        {
            _id: item.winner[2]._id,
            name: item.winner[2].name,
            type: item.winner[2].type,
            country: item.winner[2].country,
            profileImage: item.winner[2].profileImage,
            likes1Count: item.winner[2].likes1Count,
            likes2Count: item.winner[2].likes2Count,
            likesCount: item.winner[2].likesCount,
            totalHearts:
                2 * item.winner[2].likes2Count + item.winner[2].likes1Count,
            Position: 3,
            postId: item.winner[2].postId
        },
        {
            _id: item.winner[3]._id,
            name: item.winner[3].name,
            type: item.winner[3].type,
            country: item.winner[3].country,
            profileImage: item.winner[3].profileImage,
            likes1Count: item.winner[3].likes1Count,
            likes2Count: item.winner[3].likes2Count,
            likesCount: item.winner[3].likesCount,
            totalHearts:
                2 * item.winner[3].likes2Count + item.winner[3].likes1Count,
            Position: 4,
            postId: item.winner[3].postId
        },
        {
            _id: item.winner[4]._id,
            name: item.winner[4].name,
            type: item.winner[4].type,
            country: item.winner[4].country,
            profileImage: item.winner[4].profileImage,
            likes1Count: item.winner[4].likes1Count,
            likes2Count: item.winner[4].likes2Count,
            likesCount: item.winner[4].likesCount,
            totalHearts:
                2 * item.winner[4].likes2Count + item.winner[4].likes1Count,
            Position: 5,
            postId: item.winner[4].postId
        },
    ];
};
