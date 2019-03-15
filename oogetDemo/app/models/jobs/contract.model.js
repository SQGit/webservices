const mongoose = require('mongoose');

const Timesheet = new mongoose.Schema({
  date: { type: String },
  punchintime: { type: String },
  verifiedpunchintime: { type: String },
  verifiedpunchinedited: { type: Boolean },
  punchedin: { type: Boolean },
  punchedout: { type: Boolean },
  punchouttime: { type: String },
  verifiedpunchouttime: { type: String },
  verifiedpunchoutedited: { type: Boolean },
  systempunchintime: { type: String },
  systempunchouttime: { type: String },
  notes: { type: String },
  late: { type: Boolean },
  lateintimation: { type: Boolean },
  lateintimatedat: { type: String },
  lateinhour: { type: String },
  latereason: { type: String },
  normalworkhour: { type: String },
  otworkhour: { type: String },
  totalworkhour: { type: String },
  salarymultiplier: { type: Number },
  normalsalary: { type: Number },
  normalemployercharges: { type: Number },
  otemployercharges: { type: Number },
  totalemployercharges: { type: Number },
  otsalary: { type: Number },
  totalsalary: { type: Number },
  oogetsnormalcommission: { type: Number },
  oogetsovertimecommission: { type: Number },
  oogetscommission: { type: Number },
  verified: { type: Boolean, default: false },
  payrollgenerated: { type: Boolean, default: false },
  payrollgeneratedat: { type: String },
  payrollid: { type: mongoose.Schema.Types.ObjectId, ref: 'payroll' },
  invoicegenerated: {type: Boolean, default: false},
  invoicegeneratedat: {type: String},
  invoiceid: { type: mongoose.Schema.Types.ObjectId, ref: 'invoice' }
});

const Offday = new mongoose.Schema({
  date: { type: String },
});

const contractSchema = new mongoose.Schema({
  contractstatus: { type: String },
  jobid: { type: mongoose.Schema.Types.ObjectId, ref: 'job' },
  jobseekerid: { type: mongoose.Schema.Types.ObjectId, ref: 'jobseeker' },
  timesheet: [Timesheet],
  offdays: [Offday],
  createdAt: { type: String },
});


module.exports = mongoose.model('contract', contractSchema);
