var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Postforrent = new Schema({
    location : {type:String, enum:['Sylvan County,Aqualily,Iris Court,Nova']},
    landmark : String,
    address : String,
    city : String,
    residential : {type:String, enum: ['Flat,House,Villa']},
    furnishedtype : {type : String, enum: ['Furnished,Semi-furnished,Unfurnished']},
    bedroom : {type : String, enum : ['2bhk','3bhk','4bhk']},
    renttype : {type : String, enum : ['Rent,Lease']},
    monthlyrent : Number,
    deposit : Number,
    description : String,
    imageurl : Array,
    postedon : {type:Date,default:Date.now}
});

var Postforroom = new Schema({
    location : String,
    landmark : String,
    address : String,
    roomtype : {type: String,enum : ['pg','room']},
    monthlyrent : Number,
    gender : {type: String, enum:['Male','Female']},
    description : String,
    postedon:{type:Date,default:Date.now}
});

module.exports = mongoose.model('User',new Schema({
    username : String,
    mobileno : String,
    email: String,
    password : String,
    admin : Boolean,
    postforrent : [Postforrent],
    postforroom : [Postforroom] 
}));

