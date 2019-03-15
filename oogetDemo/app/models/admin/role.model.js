const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
  roleid: { type: String },
  rolename: { type: String },
  permissions: { type: Array },
});

module.exports = mongoose.model('role', roleSchema);
