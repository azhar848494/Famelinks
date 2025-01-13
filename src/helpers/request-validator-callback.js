const serializeHttpResponse = require("./serialize-http-response");

module.exports = ({ payload, query, params, files }) => {
  return async (req, res, next) => {
    try {
      if (payload) {
        req.body = await payload.validateAsync(req.body);
      }
      if (query) {
        req.query = await query.validateAsync(req.query);
      }
      if (params) {
        req.params = await params.validateAsync(req.params);
      }
      if (files) {
        req.files = await files.validateAsync(req.files);
      }
    } catch (error) {
      console.error("ERROR: ", req.body, req.params, req.query);
      return next(
        serializeHttpResponse(400, {
          error: error.message.replace(/"/g, ""),
          message: "Bad Request",
        })
      );
    }
    console.log("SUCCESS: ", req.body, req.params, req.query, req.files);
    return next();
  };
};
