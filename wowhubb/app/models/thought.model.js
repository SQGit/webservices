const mongoose = require('mongoose');

const Wowsome = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
});

const Comments = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  comment: { type: String },
  createddisplaytime: { type: String },
  commentedAt: { type: String },
});

const thoughtSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  thoughtstext: { type: String },
  thoughtsimage: { type: String },
  thoughtsimageurl: { type: String },
  thoughtsvideo: { type: String },
  thoughtsvideourl: { type: String },
  thoughtsvideothumb: { type: String },
  eventtype: { type: String },
  eventtypeint: { type: Number, default: 0 },
  createdAt: { type: String },
  urllink: { type: String },
  linkkeyword: { type: String },
  wowsome: [Wowsome],
  comments: [Comments],
  title: { type: String },
  description: { type: String },
  imageurl: { type: String },
});

module.exports = mongoose.model('thought', thoughtSchema);
