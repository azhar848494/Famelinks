const reminderDB = require('../../models/v2/reminders')

exports.createReminder = (data) => {
    return reminderDB.create(data) 
}