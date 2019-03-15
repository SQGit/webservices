const mongoose = require('mongoose');

const jobseekerTermSchema = mongoose.Schema({
  jobseekerterm: {type: String},
  createdAt: {type: String},
  updatedAt: {type: String}
});

module.exports = mongoose.model('jobseekerterm', jobseekerTermSchema);
