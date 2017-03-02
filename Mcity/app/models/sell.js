var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var created = moment().add(5.5,'hours').format('YYYY/MM/DD h:mm');

module.exports = mongoose.model('Sell',new Schema({
    mobileno: String,
    adtitle: String,
    category: String,
    price: String,
    field1: String,
    field2: String,
    field3: String,
    field4: String,
    description: String,
    phone: String,
    imageurl: Array,
    postedon: {type: String,default: created}
}));