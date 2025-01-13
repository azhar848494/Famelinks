const express = require('express');
const { getOneUser } = require("../../data-access/v2/users");
const InfoPopupDB = require("../../models/v2/infoPopup");

const router = express.Router();

router.get('/addInfoPopup', async (request, res) => {
  let jsonData = request.body;
  let data = {
    image: jsonData.image,
    video: jsonData.video,
    data: jsonData.data,
    states: jsonData.states,
    districts: jsonData.districts,
    countries: jsonData.countries,
    continents: jsonData.continents,
    ageGroups: jsonData.ageGroups,
    genders: jsonData.genders
  }
  return await InfoPopupDB.create(data)
});

router.get('/getInfoPopup', async (request, res) => {
  const user = await getOneUser(request.user._id);
  res.send({
    message: 'Info PopUp',
    success: true,
    // isFirstLogin: user.isFirstLogin, 
    showPopUp: false,// user.isFirstLogin ||,
    result: [
      {
        data: "This is test data for popup dialog",
        image:
          "https://famelinks.s3.ap-south-1.amazonaws.com/global/unsplash_HD2MMUEQ5MM4.png",
        video: "",
      },
      {
        data: "This is test data for popup dialog",
        image:
          "https://famelinks.s3.ap-south-1.amazonaws.com/global/608e6d65-bfae-41bd-b882-f2bc7ccf6888.jpg",
        video: "",
      },
      {
        data: "This is test data for popup dialog",
        image:
          "https://famelinks.s3.ap-south-1.amazonaws.com/global/unsplash_HD2MMUEQ5MM.png",
        video: "",
      },
      {
        data: "This is test data for popup dialog",
        image:
          "https://famelinks.s3.ap-south-1.amazonaws.com/global/unsplash_HD2MMUEQ5MM1.png",
        video: "",
      },
      {
        data: "This is test data for popup dialog",
        image:
          "https://famelinks.s3.ap-south-1.amazonaws.com/global/unsplash_HD2MMUEQ5MM3.png",
        video: "",
      },
    ]
  })
})

module.exports = router;