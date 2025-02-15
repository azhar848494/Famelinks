const express = require('express');

const router = express.Router();

const validator = require('../../validator/v2/joblinks');
const expressCallback = require('../../helpers/express-callback');
const requestValidatorCallback = require('../../helpers/request-validator-callback');

const {
  uploadGreetingVideo,
  addJobCategory,
  jobFaces,
  jobCrew,
  hireApplicant,
  shortlistApplicant,
  saveUnsaveTalent,
  profileFaces,
  profileCrew,
} = require('../../utils/fileUploadS3');

const addJobCategoryController = require('../../controllers/v2/joblinks/addJobCategory');
const createJobCrewController = require('../../controllers/v2/joblinks/createJobCrew');
const createJobFacesController = require('../../controllers/v2/joblinks/createJobFaces');
const applyJob = require('../../controllers/v2/joblinks/applyJob');
const withdrawJob = require('../../controllers/v2/joblinks/withdrawJob');
const updateJob = require('../../controllers/v2/joblinks/updateJob');
const getAllJobCategories = require('../../controllers/v2/joblinks/getAllJobCategories');
const saveUnsaveJob = require('../../controllers/v2/joblinks/saveUnsaveJob');
const updateProfileFaces = require('../../controllers/v2/joblinks/updateHiringProfileFaces');
const updateProfileCrew = require('../../controllers/v2/joblinks/updateHiringProfileCrew');
const getFeed = require('../../controllers/v2/joblinks/getFeed');
const userExplore = require('../../controllers/v2/joblinks/userExplore');
const brandAgency = require('../../controllers/v2/joblinks/brandAgencyExplore');
const hire = require('../../controllers/v2/joblinks/hire');
const shortlist = require('../../controllers/v2/joblinks/shortlist');
const saveTalent = require('../../controllers/v2/joblinks/saveUnsaveTalent');
const greetVideo = require('../../controllers/v2/joblinks/greetVideo');
const getHiringProfile = require('../../controllers/v2/joblinks/getHiringProfile');
const getApplicants = require('../../controllers/v2/joblinks/getApplicants');
const searchJobs = require('../../controllers/v2/joblinks/searchJobs');
const inviteForJob = require('../../controllers/v2/joblinks/inviteForJob');
const getJobDetails = require('../../controllers/v2/joblinks/getJobDetails');
const closeJob = require('../../controllers/v2/joblinks/closeJob');
const deleteJob = require('../../controllers/v2/joblinks/deleteJob');
const getShortlistedApplicant = require('../../controllers/v2/joblinks/getShortlistedApplicant');
const getSortedApplicants = require('../../controllers/v2/joblinks/getSortedApplicant');
const getApplicantBySearch = require('../../controllers/v2/joblinks/getApplicantBySearch');
const createHiringProfileCrew = require('../../controllers/v2/joblinks/createHiringProfileCrew');
const createHiringProfileFaces = require('../../controllers/v2/joblinks/createHiringProfileFaces');
const getAllJobs = require('../../controllers/v2/joblinks/getAllJobs');
const getAppliedJobs = require('../../controllers/v2/joblinks/getAppliedJobs');
const getShortlistedJobs = require('../../controllers/v2/joblinks/getShortlistedJobs');
const getHiredJobs = require('../../controllers/v2/joblinks/getHiredJobs');
const getSavedJobs = require('../../controllers/v2/joblinks/getSavedJobs');
const getSavedTalents = require('../../controllers/v2/joblinks/getSavedTalents');
const getJobInvites = require('../../controllers/v2/joblinks/getJobInvites');
const acceptRejectJobInvite = require('../../controllers/v2/joblinks/acceptRejectJobInvite');
const getOpenJobs = require('../../controllers/v2/joblinks/getOpenJobs');
const addcategorySuggestion = require('../../controllers/v2/joblinks/addcategorySuggestion');
const getExploreTalents = require('../../controllers/v2/joblinks/getExploreTalents');
const getPastJobs = require('../../controllers/v2/joblinks/getPastJobs');
const getYourJobs = require('../../controllers/v2/joblinks/getYourJobs');
const createdJobs = require('../../controllers/v2/joblinks/getJobs');
const getExploreJobs = require('../../controllers/v2/joblinks/getExploreJobs')

router.post('/addJobCategory',
  addJobCategory,
  requestValidatorCallback(validator.addJobCategory),
  expressCallback(addJobCategoryController)
);
router.post('/createJob/faces',
  jobFaces,
  requestValidatorCallback(validator.createJob),
  expressCallback(createJobFacesController)
);
router.post('/createJob/crew',
  jobCrew,
  requestValidatorCallback(validator.createJob),
  expressCallback(createJobCrewController)
);
router.post('/applyJob/:jobId',
  requestValidatorCallback(validator.applyJob),
  expressCallback(applyJob)
);
router.post('/withdrawJob/:jobId',
  requestValidatorCallback(validator.withdrawJob),
  expressCallback(withdrawJob)
);
router.post('/saveUnsaveJob/:jobId',
  requestValidatorCallback(validator.saveUnsaveJob),
  expressCallback(saveUnsaveJob)
);
router.post('/hire',
  hireApplicant,
  requestValidatorCallback(validator.hire),
  expressCallback(hire)
);
router.post('/shortlist',
  shortlistApplicant,
  requestValidatorCallback(validator.shortlist),
  expressCallback(shortlist)
);

router.get('/exploreTalents',
  requestValidatorCallback(validator.getExploreTalents),
  expressCallback(getExploreTalents)
);

router.post('/saveTalent',
  requestValidatorCallback(validator.saveTalent),
  expressCallback(saveTalent)
);

router.get('/savedTalents',
  requestValidatorCallback(validator.getSavedTalents),
  expressCallback(getSavedTalents)
);

router.post('/greeting',
  uploadGreetingVideo,
  requestValidatorCallback(validator.greeting),
  expressCallback(greetVideo)
);
router.post('/invitation/:action/:userId',
  requestValidatorCallback(validator.invitation),
  expressCallback(inviteForJob)
);

router.delete('/:jobId',
  requestValidatorCallback(validator.deleteJob),
  expressCallback(deleteJob)
);

router.post('/closeJob/:jobId',
  requestValidatorCallback(validator.closeJob),
  expressCallback(closeJob)
);
router.post('/createProfile/faces',
  profileFaces,
  requestValidatorCallback(validator.createProfileFaces),
  expressCallback(createHiringProfileFaces)
);
router.post('/createProfile/crew',
  profileCrew,
  requestValidatorCallback(validator.createProfileCrew),
  expressCallback(createHiringProfileCrew)
);
router.post('/jobInvite/:action',
  requestValidatorCallback(validator.acceptRejectInvite),
  expressCallback(acceptRejectJobInvite)
);
router.post('/addCategorySuggestion',
  requestValidatorCallback(validator.addCategorySuggestion),
  expressCallback(addcategorySuggestion)
);
router.get('/getAllJobCategories/:jobType',
  requestValidatorCallback(validator.getAllJobCategories),
  expressCallback(getAllJobCategories)
);
router.get('/feed',
  requestValidatorCallback(validator.feed),
  expressCallback(getFeed)
);
router.get('/explore/user',
  requestValidatorCallback(validator.userExplore),
  expressCallback(userExplore)
);
router.get('/explore/brandAgency',
  requestValidatorCallback(validator.brandAgencyExplore),
  expressCallback(brandAgency)
);
router.get('/profile/faces', expressCallback(getHiringProfile, 'faces'));
router.get('/profile/crew', expressCallback(getHiringProfile, 'crew'));
router.get('/applicants/:jobId',
  requestValidatorCallback(validator.getApplicants),
  expressCallback(getApplicants)
);
router.get('/searchJobs/:title/',
  requestValidatorCallback(validator.searchJobs),
  expressCallback(searchJobs)
);
router.get('/getJobDetails/:jobId',
  requestValidatorCallback(validator.getJobDetails),
  expressCallback(getJobDetails)
);
router.get('/getshortlistedApplicant/:jobId',
  requestValidatorCallback(validator.getshortlistedApplicant),
  expressCallback(getShortlistedApplicant)
);
router.get('/getSortedApplicant/:sort/:jobId',
  requestValidatorCallback(validator.getSortedApplicant),
  expressCallback(getSortedApplicants)
);
router.get('/getApplicantBySearch/:jobId',
  requestValidatorCallback(validator.getApplicantsBySearch),
  expressCallback(getApplicantBySearch)
);

router.get('/jobs/:type',
  requestValidatorCallback(validator.getJobs),
  expressCallback(createdJobs)
);

router.get('/allJobs',
  requestValidatorCallback(validator.getAllJobs),
  expressCallback(getAllJobs)
);

router.get('/appliedJobs',
  requestValidatorCallback(validator.getAppliedJobs),
  expressCallback(getAppliedJobs)
);
router.get('/shortlistedJobs',
  requestValidatorCallback(validator.getShortlistedJobs),
  expressCallback(getShortlistedJobs)
);
router.get('/hiredJobs',
  requestValidatorCallback(validator.getHiredJobs),
  expressCallback(getHiredJobs)
);
router.get('/savedJobs',
  requestValidatorCallback(validator.getSavedJobs),
  expressCallback(getSavedJobs)
);

router.get('/jobInvites',
  requestValidatorCallback(validator.getJobInvites),
  expressCallback(getJobInvites)
);
router.get('/openJobs',
  requestValidatorCallback(validator.getOpenJobs),
  expressCallback(getOpenJobs)
);

router.get('/pastJobs',
  requestValidatorCallback(validator.getPastJobs),
  expressCallback(getPastJobs)
);

router.get('/YourJobs',
  requestValidatorCallback(validator.getYourJobs),
  expressCallback(getYourJobs)
);

router.get('/exploreJobs',
  requestValidatorCallback(validator.getExploreJobs),
  expressCallback(getExploreJobs)
);

router.patch('/updateJob/faces/:jobId',
  jobFaces,
  requestValidatorCallback(validator.updateJobFaces),
  expressCallback(updateJob)
);
router.patch('/updateJob/crew/:jobId',
  jobCrew,
  requestValidatorCallback(validator.updateJobCrew),
  expressCallback(updateJob)
);
router.patch('/profile/faces',
  profileFaces,
  requestValidatorCallback(validator.updateProfileFaces),
  expressCallback(updateProfileFaces)
);
router.patch('/profile/crew',
  profileCrew,
  requestValidatorCallback(validator.updateProfileCrew),
  expressCallback(updateProfileCrew)
);

module.exports = router;
