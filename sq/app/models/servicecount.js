let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let serviceCount = new Schema({
    name: {type: String,default: "service"},
    count: {type: Number,default: 0}
})

module.exports = mongoose.model('servicecount',serviceCount);