const mongoose = require('mongoose');

const PricingAndAvailability = new mongoose.Schema({
  day: {type: String},
  availability: {type: String},
  dailyrate: {type: String},
  hourlyrate: {type: String}
})

const eventVenueFaqs = new mongoose.Schema({
  faqnumber: { type: String },
  faqquestion: { type: String },
  faqanswer: { type: String },
});

const eventVenueSchema = new mongoose.Schema({
  adminid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  firstname: { type: String },
  lastname: { type: String },
  email: { type: String },
  phone: { type: String },
  venuetype: { type: String },
  companyname: { type: String },
  venue: { type: String },
  address1: { type: String },
  address2: { type: String },
  zipcode: { type: String },
  city: {type: String},
  state: { type: String },
  country: { type: String },
  websitelink: { type: String },
  venuedescription: { type: String },
  coverpage: { type: String },
  coverpageurl: { type: String },
  businesslogo: { type: String },
  businesslogourl: { type: String},
  amenities: { type: Array },
  foodsandbeverages: {type: Array},
  eventvenuehalltype: {type: String},
  eventvenuehallname: {type: String},
  eventvenuehallseating: {type: String},
  eventvenuehallstanding: {type: String},
  eventvenuehalldescription: {type: String},
  eventvenuehallimage: {type: String},
  eventvenuehallimageurl: {type: String},
  eventvenuehallimagethumb: {type: String},
  pricingandavailability: [PricingAndAvailability], 
  businesscoverageareas: { type: Array },
  discount1: {type: String},
  dicountbegin1: { type: String},
  discountend1: {type: String},
  discount2: {type: String},
  dicountbegin2: { type: String},
  discountend2: {type: String},
  eventvenuefaqs: [eventVenueFaqs],
  createdAt: { type: String },
});

module.exports = mongoose.model('eventvenue', eventVenueSchema);
