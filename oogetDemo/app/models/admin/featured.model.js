const mongoose = require('mongoose');

const featuredSchema = new mongoose.Schema({
  featuredimage: { type: String },
  createdAt: { type: String },
});

module.exports = mongoose.model('featured', featuredSchema);
