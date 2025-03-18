// const avatarDB = require('../../models/v2/users')

// exports.getAvatar = () => {
//     return avatarDB.find().lean()
// }
 
const avatarDB = require('../../models/v2/avatar')

exports.getAvatar = () => {
    return avatarDB.find({}, { _id: 1, name: 1, gender: 1}).lean()
}

exports.uploadAvatar = (data) => {
    return avatarDB.create(data) 
}