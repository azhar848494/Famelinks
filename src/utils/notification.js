const notificationConfig = require("../../configs/notifications.config");
const firebaseAdmin = require("firebase-admin");
const firebaseConfig = require("../../configs/firebase-adminsdk.json");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseConfig),
});

exports.generateNotification = ({ type, source, data, targetName }) => {
  const body = JSON.parse(JSON.stringify(notificationConfig[type].body));
  const action = JSON.parse(JSON.stringify(notificationConfig[type].action));
  const notification = notificationConfig[type];
  if (type === "sendFameCoin") {
    return {
      pushNotification: {
        title: notification.title,
        body: `${source || ""} ${action || ""} ${data || ""} ${notification.body || ""
          } ${targetName || ""}`,
      },
      inAppNotification: { source, data, body, action },
    };
  }
  return {
    pushNotification: {
      title: notification.title,
      body: `${source || ""} ${action || ""} ${data || ""} ${notification.body || ""
        } ${targetName || ""}`,
    },
    inAppNotification: { source, data, body, action },
  };
};

exports.sendPushNotifications = async ({ title, body }, pushToken, meta) => {
  try {
    if (title === 'FameCoin gifted' || title === 'FameCoin received') {
      return;
    }

    const message = {
      token: pushToken,
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

    // return await firebaseAdmin.messaging().sendToDevice(pushToken, payload);
    return await firebaseAdmin.messaging().send(message);
  } catch (error) {
    console.log(error);
  }
};
