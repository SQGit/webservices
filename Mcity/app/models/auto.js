var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports = mongoose.model('Auto',new Schema({
pickuppoint : String,
droppoint : String,
rate : String
}));