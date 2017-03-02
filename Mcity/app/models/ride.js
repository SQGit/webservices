var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema ;

var Time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');

// var Otherdetails = new Schema({
//     roundtrip:[{
//         godate: String,
//         returndate: String
//     }],
//     noofpersons: {type: String}
// });

module.exports = mongoose.model('Ride',new Schema({
    mobileno: String,
    from: {type: String,enum:['Aqualily/BMW','Canopy/Sylvan County','Iris Court','Nova','MRV','Infosys Main Gate','Zero Point']},
    to: {type: String,enum:['Tambaram','Chengalpattu','Tnagar','Central Station','Chennai Airport','Paranur Station']},
    date: {type: String,default: Time},
    otherdetails: {roundtrip:{
        godate: String,
        returndate: String
    },
    noofpersons: {type: String}},
    price: Number,
    midwaydrop: String,
    phone: String
}));