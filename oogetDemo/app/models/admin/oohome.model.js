const mongoose = require('mongoose');

const ooHomeSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  list1: { type: String },
  list2: { type: String },
  list3: { type: String },
  list4: { type: String },
});


module.exports = mongoose.model('oohome', ooHomeSchema);
