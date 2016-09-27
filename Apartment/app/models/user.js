var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Raiseticket = new Schema({
    ticketid : String,
    complaint : String,
    description : String,
    imageurl : Array,
    postedon : {type:Date,default:Date.now},
    ticketstatus : {type:String,enum : ['initiate','pending','reject']}
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
    registeredon : {type:Date,default:Date.now},
    raiseticket : [Raiseticket]
}));