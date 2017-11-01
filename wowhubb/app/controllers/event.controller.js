const httpStatus = require('http-status');
const User = require('../models/user.model');
const Event = require('../models/event.model');
const moment = require('moment');

exports.interests = async (req, res, next) => {
  const interestsArray = [];
  const id = req.user._id;
  const { interests } = req.body;

  await User.findByIdAndUpdate(id, { $set: { interests: [] } },
    { safe: true, upsert: true, new: true });

  for (let i = 0; i < interests.length; i += 1) {
    interestsArray.push(User.findByIdAndUpdate(id, { $push: { interests: interests[i] } },
      { safe: true, upsert: true, new: true }));
  }

  await Promise.all(interestsArray);

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: 'Interests has been updated successfully',
  });
};


exports.getinterests = async (req, res, next) => {
  const id = req.user._id;

  const firsttime = await User.findById(id, { firsttime: 1 });

  if (firsttime.firsttime === 'true') {
    await User.findByIdAndUpdate(id, { $set: { firsttime: false } });
  }

  const interests = await User.findById(id, { interests: 1 });

  return res.json({ success: true, code: httpStatus.OK, message: interests });
};

exports.info = async (req, res, next) => {
  const { eventid, eventname, eventcategory, eventtime, runtimefrom,
    runtimeto, eventvenuename, eventvenueaddress, eventvenuecity,
    eventvenuestate, eventvenuezipcode, eventvenueaddressvisibility,
    eventvenueguestshare, eventtotaldays, eventcontactinfo1,
    eventcontactname1, eventcontactphone1, eventcontactemail1,
    eventcontactmessage1, eventcontactinfo2, eventcontactname2,
    eventcontactphone2, eventcontactemail2, eventcontactmessage2,
    giftregistryurl, donationsurl, eventnoregistry, highlighturl, highlightdescription } = req.body;

  const eventvenuefulladdress = `${eventvenueaddress} ${eventvenuecity} ${eventvenuestate} ${eventvenuezipcode}`;

  await Event.findByIdAndUpdate(eventid, { $set: {
    eventname,
    eventcategory,
    eventtime,
    runtimefrom,
    runtimeto,
    eventvenuename,
    eventvenueaddress,
    eventvenuecity,
    eventvenuestate,
    eventvenuezipcode,
    eventvenueaddressvisibility,
    eventvenueguestshare,
    eventtotaldays,
    eventcontactinfo1,
    eventcontactname1,
    eventcontactphone1,
    eventcontactemail1,
    eventcontactmessage1,
    eventcontactinfo2,
    eventcontactname2,
    eventcontactphone2,
    eventcontactemail2,
    eventcontactmessage2,
    giftregistryurl,
    donationsurl,
    eventnoregistry,
    highlighturl,
    highlightdescription,
    eventvenuefulladdress } });

  const event = await Event.findById(eventid, {});

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: event,
  });
};

exports.program = async (req, res, next) => {
  // const id = req.user._id;
  const { eventid, programschedule } = req.body;

  const programArray = [];

  await Event.findByIdAndUpdate(eventid, { $set: { programschedule: [] } },
    { safe: true, upsert: true, new: true });

  for (let i = 0; i < programschedule.length; i += 1) {
    programArray.push(Event.findByIdAndUpdate(eventid,
      { $push: { programschedule: programschedule[i] } },
      { safe: true, upsert: true, new: true }));
  }

  await Promise.all(programArray);

  const event = await Event.findById(eventid, {});

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: event,
  });
};

exports.create = async (req, res, next) => {
  const id = req.user._id;

  const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

  let wowtagvideo1 = '';
  let coverpage1 = '';
  let eventhighlights1 = '';
  let eventhighlights2 = '';
  let eventhighlightsvideo1 = '';
  let eventhighlightsvideo2 = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);
    wowtagvideo1 = fields.includes('wowtagvideo1') ? files.wowtagvideo1[0].filename : 'null';
    coverpage1 = fields.includes('coverpage1') ? files.coverpage1[0].filename : 'null';
    eventhighlights1 = fields.includes('eventhighlights1') ? files.eventhighlights1[0].filename : 'null';
    eventhighlights2 = fields.includes('eventhighlights2') ? files.eventhighlights2[0].filename : 'null';
    eventhighlightsvideo1 = fields.includes('eventhighlightsvideo1') ? files.eventhighlightsvideo1[0].filename : 'null';
    eventhighlightsvideo2 = fields.includes('eventhighlightsvideo2') ? files.eventhighlightsvideo2[0].filename : 'null';
  }

  const event = await new Event({
    userid: id,
    wowtagvideo1,
    coverpage1,
    eventhighlights1,
    eventhighlights2,
    eventhighlightsvideo1,
    eventhighlightsvideo2,
    createdAt,
  }).save();

  return res.json({ success: true, message: event });


  /*   console.log(wowtagvideo1);
  console.log(wowtagvideo2);
  console.log(coverpage1);
  console.log(eventhighlights1);
  console.log(eventhighlights2);
  console.log(eventhighlights3);
  console.log(eventspeaker1);
  console.log(eventspeaker2); */
};

exports.feed = async (req, res, next) => {
  const id = req.user._id;

  const event = await Event.find({ userid: id })
    .sort({'createdAt': -1})
    .populate('userid', 'wowtagid personalimage firstname lastname -_id');

  return res.json({ success: true, code: httpStatus.OK, message: event });
};

exports.testupload = async (req, res, next) => {
  let wowtagvideo1 = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);

    wowtagvideo1 = fields.includes('wowtagvideo1') ? files.wowtagvideo1[0].filename : 'null';
  }

  return res.json({ success: true, message: wowtagvideo1 });
};

exports.getwowtag = async (req, res, next) => {
  const wowtag = await User.find({}, { wowtagid: 1 });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: wowtag,
  });
};
