const mongoose = require('mongoose');

const blockKeySchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  blockkey: { type: String },
  confirmed: { type: String },
  blockedAt: { type: String },
});

module.exports = mongoose.model('blockey', blockKeySchema);
