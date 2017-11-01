const mongoose = require('mongoose');

const programSchedule = new mongoose.Schema({
  day: { type: String },
  eventnumber: { type: String },
  fromtime: { type: String },
  totime: { type: String },
  event: { type: String },
  coordinator: { type: String },
});

const eventSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  eventname: { type: String },
  eventcategory: { type: String },
  eventtime: { type: String },
  runtimefrom: { type: String },
  runtimeto: { type: String },
  wowtagvideo1: { type: String },
  coverpage1: { type: String },
  eventhighlights1: { type: String },
  eventhighlights2: { type: String },
  eventhighlightsvideo1: { type: String },
  eventhighlightsvideo2: { type: String },
  eventvenuename: { type: String },
  eventvenueaddress: { type: String },
  eventvenuefulladdress: { type: String },
  eventvenuecity: { type: String },
  eventvenuestate: { type: String },
  eventvenuezipcode: { type: String },
  eventvenueaddressvisibility: { type: String },
  eventvenueguestshare: { type: String },
  eventtotaldays: { type: String },
  programschedule: [programSchedule],
  eventcontactinfo1: { type: String },
  eventcontactname1: { type: String },
  eventcontactphone1: { type: String },
  eventcontactemail1: { type: String },
  eventcontactmessage1: { type: String },
  eventcontactinfo2: { type: String },
  eventcontactname2: { type: String },
  eventcontactphone2: { type: String },
  eventcontactemail2: { type: String },
  eventcontactmessage2: { type: String },
  highlighturl: { type: String },
  highlightdescription: { type: String },
  giftregistryurl: { type: String },
  donationsurl: { type: String },
  eventnoregistry: { type: String },
  createdAt: { type: String },
});


module.exports = mongoose.model('event', eventSchema);
