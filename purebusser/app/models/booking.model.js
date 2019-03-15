const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  blockkey: { type: String },
  tinkey: { type: String },
  walletamount: { type: String },
  paymentgatewayamount: { type: String },
  couponamount: { type: String },
  totalfare: { type: String },
  couponcode: { type: String },
  bookedAt: { type: String },
});

module.exports = mongoose.model('booking', bookingSchema);
