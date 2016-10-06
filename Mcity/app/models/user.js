var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var Time = moment().add(5.5,'hours').format('YYYY/MM/DD T h:mm');

var Postforrent = new Schema({
    location : {type:String, enum:['Sylvan County,Aqualily,Iris Court,Nova']},
    landmark : String,
    address : String,
    city : String,
    residential : {type:String, enum: ['Apartment,Villa,Duplex']},
    furnishedtype : {type : String, enum: ['Furnished,Semi-furnished,Unfurnished']},
    bedroom : {type : String, enum : ['2bhk','3bhk','4bhk']},
    renttype : {type : String, enum : ['Rent,Lease']},
    monthlyrent : Number,
    deposit : Number,
    description : String,
    imageurl : Array,
    postedon : {type:String,default:Time}
});

var Postforroom = new Schema({
    location : String,
    landmark : String,
    address : String,
    roomtype : {type: String,enum : ['pg','room']},
    monthlyrent : Number,
    gender : {type: String, enum:['Male','Female']},
    description : String,
    postedon:{type:String,default:Time}
});

var Otherdetails = new Schema({
    roundtrip : [{
        godate : String,
        returndate : String
    }],
    extraluggage : {type:String}
});

var Postforride = new Schema({
    from : String,
    to : String,
    date : {type:String,default:Time},
    otherdetails : [Otherdetails],
    price: String,
    midwaydrop : String
});

module.exports = mongoose.model('User',new Schema({
    username : String,
    mobileno : String,
    email: String,
    password : String,
    admin : Boolean,
    postforrent : [Postforrent],
    postforroom : [Postforroom],
    postforride : [Postforride] 
}));

