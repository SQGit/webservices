var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports = mongoose.model('Retail',new Schema({
    retailname : String,
    retaildescription : String,
    openingtime : String,
    mobileno : String,
    description : String,
    logo : Array,
    viewmenu : Array
}));