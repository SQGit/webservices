const mongoose = require('mongoose');


const Payrollbody = new mongoose.Schema({
  receivingbanknumber: { type: String },
  receivingbranchnumber: { type: String },
  receivingaccountnumber: { type: String },
  receivingaccountname: { type: String },
  transactioncode: { type: String },
  amount: { type: Number },
  recordtype: { type: String },
});

const payrollSchema = new mongoose.Schema({
  contractid: { type: mongoose.Schema.Types.ObjectId, ref: 'contract' },
  payrollheader: {
    valuedate: { type: String },
    originatingbanknumber: { type: String },
    originatingbranchnumber: { type: String },
    originatingaccountnumber: { type: String },
    originatorsname: { type: String },
    messagesequencenumber: { type: String },
    senderscompanyid: { type: String },
    recordtype: { type: String },
  },
  payrollbody: [Payrollbody],
  fromdate: { type: String },
  todate: { type: String },
  createdAt: { type: String },
});


module.exports = mongoose.model('payroll', payrollSchema);
