const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const updateUserService = require('../../../services/v2/users/updateUser');
const getUserByUsernameService = require('../../../services/v2/users/getUserByUsername');

module.exports = async (request) => {
    if (request.body.name && ([
        'famelinks',
        'fame!links',
        'fame@links',
        'fame#links',
        'fame$links',
        'fame%links',
        'fame^links',
        'fame&links',
        'fame*links',
        'fame)links',
        'fame(links',
        'fame_links',
        'fame-links',
        'fame=links',
        'fame+links',
        'fame1links',
        'fame2links',
        'fame3links',
        'fame4links',
        'fame5links',
        'fame6links',
        'fame7links',
        'fame8links',
        'fame9links',
        'fame0links',
        'fame,links',
        'fame<links',
        'fame.links',
        'fame>links',
        'fame?links',
        'fame/links',
        "fame'links",
        'fame;links',
        'fame:links',
        'fame[links',
        'fame{links',
        'fame]links',
        'fame}links',
        'fame|links',
        "fame\\links",
    ].includes(request.body.name.toLowerCase()) || (request.body.name.toLowerCase().split('famelinks').length - 1))) {
        return serializeHttpResponse(400, {
            message: 'Name is not available'
        });
    }

    if (request.body.username) {
        const user = await getUserByUsernameService(request.body.username);
        if (
            (user && request.user.username !== user.username && request.body.username === user.username) ||
            ([
                'famelinks',
                'fame!links',
                'fame@links',
                'fame#links',
                'fame$links',
                'fame%links',
                'fame^links',
                'fame&links',
                'fame*links',
                'fame)links',
                'fame(links',
                'fame_links',
                'fame-links',
                'fame=links',
                'fame+links',
                'fame1links',
                'fame2links',
                'fame3links',
                'fame4links',
                'fame5links',
                'fame6links',
                'fame7links',
                'fame8links',
                'fame9links',
                'fame0links',
                'fame,links',
                'fame<links',
                'fame.links',
                'fame>links',
                'fame?links',
                'fame/links',
                "fame'links",
                'fame;links',
                'fame:links',
                'fame[links',
                'fame{links',
                'fame]links',
                'fame}links',
                'fame|links',
                "fame\\links",
                'famelinkssupport',
                'famelinksupport',
                'famelinksofficial',
                'famelinkofficial'
            ].includes(request.body.username.toLowerCase()))
        ) {
            return serializeHttpResponse(200, {
                message: 'Username already exists',
                result: {
                    isAvailable: false
                }
            });
        }
        request.body.referralCode = request.body.username;
    }

    if (request.body.websiteUrl) {
        if (request.user.type === 'agency') {
            request.body.agencyWebsite = request.body.websiteUrl;
        } else if (request.user.type === 'brand') {
            request.body.brandWebsite = request.body.websiteUrl;
        }
        delete request.body.websiteUrl;
    }
    await updateUserService(request.user._id, request.body, request.files);
    return serializeHttpResponse(200, {
        message: 'User Updated'
    });
};