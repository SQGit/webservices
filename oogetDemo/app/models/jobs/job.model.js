const mongoose = require('mongoose');
const moment = require('moment');

const JobCount = require('./jobcount.model');

const SavedJobseekers = new mongoose.Schema({
  jobseekerid: { type: mongoose.Schema.Types.ObjectId, ref: 'jobseeker' },
  savedAt: { type: String },
});

const Break = new mongoose.Schema({
  breakname: { type: String },
  breakstart: { type: String },
  breakend: { type: String },
});

const Jobseekers = new mongoose.Schema({
  jobseekerid: { type: mongoose.Schema.Types.ObjectId, ref: 'jobseeker' },
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

const jobSchema = new mongoose.Schema({
  jobnumber: { type: String },
  project: { type: String },
  department: { type: String },
  jobtitle: { type: String },
  jobdescription: { type: String },
  jobspecialization: { type: String },
  numberofpax: { type: Number },
  numberofcontracts: { type: Number, default: 0 },
  employmenttype: { type: String },
  graceperiod: { type: Number },
  overtimerounding: { type: Number },
  jobperiodfrom: { type: String },
  jobperiodto: { type: String },
  workingenvironment: { type: Array },
  starttime: { type: String },
  endtime: { type: String },
  otherjobspecialization: { type: String },
  breaktime: [Break],
  addressblock: { type: String },
  addressunit: { type: String },
  addressstreet: { type: String },
  addresspostalcode: { type: String },
  addressregion: { type: String },
  addresslocation: { type: String },
  chargerate: { type: Number },
  markuprate: { type: Number },
  markupratetype: { type: String },
  salary: { type: Number },
  markuprateincurrency: { type: Number },
  jobstatus: { type: String },
  hiringstatus: { type: String },
  autooffer: { type: Boolean },
  autoofferaccept: { type: Boolean },
  jobaddedby: { type: String },
  workdaystype: { type: String },
  workdays: {
    sunday: { type: Boolean },
    monday: { type: Boolean },
    tuesday: { type: Boolean },
    wednesday: { type: Boolean },
    thursday: { type: Boolean },
    friday: { type: Boolean },
    saturday: { type: Boolean },
  },
  jobseekers: [Jobseekers],
  savedjobseekers: [SavedJobseekers],
  companyid: { type: mongoose.Schema.Types.ObjectId, ref: 'company' },
  createdAt: { type: String },
});

function pad(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return `${number}`;
}


jobSchema.pre('save', function (next) {
  const doc = this;
  const year = moment().format('YYYY');

  JobCount.findOneAndUpdate({ year }, { $setOnInsert: { count: 0 } }, {
    safe: true, upsert: true, new: true, setDefaultsOnInsert: true,
  }, (err, counter) => {
    if (err) return next(err);

    JobCount.findOneAndUpdate({ year }, { $inc: { count: 1 } }, { safe: true, upsert: true, new: true }, (err, counter) => {
      if (err) return next(err);
      const count = counter.count;
      const revisedcount = pad(count, 4);
      doc.jobnumber = `OOGET-${year}-${revisedcount}`;
      next();
    });
  });
});


module.exports = mongoose.model('job', jobSchema);
