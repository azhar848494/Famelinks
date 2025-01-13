const { updateJob } = require("../../../data-access/v2/joblinks")

module.exports = async (id, data) => {
    return await updateJob(id, data)
}