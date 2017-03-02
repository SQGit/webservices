var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var Time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm')

module.exports = mongoose.model('Rent',new Schema({
    mobileno: String,
    location: {type:String, enum:['Sylvan County','Aqualily','Iris Court','Nova']},
    landmark: String,
    address: String,
    city: String,
    residential: {type: String,enum: ['Apartment','Villa','Duplex']},
    furnishedtype: {type: String,enum: ['Furnished','Semi-furnished','Unfurnished']},
    bedroom: {type: String,enum: ['2bhk','3bhk','4bhk','1/1.5bhk','2/2.5bhk','studio']},
    renttype: {type: String,enum: ['Rent','Lease']},
    monthlyrent: Number,
    deposit: Number,
    description: String,
    phone: String,
    imageurl: Array,
    postedon: {type:String,default:Time}
}))