const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const createfametrendz = require("../../../services/v3/fametrendzs/createfametrendz");
const {
  addPayments,
  addPaymentId,
} = require("../../../data-access/v3/fametrendzs");

module.exports = async (request) => {
  let payload = request.body;
  let selfUserId = request.user._id;

  
  payload.for = JSON.parse(payload.for);

  if (request.user.type == "individual") {
      return serializeHttpResponse(400, {
        message: "only brand or agency can create fametrendz",
      });
  }

  payload.sponsor = selfUserId;
  let result = await createfametrendz(payload);

  let payment = await addPayments(
    selfUserId,
    result._id,
    result.milestoneAggrement.budget,
    "fameTrendz",
    payload.paymentRef,
    payload.currency,
    payload.txType
  );

  if (payment){
    await addPaymentId(result._id, payment._id);
  }
    if (!result) {
      return serializeHttpResponse(500, {
        message: "Failed to create fametrendz",
      });
    }

 
  return serializeHttpResponse(200, {
    message: "fametrendz created successfuly",
    result,
  });
};
