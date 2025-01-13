const LocationDB = require('../../models/v2/locations');
const LocatnDB = require('../../models/v2/locatns');

exports.getAllLocations = () => {
  return (
    LocationDB.aggregate([
      {
        $group: {
          _id: {
            country: "$country",
            state: "$state",
            district: "$district"
          }
        }
      },
      {
        $group: {
          _id: {
            country: "$_id.country",
            state: "$_id.state"
          },
          districts: {
            $push: {
              name: "$_id.district",
            }
          }
        }
      },
      {
        $group: {
          _id: "$_id.country",
          states: {
            $push: {
              name: "$_id.state",
              districts: "$districts",
            }
          }
        }
      }
    ])
  );
};

exports.getLocationsByText = (data) => {
  return (
    LocationDB.find(
      {
        $or: [
          { district: { $regex: `^.*?${data}.*?$`, $options: "i" } },
          { state: { $regex: `^.*?${data}.*?$`, $options: "i" } },
          { country: { $regex: `^.*?${data}.*?$`, $options: "i" } },
        ],
      },
      { _id: 0 }
    )
      .sort({ district: "asc" })
      .lean()
  );
};

exports.findLocationsByText = (data) => {
  return (
    LocatnDB.aggregate([
      { $match: { value: { $regex: `^.*?${data}.*?$`, $options: "i" } } },
      {
        $lookup: {
          from: "locatns",
          let: { value: "$scopes" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$value"] } } },
            { $project: { value: 1 } },
            { $sort: { _id: -1 } },
          ],
          as: "scopes",
        },
      },
      {
        $project: {
          type: 1,
          value: {
            $concat: [
              '$value',
              {
                $reduce: {
                  input: "$scopes",
                  initialValue: "",
                  in: {
                    $concat: [
                      "$$value",
                      ", ",
                      "$$this.value",
                    ]
                  }
                }
              },
            ],
          },
        }
      },
    ])
  );
};

exports.getLocationBySearch = (search_type, where, page) => {
  return (
    LocationDB.aggregate([
      { $match: where },
      {
        $group: {
          _id: ["$" + search_type],
          keywords: {
            $first: "$$ROOT",
          },
        },
      },
    ])
      // .limit(perPage)
      // .skip(offset)
      .sort({
        createdAt: -1,
      })
  );
};

exports.getCountriesByContinent = (continent) => {
  return LocationDB.aggregate([
    { $match: { continent } },
    { $project: { _id: 0, country: 1 } },
    { $group: { _id: null, countries: { $addToSet: '$country' } } },
    { $project: { _id: 0 } }
  ]);
};

exports.getStatesByCountry = (country) => {
  return LocationDB.aggregate([
    { $match: { country } },
    { $project: { _id: 0, state: 1 } },
    { $group: { _id: null, states: { $addToSet: '$state' } } },
    { $project: { _id: 0 } }
  ]);
};

exports.getDistrictsByState = (country, state) => {
  return LocationDB.aggregate([
    { $match: { state, country } },
    { $project: { _id: 0, district: 1 } },
    { $group: { _id: null, districts: { $addToSet: '$district' } } },
    { $project: { _id: 0 } }
  ]);
};