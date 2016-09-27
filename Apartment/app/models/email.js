var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Email',new Schema({
    username : String,
    email : String,
    auth : Number
}));