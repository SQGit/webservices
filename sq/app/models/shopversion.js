var mongoose = require('mongoose');

var Schema = mongoose.Schema ;

module.exports = mongoose.model('shopversion',new Schema({
    version : String
}));