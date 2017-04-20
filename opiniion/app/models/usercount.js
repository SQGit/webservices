let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userCount = new Schema({
    name: {type: String,default: "user"},
    count: {type: Number,default: 0}
})

module.exports = mongoose.model('usercount',userCount);