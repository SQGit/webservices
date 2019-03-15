const mongoose = require('mongoose');

const jobCountSchema = new mongoose.Schema({
  name: { type: String, default: 'job' },
  year: { type: String },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model('jobcount', jobCountSchema);
