var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports = mongoose.model('Parche',new Schema({
    name: String,
    departuretime: String,
    arrivaltime: String,
    sun: String,
    mon: String,
    tue: String,
    wed: String,
    thu: String,
    fri: String,
    sat: String
}))