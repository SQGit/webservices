let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let apiSchema = Schema({
    firstname: {type:String},
    lastname: {type:String},
    email: {type: String},
    password: {type: String}
})

module.exports = mongoose.model('api',apiSchema);