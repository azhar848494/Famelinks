const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getTalentService = require("../../../services/v2/joblinks/getTalents");
const getJobsService = require("../../../services/v2/joblinks/getJobs");
const getOpenJobs = require("../../../services/v2/joblinks/getOpenJobs.js");
const getClosedJobs = require("../../../services/v2/joblinks/getClosedJobs");

module.exports = async (request) => {
  let joblinksId = request.user._id;
  let userType = request.user.type;
  let page = request.query.page;
  if (userType == "brand") {
    let ExploreTalents = [];
    let openJobsFaces = [];
    let openJobsCrew = [];
    let YourJobs = [];
    let closedJobsFaces = [];
    let closedJobsCrew = [];
    let PastJobs = [];

    ExploreTalents = await getTalentService(page, request.user._id, joblinksId);
  //Pending => Need to decide acc. to algo
    openJobsFaces = await getOpenJobs(joblinksId, page, "faces");
    openJobsCrew = await getOpenJobs(joblinksId, page, "crew");
    YourJobs = openJobsFaces.concat(openJobsCrew);
    closedJobsFaces = await getClosedJobs(joblinksId, page, "faces");
    closedJobsCrew = await getClosedJobs(joblinksId, page, "crew");
    PastJobs = closedJobsFaces.concat(closedJobsCrew);

    let result = {};

    result.ExploreTalents = ExploreTalents;
    result.YourJobs = YourJobs;
    result.PastJobs = PastJobs;

    return serializeHttpResponse(200, {
      message: "Feed page fetched",
      result,
    });
  }

  if (userType == "agency" || userType == "individual") {
    let ExploreTalents = [];
    let ExploreJobs = []; //agent looking for crew jobs
    let openJobsFaces = []; //created by agent himself
    let openJobsCrew = []; //created by agent himself
    let YourJobs = []; //created by agent himself
    let closedJobsFaces = []; //created by agent himself
    let closedJobsCrew = []; //created by agent himself
    let PastJobs = []; //created by agent himself

    ExploreTalents = await getTalentService(page, request.user._id, joblinksId); 
    // console.log(ExploreTalents)//Pending => Need to decide acc. to algo
    ExploreJobs = await getJobsService(joblinksId, userType, page);
    openJobsFaces = await getOpenJobs(joblinksId, page, "faces");
    openJobsCrew = await getOpenJobs(joblinksId, page, "crew");
    YourJobs = openJobsFaces.concat(openJobsCrew);
    closedJobsFaces = await getClosedJobs(joblinksId, page, "faces");
    closedJobsCrew = await getClosedJobs(joblinksId, page, "crew");
    PastJobs = closedJobsFaces.concat(closedJobsCrew);

    let result = {};

    result.ExploreTalents = ExploreTalents;
    result.ExploreJobs = ExploreJobs;
    result.YourJobs = YourJobs;
    result.PastJobs = PastJobs;

    return serializeHttpResponse(200, {
      message: "Feed page fetched",
      result,
    });
  }

  let result = await getJobsService(joblinksId, userType, page);

  return serializeHttpResponse(200, {
    message: "Feed page fetched",
    result,
  });
};
