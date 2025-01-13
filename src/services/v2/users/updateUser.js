const { updateUser, getOneUser } = require("../../../data-access/v2/users");
const { createProfileFamelinks } = require("../../../data-access/v2/users");
const { createProfileFollowlinks } = require("../../../data-access/v2/users");
const { createProfileFunlinks } = require("../../../data-access/v2/users");
const { createStorelinks } = require("../../../data-access/v2/users");
const { createCollablinks } = require("../../../data-access/v2/users");
const { createHiringProfile } = require("../../../data-access/v2/users");
const { createProfileJoblinks } = require("../../../data-access/v2/users");
const { updateProfileJoblinks } = require("../../../data-access/v2/users");
const { deleteProfileFamelinks } = require("../../../data-access/v2/users");
const { deleteProfileStorelinks } = require("../../../data-access/v2/users");
const { deleteProfileCollablinks } = require("../../../data-access/v2/users");

module.exports = async (userId, payload, files) => {
  let brand = {},
    agency = {},
    result;
  
  if (payload.brandWebsite) {
    brand.websiteUrl = payload.brandWebsite;
    delete payload.brandWebsite;
  }
  if (payload.agencyWebsite) {
    agency.websiteUrl = payload.agencyWebsite;
    delete payload.agencyWebsite;
  }

  if (files) {
    if (files.profileImage) {
      payload.profileImage = files.profileImage;
    }
    if (files.brandDoc) {
      brand.verificationDoc = files.brandDoc;
      payload.verificationStatus = "Submitted";
    }
    if (files.agencyDoc) {
      agency.verificationDoc = files.agencyDoc;
      payload.verificationStatus = "Submitted";
    }
    if (files.verificationDoc) {
      payload.verificationDoc = files.verificationDoc;
      payload.verificationStatus = "Submitted";
    }
  }
  if (Object.keys(brand).length) {
    payload.brand = brand;
  }
  if (Object.keys(agency).length) {
    payload.agency = agency;
  }
  
  return updateUser(userId, payload);
};
