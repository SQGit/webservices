const mongoose = require('mongoose');
const moment = require('moment');

const joinedat = moment().format('YYYY/MM/DD H:mm:ss');

const Users = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  joinedAt: { type: String, default: joinedat },
});

const groupSchema = new mongoose.Schema({
  adminid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  groupname: { type: String },
  privacy: { type: String },
  users: [Users],
  createdAt: { type: String },
});

module.exports = mongoose.model('group', groupSchema);
