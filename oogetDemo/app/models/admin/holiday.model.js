const mongoose = require('mongoose');

const Holiday = new mongoose.Schema({
  holidayname: { type: String },
  holidaydate: { type: String },
  createdAt: { type: String },
});

const holidaySchema = new mongoose.Schema({
  year: { type: String },
  holidays: [Holiday],
});

module.exports = mongoose.model('holiday', holidaySchema);
