var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;


module.exports = mongoose.model('Coupon',new Schema({
    coupon_type: String,
    coupon_code: String,
    coupon_name: String,
    coupon_prefix: String,
    coupon_desc: String,
    users: String,
    usage_limit: String,
    no_of_coupon: String,
    coupon_start_date: String,
    coupon_expiry_date: String,
    shop_id: String,
    used_by: Array
}));