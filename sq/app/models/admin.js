let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let adminSchema = Schema({
    username: {type: String},
    password: {type: String}
})

module.exports = mongoose.model('admin',adminSchema);