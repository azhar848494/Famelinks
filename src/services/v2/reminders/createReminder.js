const { createReminder } = require('../../../data-access/v2/reminders')

module.exports = async (data) => {
    return await createReminder(data)
}