let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let shopCount = new Schema({
    name: {type: String,default: "shop"},
    count: {type: Number,default: 0}
})

module.exports = mongoose.model('shopcount',shopCount);