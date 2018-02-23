const mongoose = require('mongoose');


const audeinceEngagementUrl = new mongoose.Schema({
  url: { type: String },
  country: { type: String },
  checked: { type: String },
});

const programSchedule = new mongoose.Schema({
  day: { type: String },
  eventnumber: { type: String },
  starttime: { type: String },
  endtime: { type: String },
  itystarttime: { type: String },
  ityendtime: { type: String },
  agenda: { type: String },
  facilitator: { type: String },
  location: { type: String },
});

const eventVenue = new mongoose.Schema({
  eventvenuenumber: { type: String },
  eventvenuename: { type: String },
  eventvenueaddress1: { type: String },
  eventvenueaddress2: { type: String },
  eventvenuecity: { type: String },
  eventvenuezipcode: { type: String },
});

const Wowsome = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
});

const Rsvp = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  extra: { type: String },
});

const Comments = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  comment: { type: String },
  commentedAt: { type: String },
});

const eventSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  eventtype: { type: String },
  eventcategory: { type: String },
  eventname: { type: String },
  eventtimezone: { type: String },
  eventstartdate: { type: String },
  eventenddate: { type: String },
  eventdescription: { type: String },

  organisationlogo: { type: String },

  tickettype: { type: String },
  ticketprice: { type: String },

  coverpage: { type: String },
  eventtitle: { type: String },
  runtimefrom: { type: String },
  runtimeto: { type: String },
  wowtagvideo: { type: String },
  eventvenue: [eventVenue],
  eventvenueaddressvisibility: { type: String },
  eventvenueguestshare: { type: String },
  onlineevent: { type: String },
  inviteonlyevent: { type: String },

  eventtotaldays: { type: String },
  programschedule: [programSchedule],

  organisationname: { type: String },
  keywordsearch: { type: String },

  eventcontactname: { type: String },
  eventcontactphone: { type: String },
  eventcontactemail: { type: String },
  eventcontactmessage: { type: String },

  eventguesttype1: { type: String },
  eventspeakername1: { type: String },
  eventspeakerlink1: { type: String },
  eventspeakeractivities1: { type: String },
  eventhighlights1: { type: String },
  eventhighlightsvideo1: { type: String },

  eventguesttype2: { type: String },
  eventspeakername2: { type: String },
  eventspeakerlink2: { type: String },
  eventspeakeractivities2: { type: String },
  eventhighlights2: { type: String },
  eventhighlightsvideo2: { type: String },

  engagementformtype: { type: String },
  engagementformaction: { type: String },
  audienceengagementform: {
    fullname: { type: String },
    wowtagid: { type: String },
    email: { type: String },
    phone: { type: String },
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    zipcode: { type: String },
    country: { type: String },
  },
  audeinceengagementurl: {
    donationsurl: { type: String },
    websiteurl: { type: String },
    eventnolinks: { type: String },
    engagementurl: [audeinceEngagementUrl],
  },
  audienceengagementcoupon: {
    couponcode: { type: String },
    couponexpirydate: { type: String },
    termsandconditions: { type: String },
    couponimage: { type: String },
  },

  privateevent: { type: String },
  registerrsvp: { type: String },
  otherurl: { type: String },
  giftregistryurl: { type: String },
  donationsurl: { type: String },
  eventnolinks: { type: String },
  createdAt: { type: String },
  wowsome: [Wowsome],
  rsvp: [Rsvp],
  comments: [Comments],
});


module.exports = mongoose.model('eventtest', eventSchema);
