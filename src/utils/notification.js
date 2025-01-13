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
        body: `${source || ""} ${action || ""} ${data || ""} ${
          notification.body || ""
        } ${targetName || ""}`,
      },
      inAppNotification: { source, data, body, action },
    };
  }
  return {
    pushNotification: {
      title: notification.title,
      body: `${source || ""} ${action || ""} ${data || ""} ${
        notification.body || ""
      } ${targetName || ""}`,
    },
    inAppNotification: { source, data, body, action },
  };
};

exports.sendPushNotifications = async ({ title, body }, pushToken, meta) => {
  try {
    const payload = {
            notification: { title, body },
            data: {
                body: JSON.stringify(meta)
            }
        };
        if (payload.notification.title === 'FameCoin gifted' || payload.notification.title === 'FameCoin received'){
            return;
        }

    return await firebaseAdmin.messaging().sendToDevice(pushToken, payload);
  } catch (error) {
    console.log(error);
  }
};
