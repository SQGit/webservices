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
    bedroom : {type : String, enum : ['2bhk','3bhk','4bhk','1/1.5bhk','2/2.5bhk','studio']},
    renttype : {type : String, enum : ['Rent,Lease']},
    monthlyrent : Number,
    deposit : Number,
    description : String,
    phone : String,
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
    phone : String,
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
    from : {type : String, enum:['Aqualily/BMW','Canopy/Sylvan County','Iris Court','Nova','MRV','Infosys Main Gate','Zero Point']},
    to : {type : String, enum:['Tambaram','Chengalpattu','Tnagar','Central Station','Chennai Airport','Paranur Station']},
    date : {type:String,default:Time},
    otherdetails : [Otherdetails],
    price: Number,
    midwaydrop : String,
    phone : String
});

var Coupons = new Schema({
    code : String
});

var Garage = new Schema({
    adtitile : String,
    category : String,
    price : String,
    field1 : String,
    field2 : String,
    field3 : String,
    field4 : String,
    description : String,
    imageurl : Array
});

module.exports = mongoose.model('User',new Schema({
    username : String,
    mobileno : String,
    email: String,
    password : String,
    admin : Boolean,
    licence : Array,
    licenceverified : {type:Boolean,default:false},
    postforrent : [Postforrent],
    postforroom : [Postforroom],
    postforride : [Postforride],
    coupons : [Coupons],
    garage : [Garage]
}));

