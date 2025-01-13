const { createJob } = require("../../../data-access/v2/joblinks")

module.exports = async (data) => {
    return await createJob(data)
}