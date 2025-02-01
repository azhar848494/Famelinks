const serializeHttpResponse = require('../../../helpers/serialize-http-response');
const createReminderService = require('../../../services/v2/reminders/createReminder')

module.exports = async (request) => {
    const userId = request.user._id;

    const type = request.body.type
    const sourceId = request.body.sourceId
    // const triggerAt = request.body.triggerAt

    let result = await createReminderService({ type, sourceId, userId })

    if (!result) {
        return serializeHttpResponse(500, {
            message: "Failed to create reminder",
        });
    }

    return serializeHttpResponse(200, {
        message: 'Reminder added',
    })
}