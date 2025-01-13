const serializeHttpResponse = require("../../../helpers/serialize-http-response");
const getLocationsBySearchService = require("../../../services/v2/locations/getLocationsBySearch");

module.exports = async (request) => {
  let search = request.query.search ? request.query.search : "";
  let search_type = request.query.search_type;

  let where = {};

  where[search_type] = { $regex: search, $options: "i" };

  const data = await getLocationsBySearchService(
    search_type,
    where,
    request.query.page
  );
  if (data.length > 0) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      result.push(element.keywords);
    }

    return serializeHttpResponse(200, {
      message: "Location Fetched",
      result,
    });
  }
};
