const { getWinners } = require("../../../data-access/v2/users");

module.exports = async (req) => {
    //get from body
    const district = req.body.district;
    const state = req.body.state;
    const country = req.body.country;
    const ageGroup = req.body.ageGroup;
    const year = req.body.year;

    return await getWinners({
        district: district,
        state: state,
        country: country,
        ageGroup: ageGroup,
        year: year,
    });
}