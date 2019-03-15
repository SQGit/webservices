const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate'); // page


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

  eventvenuestartdate: { type: String },
  eventvenueenddate: { type: String },

  eventvenueaddress1: { type: String },
  eventvenueaddress2: { type: String },
  eventvenuecity: { type: String },

  eventvenuecitytimezone: { type: String },
  eventvenuecountry: { type: String },
  eventvenueticketurl: { type: String },
  eventvenueticketprice: { type: String },

  eventvenuezipcode: { type: String },
});


const eventTour = new mongoose.Schema({
  eventtournumber: { type: String },
  eventtourname: { type: String },

  eventtourstartdate: { type: String },
  eventtourenddate: { type: String },

  eventtouraddress1: { type: String },
  eventtouraddress2: { type: String },
  eventtourcity: { type: String },

  eventtourcountry: { type: String },
  eventtourticketurl: { type: String },
  eventtourticketprice: { type: String },

  eventtourzipcode: { type: String },
});

const eventFaqs = new mongoose.Schema({
  faqnumber: { type: String },
  faqquestion: { type: String },
  faqanswer: { type: String },
});

const physicalStoreLocation = new mongoose.Schema({
  storename: { type: String },
  storeaddress: { type: String },
  zipcode: { type: String },
  city: { type: String },
});

/* User Input Fields */

const Rsvp = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  extra: { type: String },
});

const AudienceEngagementSubmission = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  fullname: { type: String },
  wowtagid: { type: String },
  email: { type: String },
  phone: { type: String },
  address1: { type: String },
  address2: { type: String },
  city: { type: String },
  zipcode: { type: String },
  country: { type: String },
  gender: { type: String },
})

const Wowsome = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
});

const Comments = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  comment: { type: String },
  createddisplaytime: { type: String },
  commentedAt: { type: String },
});

/* User Input Fields */

const eventSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  eventtype: { type: String },
  eventtypeint: { type: Number },
  eventdayscount: { type: Number },
  eventcategory: { type: String },
  eventname: { type: String },
  eventtimezone: { type: String },
  eventstartdate: { type: String },
  eventenddate: { type: String },
  eventticketurl: { type: String },
  eventdescription: { type: String },

  /* Worst Coding feature requested from web */
  eventcity: { type: String },
  /*  */

  // Sales

  brandawareness: { type: String },
  sponsorslogo: { type: String },
  sponsorslogourl: { type: String },

  // salesOnlineShopping

  onlinesalesobjective: { type: String },
  onlinesalespromotioncountry: { type: String },
  onlinesalespromotionstate: { type: String },
  onlinesalespromotionurl: { type: String },

  // salesPhysicalShopping

  physicalsalespromotioncountry: { type: String },
  physicalsalespromotionstate: { type: String },
  physicalsalesstorelocation: [physicalStoreLocation],

  // SalesEventOfferings

  eventsalescoupon1: { type: String },
  eventsalescoupon1url: { type: String },
  eventsalesservicename1: { type: String },
  eventsalesdiscount1: { type: String },
  eventsalescouponfrom1: { type: String },
  eventsalescouponto1: { type: String },
  eventsalesaction1: { type: String },
  eventsalesterms1: { type: String },

  eventsalescoupon2: { type: String },
  eventsalescoupon2url: { type: String },
  eventsalesservicename2: { type: String },
  eventsalesdiscount2: { type: String },
  eventsalescouponfrom2: { type: String },
  eventsalescouponto2: { type: String },
  eventsalesaction2: { type: String },
  eventsalesterms2: { type: String },

  salesemail: { type: String },
  salesphonenumber: { type: String },
  saleshostmessage: { type: String },

  //

  organisationlogo: { type: String },
  organisationlogourl: { type: String },

  tickettype: { type: String },
  ticketprice: { type: String },

  coverpage: { type: String },
  coverpageurl: { type: String },
  eventtitle: { type: String },
  runtimefrom: { type: String },
  runtimeto: { type: String },
  wowtagvideo: { type: String },
  wowtagvideourl: { type: String },
  wowtagvideothumb: { type: String },
  eventvenue: [eventVenue],
  eventtour: [eventTour],
  eventtouraddressvisibility: { type: String },
  eventtourguestshare: { type: String },
  onlineeventtour: { type: String },
  inviteonlyeventtour: { type: String },
  numberofcitiestour: { type: String },

  eventfaqs: [eventFaqs],

  /* Online event */

  onlineeventname: { type: String },
  webinarlink: { type: String },
  teleconferencephone: { type: String },
  teleconferencepassword: { type: String },

  /* Worst Coding feature requested from web */

  faqquestion1: { type: String },
  faqanswer1: { type: String },
  faqquestion2: { type: String },
  faqanswer2: { type: String },
  faqquestion3: { type: String },
  faqanswer3: { type: String },
  faqquestion4: { type: String },
  faqanswer4: { type: String },

  /*  */

  eventvenueaddressvisibility: { type: String },
  eventvenueguestshare: { type: String },
  onlineevent: { type: String },
  inviteonlyevent: { type: String },

  eventtotaldays: { type: String },
  programschedule: [programSchedule],

  organisationname: { type: String },
  keywordsearch: { type: Array },

  eventcontactname: { type: String },
  eventcontactphone: { type: String },
  eventcontactemail: { type: String },
  eventcontactmessage: { type: String },

  eventguesttype1: { type: String },
  eventspeakername1: { type: String },
  eventspeakerlink1: { type: String },
  eventspeakeractivities1: { type: String },
  eventhighlights1: { type: String },
  eventhighlights1url: { type: String },
  eventhighlights1thumb: { type: String },

  eventguesttype2: { type: String },
  eventspeakername2: { type: String },
  eventspeakerlink2: { type: String },
  eventspeakeractivities2: { type: String },
  eventhighlights2: { type: String },
  eventhighlights2url: { type: String },
  eventhighlights2thumb: { type: String },

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
    gender: { type: String },
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
    couponimageurl: { type: String },
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
  audienceengagementsubmission: [AudienceEngagementSubmission],
  comments: [Comments],
});

eventSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('event', eventSchema);
