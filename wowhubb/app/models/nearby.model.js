const mongoose = require('mongoose');

const nearbySchema = new mongoose.Schema({
  eventtype: { type: String },
  eventlogo: { type: String },
});

module.exports = mongoose.model('nearby', nearbySchema);
