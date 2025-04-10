const admin = require('firebase-admin');
const serviceAccount = require("../../configs/firebase-adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = async (fcmToken, title, body) => {
    const message = {
        token: fcmToken,
        notification: {
            title: title,
            body: body,
        },
        android: {
            priority: "high",
        },
        apns: {
            payload: {
                aps: {
                    sound: "default",
                },
            },
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

sendPushNotification(
    "ezj26_TwSh62gOgXdFr19V:APA91bFFnJ3hdOSfmDavD5vahUjWpb6L14ZRfFbuBG0lcuYHGpPy-LzcxPWI8u7gUqWPDfvVWNiP8JJNlJ4Vk4haCCWR_ZZfSmWQ5YwMPsj3I50uGnQGvhQ",
    "Hello from Node!",
    "This is a push notification"
);
