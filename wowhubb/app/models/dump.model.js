const mongoose = require('mongoose');

const dumpSchema = new mongoose.Schema({
  eventtype: { type: String },
  eventlogo: { type: String },
});

module.exports = mongoose.model('dump', dumpSchema);
