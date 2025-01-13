const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const updateUserService = require("../../../services/v2/users/updateUser");
const getUserByUsernameService = require("../../../services/v2/users/getUserByUsername");
const { generateNumber } = require("../../../utils/random");
const appConfig = require("../../../../configs/app.config");
const getOneUserService = require("../../../services/v2/users/getOneUser");
const getUserProfileImages = require("../../../services/v2/users/getUserProfileImages");
const sendMessageService = require("../../../services/v2/chats/sendMessage");
const acceptIgnoreRequestService = require("../../../services/v2/chats/acceptIgnoreRequest");

module.exports = async (request) => {
  if (!request.user.isRegistered) {
    if (request.body.name == undefined) {
      request.body.name = " ";
    }
    if (
      [
        "famelinks",
        "fame!links",
        "fame@links",
        "fame#links",
        "fame$links",
        "fame%links",
        "fame^links",
        "fame&links",
        "fame*links",
        "fame)links",
        "fame(links",
        "fame_links",
        "fame-links",
        "fame=links",
        "fame+links",
        "fame1links",
        "fame2links",
        "fame3links",
        "fame4links",
        "fame5links",
        "fame6links",
        "fame7links",
        "fame8links",
        "fame9links",
        "fame0links",
        "fame,links",
        "fame<links",
        "fame.links",
        "fame>links",
        "fame?links",
        "fame/links",
        "fame'links",
        "fame;links",
        "fame:links",
        "fame[links",
        "fame{links",
        "fame]links",
        "fame}links",
        "fame|links",
        "fame\\links",
        "famelinkssupport",
        "famelinksupport",
        "famelinksofficial",
        "famelinkofficial",
      ].includes(request.body.name.toLowerCase()) ||
      request.body.name.toLowerCase().split("famelinks").length - 1
    ) {
      return serializeHttpResponse(400, {
        message: "Name is not available",
      });
    }

    if (request.body.username) {
      const user = await getUserByUsernameService(request.body.username);
      if (user) {
        request.body.username = `${request.body.username.replace(
          " ",
          "_"
        )}_${parseInt(Date.now() / (1000 * 60))}`.toLowerCase();
      }
    }

    if (!request.body.username) {
      let temp = request.body.name ? request.body.name : " ";
      request.body.username = `${temp.replace(" ", "_")}_${parseInt(
        Date.now() / (1000 * 60)
      )}`.toLowerCase();
    }

    // const user = await getUserByUsernameService(request.body.username);
    // if (user) {
    //     console.log('Username already exist | Corner case');
    //     return serializeHttpResponse(500, {
    //         message: 'Username not available',
    //         result: {
    //             isAvailable: false
    //         }
    //     });
    // }

    request.body.referralCode = request.body.username;
    request.body.isRegistered = true;
    request.body.fameCoins = 20;
    request.body.isFirstLogin = true;
  }

  // if (request.body.avatarImage && request.body.avatarImage != null && request.body.avatarImage != "") {
  //     request.body.profileImage = request.body.avatarImage
  // }

  if (request.user.isFirstLogin) {
    request.body.isFirstLogin = false;
  }

  if (request.body.dob) {
    let ageGroup = Math.abs(
      new Date(Date.now() - request.body.dob.getTime()).getUTCFullYear() - 1970
    );

    if (0 < ageGroup && ageGroup <= 4) {
      request.body.ageGroup = "groupA";
    } else if (4 < ageGroup && ageGroup <= 12) {
      request.body.ageGroup = "groupB";
    } else if (12 < ageGroup && ageGroup <= 18) {
      request.body.ageGroup = "groupC";
    } else if (18 < ageGroup && ageGroup <= 28) {
      request.body.ageGroup = "groupD";
    } else if (28 < ageGroup && ageGroup <= 40) {
      request.body.ageGroup = "groupE";
    } else if (40 < ageGroup && ageGroup <= 50) {
      request.body.ageGroup = "groupF";
    } else if (50 < ageGroup && ageGroup <= 60) {
      request.body.ageGroup = "groupG";
    } else if (60 < ageGroup) {
      request.body.ageGroup = "groupH";
    } else {
      request.body.ageGroup = "groupD";
    }

  }

  await updateUserService(request.user._id, request.body, request.files);

  if (request.user.isRegistered === false) {
    setTimeout(async () => {
      try {
        const famelinksSupportUser = await getOneUserService(
          appConfig.famelinks.supportId,
          request.user._id
        );
        if (famelinksSupportUser) {
          const message = await sendMessageService(
            appConfig.famelinks.supportId,
            famelinksSupportUser.profileImage,
            famelinksSupportUser.name,
            request.user._id,
            request.user.pushToken,
            `Hi ${request.body.name}, Welcome to FameLinks App. World's First Digital Beauty Contest and the First Fashion Job Portal. You can reach us out on this channel in case you face any issues, provide feedbacks and improvement suggestions. Once again, Thank you and hope you will enjoy our App.FameLinks Support.`,
            null,
            famelinksSupportUser.type
          );
          await acceptIgnoreRequestService(message.chatId, true, request.user._id);
        }
      } catch (e) {
        console.log(e);
      }
    }, 0);
  }

  //Call Get me Service and send it in the response
  const result = await getOneUserService(request.user._id);

  return serializeHttpResponse(200, {
    message: "User Updated",
    result,
  });
};
