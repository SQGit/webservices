var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports = mongoose.model('Ceas',new Schema({
      mobileno: String,
      getnotify: String,
      volunteer: String
}));