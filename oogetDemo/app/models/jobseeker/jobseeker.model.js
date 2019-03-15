const mongoose = require('mongoose');
const httpStatus = require('http-status');
const MYError = require('../../utils/MYError');

const SavedJobs = new mongoose.Schema({
  jobid: { type: mongoose.Schema.Types.ObjectId, ref: 'job' },
  savedAt: { type: String },
});

const Jobs = new mongoose.Schema({
  jobid: { type: mongoose.Schema.Types.ObjectId, ref: 'job' },
  status: { type: String },
  applied: { type: Boolean },
  appliedAt: { type: String },
  offered: { type: Boolean },
  offeredAt: { type: String },
  accepted: { type: Boolean },
  acceptedAt: { type: String },
  rejected: { type: Boolean },
  rejectedAt: { type: String },
  contractid: { type: mongoose.Schema.Types.ObjectId, ref: 'contract' },
});

const previousExperince = new mongoose.Schema({
  previouscompanyname: { type: String },
  previouscompanyposition: { type: String },
  previousjobfrom: { type: String },
  previousjobto: { type: String },
  previousjobresponsibility: { type: String },
});

const jobseekerSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, unique: true },
  nameinidcard: { type: String },
  password: { type: String },
  country: { type: String },
  mobileno: { type: String },
  address: { type: String },
  nricfinno: { type: String },
  nriceditable: { type: String },
  dob: { type: String },
  gender: { type: String },
  race: { type: String },
  residencytype: { type: String },
  ispaynowreg: { type: String },
  bankname: { type: String },
  bankcode: { type: String },
  branchcode: { type: String },
  accountno: { type: String },
  experiencein: { type: Array },
  totalexperienceinyears: { type: String },
  previousexperince: [previousExperince],
  preferredregion: { type: Array },
  preferredlocation: { type: Array },
  preferredspecialization: { type: Array },
  workingenvironment: { type: Array },
  employmenttype: { type: Array },
  notificationalerttype: { type: String },
  alertofffrom: { type: String },
  alertoffto: { type: String },
  alertswitchedoffdays: { type: String },
  jobseekerimage: { type: String },
  jobseekeridprooffront: { type: String },
  jobseekeridproofback: { type: String },
  jobseekeridproofeditable: { type: String },
  firsttime: { type: String },
  jobs: [Jobs],
  savedjobs: [SavedJobs],
  activestatus: { type: Boolean },
  createdAt: { type: String },
});


jobseekerSchema.statics = {

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

module.exports = mongoose.model('jobseeker', jobseekerSchema);
