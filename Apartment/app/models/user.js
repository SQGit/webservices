var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Raiseticket = new Schema({
    ticketid : String,
    complaint : {type:String,default:"null"},
    description : {type:String,default:"null"},
    imageurl : Array,
    postedon : {type:Date,default:Date.now},
    ticketstatus : {type:String,default:"pending"},
    comments : {type:String,default:null}
});

module.exports = mongoose.model('User',new Schema({
    apartment : String,
    blockno : String,
    floorno : String,
    houseno : String,
    username : String,
    email : String,
    phoneno : String,
    password : String,
    uploadphoto : String,
    admin : {type:Boolean,default:false},
    confirm : {type: Boolean,default:false},
    emailverify : String,
    emailverifystatus : {type:Boolean,default:false},
    raiseticket : [Raiseticket]
}));