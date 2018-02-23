const mongoose = require('mongoose');

const keywordSchema = new mongoose.Schema({
  word: { type: String },
});

module.exports = mongoose.model('keyword', keywordSchema);
