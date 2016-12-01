var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports = mongoose.model('Restaurant',new Schema({
    restaurantname : String,
    address : String,
    openingtime : String,
    mobileno : String,
    description : String,
    logo : Array,
    viewmenu : Array
}));