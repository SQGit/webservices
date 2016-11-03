var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var Coupons = new Schema({
    code : String
});

module.exports = mongoose.model('Coupon',new Schema({
    shopname : String,
    expireddate : String,
    descripton : String,
    coupons : [Coupons],
    logo : Array
}));