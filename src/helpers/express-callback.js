const serializeHttpResponse = require("./serialize-http-response");

module.exports = (controller, args) => {
  return async (request, response, next) => {
    try {
      const result = await controller(request, args);
      response.status(result.statusCode);
      response.header(result.headers);

      if (!result.body.success) {
        return next(result);
      } else {
        return response.send(result.body);
      }
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(
          serializeHttpResponse(401, {
            message: "Session Timeout",
          })
        );
      }
      return next(
        serializeHttpResponse(500, {
          message: "Server Error",
          error: error.message,
        })
      );
    }
  };
};
