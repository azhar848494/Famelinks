const mongoose = require('mongoose');

let FameCoins = mongoose.Schema({
    toUserId:{type:String, required:true},
    type:{ type:String,enum:['ads','performance','redeem','gifted'] },
    fameCoins:{type:Number, default:0},
    fromUserId:{type:String, default:null},

},{
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('famecoins',FameCoins);