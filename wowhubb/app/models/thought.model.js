const mongoose = require('mongoose');

const Wowsome = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
});

const Comments = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  comment: { type: String },
  commentedAt: { type: String },
});

const thoughtSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  thoughtstext: { type: String },
  thoughtsimage: { type: String },
  thoughtsvideo: { type: String },
  eventtype: { type: String },
  createdAt: { type: String },
  wowsome: [Wowsome],
  comments: [Comments],
});

module.exports = mongoose.model('thought', thoughtSchema);
