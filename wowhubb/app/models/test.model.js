const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  post: { type: String },
});

module.exports = mongoose.model('test', testSchema);
