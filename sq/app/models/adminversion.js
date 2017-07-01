var mongoose = require('mongoose');

var Schema = mongoose.Schema ;

module.exports = mongoose.model('adminversion',new Schema({
    version : String
}));