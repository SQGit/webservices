const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
  faqquestion: { type: String },
  faqanswer: { type: String },
  createdAt: { type: String },
});

module.exports = mongoose.model('faq', FaqSchema);
