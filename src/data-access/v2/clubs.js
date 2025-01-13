const clubsDB = require('../../models/v2/clubs')

exports.getClubs = () => {
    return clubsDB.find({}, { _id: 0, createdAt: 0, updatedAt: 0 }).lean()
}

exports.addClubs = (payload) => {
    return clubsDB.create(payload)
}