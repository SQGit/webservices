const mongoose = require('mongoose');

const invoiceCountSchema = new mongoose.Schema({
  name: { type: String, default: 'invoice' },
  year: { type: String },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model('invoicecount', invoiceCountSchema);