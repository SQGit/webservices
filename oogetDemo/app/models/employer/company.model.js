const mongoose = require('mongoose');
const httpStatus = require('http-status');
const MYError = require('../../utils/MYError');

const Jobs = new mongoose.Schema({
  jobid: { type: mongoose.Schema.Types.ObjectId, ref: 'job' },
  createdAt: { type: String },
});

const companySchema = new mongoose.Schema({
  companyname: { type: String },
  companycode: { type: String },
  companylogo: { type: String },
  profile: { type: String },
  uennumber: { type: String },
  industry: { type: String },
  country: { type: String },
  adminid: { type: mongoose.Schema.Types.ObjectId, ref: 'employer' },
  jobs: [Jobs],
  activestatus: { type: Boolean },
  registeredby: { type: String },
  termsaccepted: { type: String },
  termsandconditions: { type: String, default: 'termsandconditions.pdf' },
  createdAt: { type: String },
});

companySchema.statics = {

  checkDuplicates(error) {
    const { name } = error;
    if (name === 'MongoError' && error.code === 11000) {
              const regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i, 
        match = error.message.match(regex),
        field = match[1] || match[2];

      return new MYError({
        message: `${field} exists already`,
        success: false,
        errors: [{
          field,
          message: 'Validation error',
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
      });
    } else if (name === 'BulkWriteError' && error.code === 11000) {
              const regex = /index\:\ (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i, 
        match = error.message.match(regex),
        field = match[1] || match[2];

      return new MYError({
        message: `${field} exists already`,
        success: false,
        errors: [{
          field,
          message: 'Validation error',
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
      });
    }
    return error;
  },
};

module.exports = mongoose.model('company', companySchema);
