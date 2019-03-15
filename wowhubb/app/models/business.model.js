const mongoose = require('mongoose');

// const Users = new mongoose.Schema({
//   userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
// });

const businessSchema = new mongoose.Schema({
  adminid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  firstname: { type: String },
  lastname: { type: String },
  email: { type: String },
  phone: { type: String },
  businesstype: { type: String },
  category: { type: String },
  companyname: { type: String },
  venue: { type: String },
  address1: { type: String },
  address2: { type: String },
  zipcode: { type: String },
  state: { type: String },
  country: { type: String },
  websitelink: { type: String },
  description: { type: String },
  coverpage: { type: String },
  businesslogo: { type: String },
  businesslogourl: { type: String },
  businesslogothumb: { type: String },
  producttitle1: { type: String },
  productfile1: { type: String },
  productfile1url: { type: String },
  productfile1thumb: { type: String },
  productheading1: { type: String },
  productdescription1: { type: String },
  producttitle2: { type: String },
  productfile2: { type: String },
  productfile2url: { type: String },
  productfile2thumb: { type: String },
  productheading2: { type: String },
  productdescription2: { type: String },
  businesscoverageareas: { type: Array },
  rankclientbase: { type: String },
  businesssearchkeywords: { type: Array },
  createdAt: { type: String },
});

module.exports = mongoose.model('business', businessSchema);
