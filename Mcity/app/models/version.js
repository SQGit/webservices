var mongoose = require('mongoose');

var Schema = mongoose.Schema ;

module.exports = mongoose.model('Version',new Schema({
    version : String
}));