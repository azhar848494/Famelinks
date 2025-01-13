const SocketIOServer = require('socket.io');

const appConfig = require('../../../configs/app.config');
const { verify } = require('../../utils/jwt');
const getOneUserService = require('../../services/v2/users/getOneUser');
const updateUserService = require('../../services/v2/users/updateUser');
const { updateUser} = require("../../data-access/v2/users");
const sendMessageService = require('../../services/v3/chats/sendMessage');
const getGlobalSettingsService = require('../../services/v2/users/getGlobalSettings');
const Filter = require('bad-words');

module.exports = (server) => {
    const io = SocketIOServer(server);

    io.of('/').use(async (socket, next) => {
        const token = socket.handshake.headers.authorization;
        if (!token) {
            return next({
                message: 'Not Authorized',
                name: 'AuthenticationError'
            });
        }

        try {
            const decoded = verify(token, appConfig.jwt.secret);

            if (!decoded._id) {
                return next({
                    message: 'Invalid Token'
                });
            }

            const user = await getOneUserService(decoded._id);
            if (!user) {
                return next({
                    message: 'Invalid Token'
                });
            }
            const settings = await getGlobalSettingsService(decoded._id);
            socket.handshake.auth = {};
            socket.handshake.auth.user = user;
            socket.handshake.auth.user.settings = settings;
            return next();
        } catch (error) {
            return next({
                message: 'Not Authorized',
                name: 'AuthenticationError'
            });
        }
    });

    io.of('/').on('connection', (socket) => {
        const user = socket.handshake.auth.user;
        console.log('User Connected ', user.name, user._id);
        socket.join(user._id);

        socket.on('sendMessage', async (data) => {
            try {
                console.log('sendMessage ', data);
                const receiver = await getOneUserService(data.userId, user._id);
                const message = await sendMessageService(
                    user._id,
                    user.profileImage,
                    user.name,
                    data.userId,
                    receiver.pushToken,
                    new Filter().clean(data.body),
                    data.quote,
                    user.type,
                    data.jobId,
                    data.type
                );
                socket.to(data.userId).emit('receiveMessage', [message]);
            } catch (error) {
                console.log('socket message error', error);
            }
        });

        // TODO: this is static
        socket.on('popup', () => {
            console.log('popup dialog');
            socket.emit('popupDialoag', () => {
                return [
                    {
                        data: 'This is test data for popup dialog',
                        image: 'https://famelinks.s3.ap-south-1.amazonaws.com/global/Info+Popup.png',
                        video: ''
                    },
                    {
                        data: 'This is test data for popup dialog',
                        image: 'https://famelinks.s3.ap-south-1.amazonaws.com/global/608e6d65-bfae-41bd-b882-f2bc7ccf6888.jpg',
                        video: ''
                    },
                    {
                        data: 'This is test data for popup dialog',
                        image: 'https://famelinks.s3.ap-south-1.amazonaws.com/global/unsplash_HD2MMUEQ5MM.png',
                        video: ''
                    },
                    {
                        data: 'This is test data for popup dialog',
                        image: 'https://famelinks.s3.ap-south-1.amazonaws.com/global/unsplash_HD2MMUEQ5MM1.png',
                        video: ''
                    },
                    {
                        data: 'This is test data for popup dialog',
                        image: 'https://famelinks.s3.ap-south-1.amazonaws.com/global/unsplash_HD2MMUEQ5MM3.png',
                        video: ''
                    },
                    {
                        data: 'This is test data for popup dialog',
                        image: 'https://famelinks.s3.ap-south-1.amazonaws.com/global/unsplash_HD2MMUEQ5MM4.png',
                        video: ''
                    }]
            });
        });

        socket.on('checkUnread', async () => {
            console.log(user.isFirstLogin);
            if (user.isFirstLogin) {
                await updateUser(user._id, { isFirstLogin: false });
                socket.emit('popupDialoag', {
                    data: user.settings.welcomeText,
                    image: user.settings.welcomeImage,
                    video: user.settings.welcomeVideo
                });
            }
            console.log('checkUnread');
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected', socket.id);
        });
    });
};