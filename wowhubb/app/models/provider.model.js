const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  provider: { type: String },
  category: { type: Array },
  providerlogo: { type: String },
});

module.exports = mongoose.model('provider', providerSchema);
