const admin = require('firebase-admin');
const serviceAccount = require("../../configs/firebase-adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const registrationTokens = [
    'dAWis5e0SIGESbGG9z9X9g:APA91bES2kSD2JWfRSutqNnpXuJR2jI-hlbXnXW0RVR4_u5Pc_XFlJksD699fIsVQIP-Nryj38cZbL5myXlotsH2u3d9pZ6WKsGv72t_XhsDzHFdMoq8ur0',
    'eW--fjbgQ6GYm4MFDO0HBa:APA91bGd5MvHcJXdwMeLh3skikzmSL-Ar8ly8iORcR6iN2qhDhN0O816YGokNNZoUsqp8NMCOscDXiOTbfYTVWBy_dcPv0uquxGOSwZrF8b1hPwXAN6IWPM',
];

const payload = {
    notification: {
        title: 'New Alert!',
        body: 'You have a new message.',
    },
    data: {
        customKey: 'customValue',
    },
};

const options = {
    priority: 'high',
    timeToLive: 60 * 60, // 1 hour in seconds
};

admin
    .messaging()
    .sendToDevice(registrationTokens, payload, options)
    .then((response) => {
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.error('Error sending message:', error);
        if (error.errorInfo) {
            console.error('Error Info:', error.errorInfo);
        }
        if (error.code) {
            console.error('Error Code:', error.code);
        }
        if (error.stack) {
            console.error('Error Stack:', error.stack);
        }
    });
