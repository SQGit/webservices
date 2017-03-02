var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports = mongoose.model('Admin',new Schema({
    shop_category: String,
    shop_sub_type: String,
    shop_name: String,
    shop_owner_name: String,
    mobile_no: String,
    password: String,
    email: String,
    shop_address: String,
    is_sunday: String,
    time_mon_sat: String,
    time_sun: String,
    admin: String,
    phone_no: String,
    time_sun_to: String,
    time_sun_from: String,
    time_mon_sat_to: String,
    time_mon_sat_from: String,
    shop_logo: String,
    demo_shop_id: String,
    images: Array
}))