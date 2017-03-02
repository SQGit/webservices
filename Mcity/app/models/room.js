var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var Time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');

module.exports = mongoose.model('Room',new Schema({
    mobileno: String,
    location: String,
    landmark: String,
    address: String,
    roomtype: {type: String,enum: ['pg','room']},
    monthlyrent: Number,
    gender: {type: String,enum: ['Male','Female']},
    description: String,
    phone: String,
    postedon: {type: String,default: Time}
}))