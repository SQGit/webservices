const mongoose = require('mongoose');
const InvoiceCount = require('./invoicecount.model');
const moment = require('moment');

const ContractDetails = mongoose.Schema({
    jobseekerusername: {type: String},
    jobseekeremail: {type: String},
    normaljobchargerate: {type: Number},
    normalemployercharges: {type: Number},
    normalworkminutes: {type: Number},
    otjobchargerate15: {type: Number},
    otemployercharges15: {type: Number},
    otworkminutes15: {type: Number},
    otjobchargerate20: {type: Number},
    otemployercharges20: {type: Number},
    otworkminutes20: {type: Number},
    contractid: { type: mongoose.Schema.Types.ObjectId, ref: 'contract' }
})

const invoiceSchema = mongoose.Schema({
    fromaddress: {type: String},
    toaddress: {type: String},
    companycode: {type: String},
    invoicedate: {type: String},
    invoicetotal: {type: Number},
    fromdate: {type: String},
    todate: {type: String},
    acno: {type: String},
    acname: {type: String},
    bankname: {type: String},
    swiftcode: {type: String},
    cheque: {type: String},
    paymentterms: {type: String},
    latepayment: {type: String},
    contractdetails: [ContractDetails],
    createdAt: {type: String},
    invoicenumber: {type: String}
})

function pad(number, width) {
    width -= number.toString().length;
    if (width > 0) {
      return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return `${number}`;
  }
  
  
  invoiceSchema.pre('save', function (next) {
    const doc = this;
    const year = moment().format('YY');
  
    InvoiceCount.findOneAndUpdate({ year }, { $setOnInsert: { count: 0 } }, {
      safe: true, upsert: true, new: true, setDefaultsOnInsert: true,
    }, (err, counter) => {
      if (err) return next(err);
  
      InvoiceCount.findOneAndUpdate({ year }, { $inc: { count: 1 } }, { safe: true, upsert: true, new: true }, (err, counter) => {
        if (err) return next(err);
        const count = counter.count;
        const revisedcount = pad(count, 6);
        doc.invoicenumber = `OGD${year}-${revisedcount}`;
        next();
      });
    });
  });

module.exports = mongoose.model('invoice',invoiceSchema);