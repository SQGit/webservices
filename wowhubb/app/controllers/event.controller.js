const httpStatus = require('http-status');
const User = require('../models/user.model');
const Event = require('../models/event.model');
const Thought = require('../models/thought.model');
const Keyword = require('../models/keyword.model');
const moment = require('moment');
const { intersection, includes } = require('lodash');


// Nearby Event for Android

const Nearby = require('../models/nearby.model');
const Dump = require('../models/dump.model');

//

const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

// COPY

exports.interests = async (req, res, next) => {
  try {
    const interestsArray = [];
    const id = req.user._id;
    const { interests } = req.body;

    await User.findByIdAndUpdate(id, { $set: { interests: [] } },
      { safe: true, upsert: true, new: true });

    if (interests !== undefined) {
      for (let i = 0; i < interests.length; i += 1) {
        interestsArray.push(User.findByIdAndUpdate(id, { $push: { interests: interests[i] } },
          { safe: true, upsert: true, new: true }));
      }

      await Promise.all(interestsArray);
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Interests has been updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};


exports.getinterests = async (req, res, next) => {
  try {
    const id = req.user._id;

    const firsttime = await User.findById(id, { firsttime: 1 });

    if (firsttime.firsttime === 'true') {
      await User.findByIdAndUpdate(id, { $set: { firsttime: false } });
    }

    const interests = await User.findById(id, { interests: 1 });

    return res.json({ success: true, code: httpStatus.OK, message: interests });
  } catch (error) {
    return next(error);
  }
};


/* =================================================== */

// Personal Event

exports.eventdetails = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { eventtype, eventdayscount, eventcategory, eventname,
      eventtimezone, eventstartdate,
      eventenddate, eventdescription,
    } = req.headers;

    let { eventtypeint } = req.headers;

    eventtypeint = parseInt(eventtypeint, 10);

    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    let coverpage = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      coverpage = fields.includes('0') ? req.files[0].filename : 'null';
    }

    const event = await new Event({
      userid: id,
      eventtype,
      eventtypeint,
      eventdayscount,
      eventcategory,
      eventname,
      eventtimezone,
      eventstartdate,
      eventenddate,
      eventdescription,
      coverpage,
      createdAt,
    }).save();

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

// edit event details

exports.editeventdetails = async (req, res, next) => {
  try {
    const { eventid, eventtype, eventdayscount, eventcategory,
      eventname, eventtimezone, eventstartdate,
      eventenddate, eventdescription,
    } = req.headers;

    let { eventtypeint } = req.headers;

    eventtypeint = parseInt(eventtypeint, 10);

    let coverpage = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      coverpage = fields.includes('0') ? req.files[0].filename : 'null';
    }

    await Event.findByIdAndUpdate(eventid, { $set: {
      eventtype,
      eventtypeint,
      eventdayscount,
      eventcategory,
      eventname,
      eventtimezone,
      eventstartdate,
      eventenddate,
      eventdescription,
      coverpage,
    } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};


// Professional Event

exports.proeventdetails = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { eventtype, eventdayscount, eventcategory, eventname, tickettype,
      ticketprice,
      eventdescription } = req.headers;

    let { eventtypeint } = req.headers;

    eventtypeint = parseInt(eventtypeint, 10);

    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    let coverpage = '';
    let organisationlogo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].filename : 'null';
      organisationlogo = fields.includes('organisationlogo') ?
        req.files.organisationlogo[0].filename : 'null';
    }

    const event = await new Event({
      userid: id,
      eventtype,
      eventtypeint,
      eventdayscount,
      eventcategory,
      eventname,
      tickettype,
      ticketprice,
      eventdescription,
      coverpage,
      organisationlogo,
      createdAt,
    }).save();

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

// edit Pro event details

exports.editproeventdetails = async (req, res, next) => {
  try {
    const { eventid, eventtype, eventdayscount, eventcategory,
      eventname, tickettype, ticketprice, eventdescription,
    } = req.headers;

    let { eventtypeint } = req.headers;

    eventtypeint = parseInt(eventtypeint, 10);

    let coverpage = '';
    let organisationlogo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].filename : 'null';
      organisationlogo = fields.includes('organisationlogo') ? req.files.organisationlogo[0].filename : 'null';
    }

    await Event.findByIdAndUpdate(eventid, { $set: {
      eventtype,
      eventtypeint,
      eventdayscount,
      eventcategory,
      eventname,
      tickettype,
      ticketprice,
      eventdescription,
      coverpage,
      organisationlogo,
    } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};


// Sales Event

exports.saleseventdetails = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { eventtype, eventdayscount, eventcategory, brandawareness, eventname,
      eventstartdate, eventenddate, eventdescription }
      = req.headers;

    let { eventtypeint } = req.headers;

    eventtypeint = parseInt(eventtypeint, 10);

    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    let coverpage = '';
    let sponsorslogo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].filename : 'null';
      sponsorslogo = fields.includes('sponsorslogo') ? req.files.sponsorslogo[0].filename : 'null';
    }

    const event = await new Event({
      userid: id,
      eventtype,
      eventtypeint,
      eventdayscount,
      eventcategory,
      brandawareness,
      eventname,
      eventstartdate,
      eventenddate,
      eventdescription,
      coverpage,
      sponsorslogo,
      createdAt,
    }).save();

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

// edit Sales event details

exports.editsaleseventdetails = async (req, res, next) => {
  try {
    const { eventid, eventtype, eventdayscount, eventcategory,
      brandawareness, eventname,
      eventstartdate, eventenddate, eventdescription,
    } = req.headers;

    let { eventtypeint } = req.headers;

    eventtypeint = parseInt(eventtypeint, 10);

    let coverpage = '';
    let sponsorslogo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].filename : 'null';
      sponsorslogo = fields.includes('sponsorslogo') ? req.files.sponsorslogo[0].filename : 'null';
    }

    await Event.findByIdAndUpdate(eventid, { $set: {
      eventtype,
      eventtypeint,
      eventdayscount,
      eventcategory,
      brandawareness,
      eventname,
      eventstartdate,
      eventenddate,
      eventdescription,
      coverpage,
      sponsorslogo,
    } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

exports.eventwowtag = async (req, res, next) => {
  try {
    const { eventid, eventtitle, runtimefrom, runtimeto, eventcity } = req.headers;

    let wowtagvideo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      wowtagvideo = fields.includes('0') ? req.files[0].filename : 'null';
    }

    await Event.findByIdAndUpdate(eventid, { $set: { eventtitle,
      eventcity,
      runtimefrom,
      runtimeto,
      wowtagvideo } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

exports.eventvenue = async (req, res, next) => {
  try {
    const { eventid, eventvenueaddressvisibility, eventvenueguestshare,
      onlineevent, inviteonlyevent, eventvenue, eventfaqs, faqquestion1,
      faqanswer1, faqquestion2, faqanswer2, faqquestion3, faqanswer3,
      faqquestion4, faqanswer4 } = req.body;

    const eventArray = [];

    await Event.findByIdAndUpdate(eventid, { $set: { eventvenueaddressvisibility,
      eventvenueguestshare,
      onlineevent,
      inviteonlyevent,
      eventvenue: [],
      eventfaqs: [],
      faqquestion1,
      faqanswer1,
      faqquestion2,
      faqanswer2,
      faqquestion3,
      faqanswer3,
      faqquestion4,
      faqanswer4 } },
    { safe: true, upsert: true, new: true });

    if (eventvenue !== undefined) {
      for (let i = 0; i < eventvenue.length; i += 1) {
        eventArray.push(Event.findByIdAndUpdate(eventid, { $push: { eventvenue: eventvenue[i] } },
          { safe: true, upsert: true, new: true }));
      }

      // await Promise.all(eventArray);
    }

    if (eventfaqs !== undefined) {
      for (let i = 0; i < eventfaqs.length; i += 1) {
        eventArray.push(Event.findByIdAndUpdate(eventid, { $push: { eventfaqs: eventfaqs[i] } },
          { safe: true, upsert: true, new: true }));
      }

      // await Promise.all(faqsArray);
    }

    if ((eventArray.length) > 0) {
      await Promise.all(eventArray);
    }


    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};


exports.eventtour = async (req, res, next) => {
  try {
    const { eventid, eventtouraddressvisibility, eventtourguestshare,
      onlineeventtour, inviteonlyeventtour, eventtour, numberofcitiestour } = req.body;

    const eventArray = [];

    await Event.findByIdAndUpdate(eventid, { $set: { eventtouraddressvisibility,
      eventtourguestshare,
      onlineeventtour,
      inviteonlyeventtour,
      numberofcitiestour,
      eventtour: [],
      eventfaqs: [],
    } },
    { safe: true, upsert: true, new: true });

    if (eventtour !== undefined) {
      for (let i = 0; i < eventtour.length; i += 1) {
        eventArray.push(Event.findByIdAndUpdate(eventid, { $push: { eventtour: eventtour[i] } },
          { safe: true, upsert: true, new: true }));
      }

      // await Promise.all(eventArray);
    }


    if ((eventArray.length) > 0) {
      await Promise.all(eventArray);
    }


    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};


exports.program = async (req, res, next) => {
  try {
    const { eventid, programschedule } = req.body;

    const programArray = [];

    await Event.findByIdAndUpdate(eventid, { $set: { programschedule: [] } },
      { safe: true, upsert: true, new: true });

    if (programschedule !== undefined) {
      for (let i = 0; i < programschedule.length; i += 1) {
        programArray.push(Event.findByIdAndUpdate(eventid,
          { $push: { programschedule: programschedule[i] } },
          { safe: true, upsert: true, new: true }));
      }

      await Promise.all(programArray);
    }

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};


exports.eventhighlights = async (req, res, next) => {
  try {
    const { eventid, eventguesttype1, eventspeakername1, eventspeakerlink1,
      eventspeakeractivities1, eventguesttype2, eventspeakername2,
      eventspeakerlink2, eventspeakeractivities2 } = req.headers;

    let eventhighlights1 = '';
    let eventhighlights2 = '';
    let eventhighlightsvideo1 = '';
    let eventhighlightsvideo2 = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      eventhighlights1 = fields.includes('eventhighlights1') ?
        files.eventhighlights1[0].filename : 'null';
      eventhighlights2 = fields.includes('eventhighlights2') ?
        files.eventhighlights2[0].filename : 'null';
      eventhighlightsvideo1 = fields.includes('eventhighlightsvideo1') ?
        files.eventhighlightsvideo1[0].filename : 'null';
      eventhighlightsvideo2 = fields.includes('eventhighlightsvideo2') ?
        files.eventhighlightsvideo2[0].filename : 'null';
    }

    await Event.findByIdAndUpdate(eventid, { $set: { eventguesttype1,
      eventguesttype2,
      eventspeakername1,
      eventspeakername2,
      eventspeakerlink1,
      eventspeakerlink2,
      eventspeakeractivities1,
      eventspeakeractivities2,
      eventhighlights1,
      eventhighlights2,
      eventhighlightsvideo1,
      eventhighlightsvideo2 } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

// Personal Event

exports.eventcontact = async (req, res, next) => {
  try {
    const { eventid, eventcontactname, eventcontactphone, eventcontactemail,
      eventcontactmessage, privateevent, registerrsvp, otherurl, giftregistryurl,
      donationsurl, eventnolinks } = req.body;

    await Event.findByIdAndUpdate(eventid, { $set: { eventcontactname,
      eventcontactphone,
      eventcontactemail,
      eventcontactmessage,
      privateevent,
      registerrsvp,
      otherurl,
      giftregistryurl,
      donationsurl,
      eventnolinks } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

// Professional Event

exports.proeventcontact = async (req, res, next) => {
  try {
    const { eventid, organisationname, eventcontactname, eventcontactphone,
      eventcontactemail, eventcontactmessage, keywordsearch } = req.body;

    await Event.findByIdAndUpdate(eventid, { $set: { organisationname,
      eventcontactname,
      eventcontactphone,
      eventcontactemail,
      eventcontactmessage,
      keywordsearch } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};


// Online Sales Event Links

exports.saleseventonlinelinks = async (req, res, next) => {
  try {
    const { eventid, onlinesalesobjective, onlinesalespromotioncountry, onlinesalespromotionstate,
      onlinesalespromotionurl } = req.body;

    await Event.findByIdAndUpdate(eventid, { $set: { onlinesalesobjective,
      onlinesalespromotioncountry,
      onlinesalespromotionstate,
      onlinesalespromotionurl } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

// Online Sales Physical Links

exports.saleseventphysicallinks = async (req, res, next) => {
  try {
    const { eventid, physicalsalespromotioncountry, physicalsalespromotionstate,
      physicalsalesstorelocation } = req.body;

    await Event.findByIdAndUpdate(eventid, { $set: {
      physicalsalesstorelocation: [],
      physicalsalespromotioncountry,
      physicalsalespromotionstate,
    } },
    { safe: true, upsert: true, new: true });

    const physicalStoreArray = [];

    if (physicalsalesstorelocation !== undefined) {
      for (let i = 0; i < physicalsalesstorelocation.length; i += 1) {
        physicalStoreArray.push(Event.findByIdAndUpdate(eventid,
          { $push: { physicalsalesstorelocation: physicalsalesstorelocation[i] } },
          { safe: true, upsert: true, new: true }));
      }

      await Promise.all(physicalStoreArray);
    }

    const event = await Event.findById(eventid, {});


    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

// Sales Event Offerings

exports.saleseventofferings = async (req, res, next) => {
  try {
    const { eventid, eventsalesservicename1, eventsalesdiscount1,
      eventsalescouponfrom1, eventsalescouponto1, eventsalesaction1,
      eventsalesterms1, eventsalesservicename2, eventsalesdiscount2,
      eventsalescouponfrom2, eventsalescouponto2, eventsalesaction2,
      eventsalesterms2 } = req.headers;

    let eventsalescoupon1 = '';
    let eventsalescoupon2 = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      eventsalescoupon1 = fields.includes('eventsalescoupon1') ?
        files.eventsalescoupon1[0].filename : 'null';
      eventsalescoupon2 = fields.includes('eventsalescoupon2') ?
        files.eventsalescoupon2[0].filename : 'null';
    }

    await Event.findByIdAndUpdate(eventid, { $set: { eventsalesservicename1,
      eventsalesdiscount1,
      eventsalescouponfrom1,
      eventsalescouponto1,
      eventsalesaction1,
      eventsalesterms1,
      eventsalesservicename2,
      eventsalesdiscount2,
      eventsalescouponfrom2,
      eventsalescouponto2,
      eventsalesaction2,
      eventsalesterms2,
      eventsalescoupon1,
      eventsalescoupon2 } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

// Online Sales Event Promote/contact

exports.saleseventpromote = async (req, res, next) => {
  try {
    const { eventid, organisationname, salesemail, salesphonenumber, saleshostmessage } = req.body;

    await Event.findByIdAndUpdate(eventid, { $set: { organisationname,
      salesemail,
      salesphonenumber,
      saleshostmessage } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};


/* ================================================================= */


/* exports.info = async (req, res, next) => {
  const { eventid, eventtype,eventdayscount, eventtopic, eventname, eventdescription, 
    eventcategory,
    eventstartdate, eventenddate, eventtimezone, runtimefrom, runtimeto,
    eventvenueaddressvisibility, eventvenueguestshare, eventtotaldays, eventcontactname,
    eventcontactphone, eventcontactemail, eventcontactmessage, privateevent,
    registerrsvp, giftregistryurl, donationsurl, eventnolinks, otherurl } = req.body;

  var {eventtypeint} = req.headers;

  eventtypeint = parseInt(eventtypeint,10)

  await Event.findByIdAndUpdate(eventid, { $set: {
    eventtype,
    eventtypeint,
    eventdayscount,
    eventtopic,
    eventname,
    eventdescription,
    eventcategory,
    eventstartdate,
    eventenddate,
    eventtimezone,
    runtimefrom,
    runtimeto,
    eventvenueaddressvisibility,
    eventvenueguestshare,
    eventtotaldays,
    eventcontactname,
    eventcontactphone,
    eventcontactemail,
    eventcontactmessage,
    privateevent,
    registerrsvp,
    giftregistryurl,
    donationsurl,
    eventnolinks,
    otherurl,
  } });

  const event = await Event.findById(eventid, {});

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: event,
  });
};


exports.create = async (req, res, next) => {
  try {
    const id = req.user._id;

    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    let wowtagvideo = '';
    let coverpage = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      wowtagvideo = fields.includes('wowtagvideo') ? files.wowtagvideo[0].filename : 'null';
      coverpage = fields.includes('coverpage') ? files.coverpage[0].filename : 'null';
    }

    const event = await new Event({
      userid: id,
      wowtagvideo,
      coverpage,
      createdAt,
    }).save();

    return res.json({ success: true, message: event });
  } catch (error) {
    return next(error);
  }
}; */

exports.feed = async (req, res, next) => {
  try {
    const id = req.user._id;

    const event = await Event.find({ userid: id })
      .sort({ createdAt: -1 })
      .populate('userid', 'wowtagid personalimage firstname lastname -_id');

    return res.json({ success: true, code: httpStatus.OK, message: event });
  } catch (error) {
    return next(error);
  }
};


exports.newfeed = async (req, res, next) => {
  const id = req.user._id;

  const friends = await User.findById(id, { friends: 1 });

  const userArray = [id];

  if (friends.friends.length === 0) {
    return res.json({
      success: false,
      code: httpStatus.NO_CONTENT,
      message: 'Connect with friends to see Event feeds',
    });
  }

  function pushFriends() {
    for (let i = 0; i < friends.friends.length; i += 1) {
      userArray.push(friends.friends[i]);
    }
  }

  pushFriends();


  const feedArray = [];

  function pullFeed() {
    for (let i = 0; i < userArray.length; i += 1) {
      feedArray.push(Event.find({ userid: userArray[i] })
        .populate('userid', 'wowtagid personalimage firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimage -_id')
        .lean(),
      );
      feedArray.push(Thought.find({ userid: userArray[i] })
        .populate('userid', 'wowtagid personalimage firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimage -_id')
        .lean(),
      );
    }
  }

  pullFeed();

  const finalArray = await Promise.all(feedArray);

  // const thought = await Thought.find({}, {}).lean();

  // function thoughtProcess() {
  //   for (let i = 0; i < thought.length; i += 1) {
  //     finalArray.push(thought[i]);
  //   }
  // }

  // thoughtProcess();


  const feedresult = finalArray.filter(item => item.length !== 0);


  const result = [];

  function done() {
    for (let i = 0; i < feedresult.length; i += 1) {
      for (let j = 0; j < feedresult[i].length; j += 1) {
        result.push(feedresult[i][j]);

        if (((feedresult[i][j]).wowsome)) {
          (feedresult[i][j]).wowsomecount = ((feedresult[i][j]).wowsome).length;
        } else if (!((feedresult[i][j]).wowsome)) {
          (feedresult[i][j]).wowsomecount = 0;
        }

        if (((feedresult[i][j]).comments)) {
          (feedresult[i][j]).commentcount = ((feedresult[i][j]).comments).length;
        } else if (!((feedresult[i][j]).comments)) {
          (feedresult[i][j]).commentcount = 0;
        }
      }
    }
  }

  done();


  const result2 = result.sort((a, b) => {
    const keyA = new Date(a.createdAt);
    const keyB = new Date(b.createdAt);
    if (keyA < keyB) return 1;
    if (keyA > keyB) return -1;
    return 0;
  });

  if (result2.length === 0) {
    return res.json({
      success: false,
      code: httpStatus.NO_CONTENT,
      message: 'No Events listed by your friends',
    });
  }


  return res.json({ success: true, code: httpStatus.OK, message: result2 });
};


/* BACKUP 20feb
// TODO - trycatch

exports.newfeed = async (req, res, next) => {
  const id = req.user._id;

  const friends = await User.findById(id, { friends: 1 });

  const userArray = [id];

  if (friends.friends.length === 0) {
    return res.json({
      success: false,
      code: httpStatus.NO_CONTENT,
      message: 'Connect with friends to see Event feeds',
    });
  }

  function pushFriends() {
    for (let i = 0; i < friends.friends.length; i += 1) {
      userArray.push(friends.friends[i]);
    }
  }

  pushFriends();


  const feedArray = [];

  function pullFeed() {
    for (let i = 0; i < userArray.length; i += 1) {
      feedArray.push(Event.find({ userid: userArray[i] })
        .populate('userid', 'wowtagid personalimage firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimage -_id')
        .lean(),
      );
    }
  }

  pullFeed();

  const finalArray = await Promise.all(feedArray);

  const feedresult = finalArray.filter(item => item.length !== 0);

  const result = [];

  function done() {
    for (let i = 0; i < feedresult.length; i += 1) {
      for (let j = 0; j < feedresult[i].length; j += 1) {
        result.push(feedresult[i][j]);

        if (((feedresult[i][j]).wowsome)) {
          (feedresult[i][j]).wowsomecount = ((feedresult[i][j]).wowsome).length;
        } else if (!((feedresult[i][j]).wowsome)) {
          (feedresult[i][j]).wowsomecount = 0;
        }

        if (((feedresult[i][j]).comments)) {
          (feedresult[i][j]).commentcount = ((feedresult[i][j]).comments).length;
        } else if (!((feedresult[i][j]).comments)) {
          (feedresult[i][j]).commentcount = 0;
        }
      }
    }
  }

  done();

  const result2 = result.sort((a, b) => {
    const keyA = new Date(a.createdAt);
    const keyB = new Date(b.createdAt);
    if (keyA < keyB) return 1;
    if (keyA > keyB) return -1;
    return 0;
  });

  if (result2.length === 0) {
    return res.json({
      success: false,
      code: httpStatus.NO_CONTENT,
      message: 'No Events listed by your friends',
    });
  }


  return res.json({ success: true, code: httpStatus.OK, message: result2 });
};
 */

/* 
  Event feed based on Interests

// TODO - trycatch

exports.newfeed = async (req, res, next) => {
  const id = req.user._id;

  const ownInterests = await User.findById(id, { interests: 1, _id: 0 });
  const otherInterests = await User.find({}, { interests: 1 });


  const userArray = [];

  function intersect() {
    for (let i = 0; i < otherInterests.length; i += 1) {
      if (intersection(ownInterests.interests, otherInterests[i].interests).length > 0) {
        userArray.push(otherInterests[i]._id);
      }
    }
  }

  intersect();

  const feedArray = [];

  function pullFeed() {
    for (let i = 0; i < userArray.length; i += 1) {
      feedArray.push(Event.find({ userid: userArray[i] })
        .populate('userid', 'wowtagid personalimage firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimage -_id')
        .lean(),
      );
    }
  }

  pullFeed();

  const finalArray = await Promise.all(feedArray);

  const feedresult = finalArray.filter(item => item.length !== 0);

  const result = [];

  function done() {
    for (let i = 0; i < feedresult.length; i += 1) {
      for (let j = 0; j < feedresult[i].length; j += 1) {
        result.push(feedresult[i][j]);

        if (((feedresult[i][j]).wowsome)) {
          (feedresult[i][j]).wowsomecount = ((feedresult[i][j]).wowsome).length;
        } else if (!((feedresult[i][j]).wowsome)) {
          (feedresult[i][j]).wowsomecount = 0;
        }

        if (((feedresult[i][j]).comments)) {
          (feedresult[i][j]).commentcount = ((feedresult[i][j]).comments).length;
        } else if (!((feedresult[i][j]).comments)) {
          (feedresult[i][j]).commentcount = 0;
        }
      }
    }
  }

  done();

  const result2 = result.sort((a, b) => {
    const keyA = new Date(a.createdAt);
    const keyB = new Date(b.createdAt);
    if (keyA < keyB) return 1;
    if (keyA > keyB) return -1;
    return 0;
  });


  return res.json({ success: true, code: httpStatus.OK, message: result2 });
};
 */


exports.androidfeed = async (req, res, next) => {
  // const feed = await Event.paginate({}, { page, limit: 5 });
  // return res.json({ success: true, code: httpStatus.OK, message: feed });

  const id = req.user._id;

  const number = 2; // change this


  const limit = number;

  const { page } = req.body;

  const friends = await User.findById(id, { friends: 1 });

  const userArray = [id];

  if (friends.friends.length === 0) {
    return res.json({
      success: false,
      code: httpStatus.NO_CONTENT,
      message: 'Connect with friends to see Event feeds',
    });
  }

  function pushFriends() {
    for (let i = 0; i < friends.friends.length; i += 1) {
      userArray.push(friends.friends[i]);
    }
  }

  pushFriends();


  const feedArray = [];

  function pullFeed() {
    for (let i = 0; i < userArray.length; i += 1) {
      feedArray.push(Event.find({ userid: userArray[i] })
        .populate('userid', 'wowtagid personalimage firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimage -_id')
        .lean(),
      );
    }
  }

  pullFeed();

  const finalArray = await Promise.all(feedArray);

  const feedresult = finalArray.filter(item => item.length !== 0);

  const result = [];

  function done() {
    for (let i = 0; i < feedresult.length; i += 1) {
      for (let j = 0; j < feedresult[i].length; j += 1) {
        result.push(feedresult[i][j]);

        if (((feedresult[i][j]).wowsome)) {
          (feedresult[i][j]).wowsomecount = ((feedresult[i][j]).wowsome).length;
        } else if (!((feedresult[i][j]).wowsome)) {
          (feedresult[i][j]).wowsomecount = 0;
        }

        if (((feedresult[i][j]).comments)) {
          (feedresult[i][j]).commentcount = ((feedresult[i][j]).comments).length;
        } else if (!((feedresult[i][j]).comments)) {
          (feedresult[i][j]).commentcount = 0;
        }
      }
    }
  }

  done();

  const result2 = result.sort((a, b) => {
    const keyA = new Date(a.createdAt);
    const keyB = new Date(b.createdAt);
    if (keyA < keyB) return 1;
    if (keyA > keyB) return -1;
    return 0;
  });

  if (result2.length === 0) {
    return res.json({
      success: false,
      code: httpStatus.NO_CONTENT,
      message: 'No Events listed by your friends',
    });
  }

  const total = result2.length;
  const pages = Math.ceil(total / limit);

  // console.log(Object.keys(result2))

  const result3 = result2.slice((page * number) - number, page * number);

  const message = {
    docs: result3,
    total,
    limit,
    page,
    pages,
  };

  return res.json({ success: true, code: httpStatus.OK, message });
};


/* 

old Android event feed

exports.androidfeed = async (req, res, next) => {
  // const id = req.user._id;

  // const feed = await Event.paginate({}, { offset: 20, limit: 10 }).then(function(result) {
  //   // ...
  // });

  const { page } = req.body;

  const feed = await Event.paginate({}, { page, limit: 5 });


  return res.json({ success: true, code: httpStatus.OK, message: feed });
};
 */

/* exports.androidfeed = async (req, res, next) => {
  const id = req.user._id;
  const { page } = req.body;

  // const feed = await Event.paginate({}, { page, limit: 5 });


  const ownInterests = await User.findById(id, { interests: 1, _id: 0 });
  const otherInterests = await User.find({}, { interests: 1 });


  const userArray = [];

  function intersect() {
    for (let i = 0; i < otherInterests.length; i += 1) {
      if (intersection(ownInterests.interests, otherInterests[i].interests).length > 0) {
        userArray.push(otherInterests[i]._id);
      }
    }
  }

  intersect();

  const feedArray = [];

  function pullFeed() {
    for (let i = 0; i < userArray.length; i += 1) {
      // feedArray.push(Event.find({ userid: userArray[i] })
      //   .populate('userid', 'wowtagid personalimage firstname lastname designation')
      //   .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
      //   .populate('comments.userid', 'wowtagid firstname lastname personalimage -_id')
      //   .lean(),
      // );
      feedArray.push(Event.paginate({ userid: userArray[i] },
      ));
    }
  }

  pullFeed();

  const finalArray = await Promise.all(feedArray);

  const feedresult = finalArray.filter(item => ((item.docs).length) !== 0);

  const result = [];

  function done() {
    for (let i = 0; i < feedresult.length; i += 1) {
      for (let j = 0; j < feedresult[i].length; j += 1) {
        result.push(feedresult[i][j]);

        if (((feedresult[i][j]).wowsome)) {
          (feedresult[i][j]).wowsomecount = ((feedresult[i][j]).wowsome).length;
        } else if (!((feedresult[i][j]).wowsome)) {
          (feedresult[i][j]).wowsomecount = 0;
        }

        if (((feedresult[i][j]).comments)) {
          (feedresult[i][j]).commentcount = ((feedresult[i][j]).comments).length;
        } else if (!((feedresult[i][j]).comments)) {
          (feedresult[i][j]).commentcount = 0;
        }
      }
    }
  }

  done();

  const result2 = result.sort((a, b) => {
    const keyA = new Date(a.createdAt);
    const keyB = new Date(b.createdAt);
    if (keyA < keyB) return 1;
    if (keyA > keyB) return -1;
    return 0;
  });


  return res.json({ success: true, code: httpStatus.OK, message: feedresult });
}; */


// Deprecated newfeed

/* exports.newfeedold = async (req, res, next) => {
  const id = req.user._id;

  // const event = await Event.find({ userid: id })
  //   .sort({ createdAt: -1 })
  //   .populate('userid', 'wowtagid personalimage firstname lastname -_id');

  const ownInterests = await User.findById(id, { interests: 1, _id: 0 });
  const otherInterests = await User.find({}, { interests: 1 });


    // concat interests
  function allInterests(){
    for(var i=0;i<interests.length;i++){
      const all = interests[i].interests;
      for(var j=0;j<all.length;j++){
        interestsArr.push(all[j]);
      }
    }
  }

  allInterests()


  const userArray = [];

  function intersect() {
    for (let i = 0; i < otherInterests.length; i += 1) {
      // console.log(intersection(ownInterests.interests,otherInterests[i].interests))
      if (intersection(ownInterests.interests, otherInterests[i].interests).length > 0) {
        userArray.push(otherInterests[i]._id);
      }
    }
  }

  intersect();

  const feedArray = [];

  function pullFeed() {
    for (let i = 0; i < userArray.length; i += 1) {
      feedArray.push(Event.find({ userid: userArray[i] })
        // .sort({ createdAt: -1 })
        .populate('userid', 'wowtagid personalimage firstname lastname designation -_id'),
      );
    }
  }

  pullFeed();

  const finalArray = await Promise.all(feedArray);

  const feedresult = finalArray.filter(item => item.length !== 0);

  const result = [];

  function done() {
    for (let i = 0; i < feedresult.length; i += 1) {
      for (let j = 0; j < feedresult[i].length; j += 1) {
        result.push(feedresult[i][j]);
      }
    }
  }

  done();

  const result2 = result.sort((a, b) => {
    const keyA = new Date(a.createdAt);
    const keyB = new Date(b.createdAt);
    if (keyA < keyB) return 1;
    if (keyA > keyB) return -1;
    return 0;
  });


  // console.log(Interests.interests);
  // console.log(ownInterests.interests);
  // console.log(otherInterests[0].interests);

  // console.log(intersection(ownInterests.interests,otherIntersets[2].interests))

  return res.json({ success: true, code: httpStatus.OK, message: result2 });
};
 */

/* exports.todaysfeedold = async(req, res, next) => {

  try {
    
    const id = req.user._id;

    const startDate = moment('000001', 'hmmss').format('YYYY/MM/DD H:mm a');
    const endDate = moment('235959', 'hmmss').format('YYYY/MM/DD H:mm a');


    const todaysEvent = await Event.aggregate([
      {$project: {
        eventstartdate: 1,
        "startdateverify": {$and: [ {$gte: ["$eventstartdate",startDate]}, 
        {$lte: ["$eventstartdate",endDate]} ]},
      }}
    ])

    return res.json({
      success: true,
      todaysEvent
    })
  } catch (error) {
    return next(error)
  }

} */


exports.todaysfeed = async (req, res, next) => {
  const id = req.user._id;

  const ownInterests = await User.findById(id, { interests: 1, _id: 0 });
  const otherInterests = await User.find({}, { interests: 1 });

  const result3 = 'Date format should be changed to YYYY/MM/DD in ' +
    'both Web and Mobile.Eg: 2018/02/09 11:30.Time is not a matter';

  let execute = true;

  const checkdateformat = await Event.find({}, { eventstartdate: 1 });

  const dateFormatArray = [];

  function dateFormat() {
    for (let i = 0; i < checkdateformat.length; i += 1) {
      dateFormatArray.push(moment(checkdateformat[i].eventstartdate, 'YYYY/MM/DD').isValid());
    }
  }

  dateFormat();


  if (includes(dateFormatArray, false)) {
    execute = false;
    // console.log(false)
  } else {
    execute = true;
    // console.log(true)
  }

  // console.log(dateFormatArray)

  // console.log(execute)


  //   const startDate = moment('000001', 'hmmss').format('YYYY/MM/DD H:mm:ss');
  // // const startDate = moment('235959', 'hmmss').subtract(1, 'day').format('YYYY/MM/DD H:mm:ss');
  // const endDate = moment('235959', 'hmmss').format('YYYY/MM/DD H:mm:ss'); 
  // // const startDate = moment('235959', 'hmmss').subtract(1, 'day').format('YYYY/MM/DD H:mm:ss');


  // const todaysEvent = await Event.find({$and: [{eventstartdate: 
  // {$gte: startDate}},{eventstartdate: {$lte: endDate}}]}, {});


  // const startDate = moment('235959', 'hmmss').subtract(1, 'day').add(1,'second').
  // format('YYYY/MM/DD H:mm:ss');

  // const endDate = moment('235959', 'hmmss').format('YYYY/MM/DD H:mm:ss');


  if (execute === true) {
    const startDate = moment().format('YYYY/MM/DD');

    const endDate = moment().add(1, 'day').format('YYYY/MM/DD');

    const userArray = [];

    function intersect() {
      for (let i = 0; i < otherInterests.length; i += 1) {
        if (intersection(ownInterests.interests, otherInterests[i].interests).length > 0) {
          userArray.push(otherInterests[i]._id);
        }
      }
    }

    intersect();

    const feedArray = [];

    function pullFeed() {
      for (let i = 0; i < userArray.length; i += 1) {
        feedArray.push(Event.find({ userid: userArray[i],
          $and: [{ eventstartdate: { $gte: startDate } }, { eventstartdate: { $lt: endDate } }],
        },
        { eventname: 1, runtimefrom: 1, runtimeto: 1, eventstartdate: 1, eventtitle: 1, userid: 1 }).populate('userid', 'wowtagid personalimage'),
        );
      }
    }

    pullFeed();

    const finalArray = await Promise.all(feedArray);

    const feedresult = finalArray.filter(item => item.length !== 0);

    const result = [];

    function done() {
      for (let i = 0; i < feedresult.length; i += 1) {
        for (let j = 0; j < feedresult[i].length; j += 1) {
          result.push(feedresult[i][j]);
        }
      }
    }

    done();


    const result2 = result.sort((a, b) => {
      const keyA = new Date(a.eventstartdate);
      const keyB = new Date(b.eventstartdate);
      if (keyA < keyB) return 1;
      if (keyA > keyB) return -1;
      return 0;
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: result2,
    });
  }


  return res.json({
    success: false,
    code: httpStatus.OK,
    message: result3,
  });
};


/* exports.todaysfeed = async (req, res, next) => {
  const id = req.user._id;

  const ownInterests = await User.findById(id, { interests: 1, _id: 0 });
  const otherInterests = await User.find({}, { interests: 1 });


  //   const startDate = moment('000001', 'hmmss').format('YYYY/MM/DD H:mm:ss');
  // // const startDate = moment('235959', 'hmmss').subtract(1, 'day').format('YYYY/MM/DD H:mm:ss');
  // const endDate = moment('235959', 'hmmss').format('YYYY/MM/DD H:mm:ss'); 
  // // const startDate = moment('235959', 'hmmss').subtract(1, 'day').format('YYYY/MM/DD H:mm:ss');
 

  // const todaysEvent = await Event.find({$and: [{eventstartdate: 
  // {$gte: startDate}},{eventstartdate: {$lte: endDate}}]}, {});


  // const startDate = moment('235959', 'hmmss').subtract(1, 'day').add(1,'second').
  // format('YYYY/MM/DD H:mm:ss');

  // const endDate = moment('235959', 'hmmss').format('YYYY/MM/DD H:mm:ss');

  const startDate = moment().format('YYYY/MM/DD');

  const endDate = moment().add(1, 'day').format('YYYY/MM/DD');

  const userArray = [];

  function intersect() {
    for (let i = 0; i < otherInterests.length; i += 1) {
      if (intersection(ownInterests.interests, otherInterests[i].interests).length > 0) {
        userArray.push(otherInterests[i]._id);
      }
    }
  }

  intersect();

  const feedArray = [];

  function pullFeed() {
    for (let i = 0; i < userArray.length; i += 1) {
      feedArray.push(Event.find({ userid: userArray[i],
        $and: [{ createdAt: { $gte: startDate } }, { createdAt: { $lt: endDate } }],
      },
      { eventname: 1, runtimefrom: 1, runtimeto: 1, createdAt: 1, eventtitle: 1, userid: 1 }).
      populate('userid', 'wowtagid personalimage'),
      );
    }
  }

  pullFeed();

  const finalArray = await Promise.all(feedArray);

  const feedresult = finalArray.filter(item => item.length !== 0);

  const result = [];

  function done() {
    for (let i = 0; i < feedresult.length; i += 1) {
      for (let j = 0; j < feedresult[i].length; j += 1) {
        result.push(feedresult[i][j]);
      }
    }
  }

  done();

  const result2 = result.sort((a, b) => {
    const keyA = new Date(a.createdAt);
    const keyB = new Date(b.createdAt);
    if (keyA < keyB) return 1;
    if (keyA > keyB) return -1;
    return 0;
  });


  return res.json({
    success: true,
    code: httpStatus.OK,
    message: result2,
  });
};
 */

exports.myfeeds = async (req, res, next) => {
  const id = req.user._id;

  const feedresult = await Event.find({ userid: id }, {})
    .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
    .populate('comments.userid', 'wowtagid firstname lastname personalimage -_id').lean();

  function done() {
    for (let i = 0; i < feedresult.length; i += 1) {
      if (((feedresult[i]).wowsome)) {
        (feedresult[i]).wowsomecount = ((feedresult[i]).wowsome).length;
      } else if (!((feedresult[i]).wowsome)) {
        (feedresult[i]).wowsomecount = 0;
      }

      if (((feedresult[i]).comments)) {
        (feedresult[i]).commentcount = ((feedresult[i]).comments).length;
      } else if (!((feedresult[i]).comments)) {
        (feedresult[i]).commentcount = 0;
      }
    }
  }

  done();

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: feedresult,
  });
};


exports.hubbfeeds = async (req, res, next) => {
  const id = req.user._id;

  const feedresult = await Event.find({ userid: id }, {}).lean();

  // function done() {
  //   for (let i = 0; i < feedresult.length; i += 1) {
  //     if (((feedresult[i]).rsvp)) {
  //       (feedresult[i]).wowsomecount = ((feedresult[i]).wowsome).length;
  //     } else if (!((feedresult[i]).wowsome)) {
  //       (feedresult[i]).wowsomecount = 0;
  //     }

  //     if (((feedresult[i]).comments)) {
  //       (feedresult[i]).commentcount = ((feedresult[i]).comments).length;
  //     } else if (!((feedresult[i]).comments)) {
  //       (feedresult[i]).commentcount = 0;
  //     }
  //   }
  // }

  // done();

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: feedresult,
  });
};


/* ---------------- FEEDS END -------------- */

exports.wowsome = async (req, res, next) => {
  try {
    const userid = req.user._id;
    const { eventid } = req.body;

    const checksome = await Event.aggregate([
      { $match: { _id: ObjectId(eventid) } },
      { $unwind: '$wowsome' },
      { $match: { 'wowsome.userid': ObjectId(userid) } },
    ]);

    if (checksome.length === 0) {
      await Event.findByIdAndUpdate(eventid, { $push:
        { wowsome: { userid } } });

      const result = await Event.findById(eventid, { wowsome: 1 });
      const wowsomes = (result.wowsome).length;

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: result,
        wowsomes,
      });
    }

    const result = await Event.findById(eventid, { wowsome: 1 });
    const wowsomes = (result.wowsome).length;

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: result,
      wowsomes,
    });
  } catch (error) {
    return next(error);
  }
};


// CHECK

exports.thoughtswowsome = async (req, res, next) => {
  try {
    const userid = req.user._id;
    const { thoughtid } = req.body;

    const checksome = await Thought.aggregate([
      { $match: { _id: ObjectId(thoughtid) } },
      { $unwind: '$wowsome' },
      { $match: { 'wowsome.userid': ObjectId(userid) } },
    ]);

    if (checksome.length === 0) {
      await Thought.findByIdAndUpdate(thoughtid, { $push:
        { wowsome: { userid } } });

      const result = await Thought.findById(thoughtid, { wowsome: 1 });
      const wowsomes = (result.wowsome).length;

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: result,
        wowsomes,
      });
    }

    const result = await Thought.findById(thoughtid, { wowsome: 1 });
    const wowsomes = (result.wowsome).length;

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: result,
      wowsomes,
    });
  } catch (error) {
    return next(error);
  }
};


/* exports.wowsomeold = async (req, res, next) => {
  const { eventid } = req.body;

  const event = await Event.findById(eventid, { wowsome: 1 });
  const like = event.wowsome + 1;

  await Event.findByIdAndUpdate(eventid, { $set: { wowsome: like } });

  const result = await Event.findById(eventid, { wowsome: 1 });

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: result,
  });
}; */


exports.getrsvp = async (req, res, next) => {
  try {
    const userid = req.user._id;
    const { eventid } = req.body;

    const checkrsvp = await Event.aggregate([
      { $match: { _id: ObjectId(eventid) } },
      { $unwind: '$rsvp' },
      { $match: { 'rsvp.userid': ObjectId(userid) } },
    ]);

    if (checkrsvp.length === 0) {
      const result = [
        {
          _id: eventid,
          rsvp: [],
        },
      ];

      return res.json({
        success: true,
        message: result,
      });
    }

    const result = await Event.find({ _id: eventid, 'rsvp.userid': userid }, { 'rsvp.$': 1 })
      .populate('rsvp.userid', 'wowtagid personalimage firstname lastname -_id');

    return res.json({
      success: true,
      message: result,
    });
  } catch (error) {
    return next(error);
  }
};


exports.postrsvp = async (req, res, next) => {
  try {
    const userid = req.user._id;
    const { eventid, extra } = req.body;

    // const event = await Event.findById(eventid, { rsvp: 1 });

    const checkrsvp = await Event.aggregate([
      { $match: { _id: ObjectId(eventid) } },
      { $unwind: '$rsvp' },
      { $match: { 'rsvp.userid': ObjectId(userid) } },
    ]);

    if (checkrsvp.length === 0) {
      await Event.findByIdAndUpdate(eventid, { $push:
        { rsvp: { userid, extra } } });

      const result = await Event.find({ _id: eventid, 'rsvp.userid': userid }, { 'rsvp.$': 1 })
        .populate('rsvp.userid', 'wowtagid personalimage firstname lastname -_id');
      return res.json({
        success: true,
        message: result,
      });
    }

    await Event.update({ _id: eventid, 'rsvp.userid': userid },
      { $set: { 'rsvp.$.extra': extra } });

    const result = await Event.find({ _id: eventid, 'rsvp.userid': userid }, { 'rsvp.$': 1 })
      .populate('rsvp.userid', 'wowtagid personalimage firstname lastname -_id');

    return res.json({
      success: true,
      message: result,
    });
  } catch (error) {
    return next(error);
  }
};

exports.postcomment = async (req, res, next) => {
  const userid = req.user._id;
  const { eventid, comment } = req.body;
  const commentedAt = moment().format('YYYY/MM/DD H:mm:ss');

  await Event.findByIdAndUpdate(eventid, { $push:
    { comments: { userid, comment, commentedAt } } });


  const result = await Event.findById(eventid, { comments: 1 })
    .populate('comments.userid', 'wowtagid personalimage firstname lastname')
    .lean();

  function addCount() {
    if (result.comments) {
      result.commentcount = (result.comments).length;
    } else if (!(result.comments)) {
      result.commentcount = 0;
    }
  }

  addCount();


  return res.json({
    success: true,
    message: result,
  });
};

// CHECK

exports.postthoughtscomment = async (req, res, next) => {
  const userid = req.user._id;
  const { thoughtid, comment } = req.body;
  const commentedAt = moment().format('YYYY/MM/DD H:mm:ss');

  await Thought.findByIdAndUpdate(thoughtid, { $push:
    { comments: { userid, comment, commentedAt } } });


  const result = await Thought.findById(thoughtid, { comments: 1 })
    .populate('comments.userid', 'wowtagid personalimage firstname lastname')
    .lean();

  function addCount() {
    if (result.comments) {
      result.commentcount = (result.comments).length;
    } else if (!(result.comments)) {
      result.commentcount = 0;
    }
  }

  addCount();


  return res.json({
    success: true,
    message: result,
  });
};


exports.getcomment = async (req, res, next) => {
  try {
    const { eventid } = req.body;

    const result = await Event.findById(eventid, { comments: 1 })
      .populate('comments.userid', 'wowtagid personalimage firstname lastname');

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: result,
    });
  } catch (error) {
    return next(error);
  }
};

// CHECK

exports.getthoughtscomment = async (req, res, next) => {
  try {
    const { thoughtid } = req.body;

    const result = await Thought.findById(thoughtid, { comments: 1 })
      .populate('comments.userid', 'wowtagid personalimage firstname lastname');

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: result,
    });
  } catch (error) {
    return next(error);
  }
};


// Professional Event

exports.proengagementform = async (req, res, next) => {
  try {
    const { eventid, engagementformtype, engagementformaction, fullname, wowtagid, email, phone,
      address1, address2, city, zipcode, country, gender } = req.body;

    await Event.findByIdAndUpdate(eventid, { $set: { 'audienceengagementform.fullname': fullname,
      'audienceengagementform.wowtagid': wowtagid,
      'audienceengagementform.email': email,
      'audienceengagementform.phone': phone,
      'audienceengagementform.address1': address1,
      'audienceengagementform.address2': address2,
      'audienceengagementform.city': city,
      'audienceengagementform.zipcode': zipcode,
      'audienceengagementform.country': country,
      'audienceengagementform.gender': gender,
      engagementformtype,
      engagementformaction,
    } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

// Professional Event

exports.proengagementurl = async (req, res, next) => {
  try {
    const { eventid, donationsurl, websiteurl, eventnolinks, engagementurl, engagementformtype,
      engagementformaction } = req.body;

    const urlArray = [];

    await Event.findByIdAndUpdate(eventid, { $set: { audeinceengagementurl:
      { engagementurl: [] } } },
    { safe: true, upsert: true, new: true });


    if (engagementurl !== undefined) {
      for (let i = 0; i < engagementurl.length; i += 1) {
        urlArray.push(
          Event.update({ _id: eventid }, { $push: { 'audeinceengagementurl.engagementurl': engagementurl[i] } },
            { safe: true, upsert: true, new: true }),
        );
      }

      await Promise.all(urlArray);
    }

    await Event.findByIdAndUpdate(eventid, { $set: { 'audeinceengagementurl.donationsurl': donationsurl,
      'audeinceengagementurl.websiteurl': websiteurl,
      'audeinceengagementurl.eventnolinks': eventnolinks,
      engagementformtype,
      engagementformaction } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};

// Professional Event

exports.proengagementcoupon = async (req, res, next) => {
  try {
    const { eventid, couponcode, couponexpirydate, termsandconditions, engagementformtype,
      engagementformaction } = req.headers;

    let couponimage = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      couponimage = fields.includes('0') ? req.files[0].filename : 'null';
    }

    await Event.findByIdAndUpdate(eventid, { $set: { 'audienceengagementcoupon.couponcode': couponcode,
      'audienceengagementcoupon.couponexpirydate': couponexpirydate,
      'audienceengagementcoupon.termsandconditions': termsandconditions,
      'audienceengagementcoupon.couponimage': couponimage,
      engagementformtype,
      engagementformaction } });

    const event = await Event.findById(eventid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: event,
    });
  } catch (error) {
    return next(error);
  }
};


// exports.deleteevent = async (req, res, next) => {
//   try {
//     const { eventid } = req.body;

//     const event = await Event.findByIdAndRemove(eventid, {});

//     if (event !== null) {
//       return res.json({
//         success: true,
//         code: httpStatus.OK,
//         message: 'Event was successfully removed',
//       });
//     }

//     return res.json({
//       success: false,
//       code: httpStatus.NOT_FOUND,
//       message: 'Event doesnot exist',
//     });
//   } catch (error) {
//     return next(error);
//   }
// };


exports.deleteevent = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { eventid } = req.body;

    const checkevent = await Event.findById(eventid, {});

    if (checkevent === null) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Event doesnot exist',
      });
    }

    const checkuser = await Event.findById(eventid, { userid: 1 });

    console.log(ObjectId(checkuser.userid), ObjectId(id));

    if (String(checkuser.userid) === String(id)) {
      await Event.findByIdAndRemove(eventid, {});

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Event was successfully removed',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.UNAUTHORIZED,
      message: "You don't have permission to delete this event",
    });
  } catch (error) {
    return next(error);
  }
};

// CHECK

exports.deletethought = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { thoughtid } = req.body;

    const checkthought = await Thought.findById(thoughtid, {});

    if (checkthought === null) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Thought doesnot exist',
      });
    }

    const checkuser = await Thought.findById(thoughtid, { userid: 1 });

    console.log(ObjectId(checkuser.userid), ObjectId(id));

    if (String(checkuser.userid) === String(id)) {
      await Thought.findByIdAndRemove(thoughtid, {});

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Thought was successfully removed',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.UNAUTHORIZED,
      message: "You don't have permission to delete this Thought",
    });
  } catch (error) {
    return next(error);
  }
};


// exports.thoughtstext = async (req, res, next) => {
//   try {
//     const { text, eventtype } = req.body;
//     const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

//     const thought = await new Thought({
//       text,
//       eventtype,
//       createdAt,
//     }).save();

//     return res.json({
//       success: true,
//       code: httpStatus.OK,
//       message: thought,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };


exports.thoughts = async (req, res, next) => {
  try {
    const id = req.user._id;
    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    const { eventtype, thoughtstext } = req.headers;

    let thoughtsimage = '';
    let thoughtsvideo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      thoughtsimage = fields.includes('thoughtsimage') ?
        files.thoughtsimage[0].filename : 'null';
      thoughtsvideo = fields.includes('thoughtsvideo') ?
        files.thoughtsvideo[0].filename : 'null';
    }

    const thought = await new Thought({
      userid: id,
      thoughtstext,
      thoughtsimage,
      thoughtsvideo,
      eventtype,
      createdAt,
    }).save();

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: thought,
    });
  } catch (error) {
    return next(error);
  }
};


/* exports.thoughtsvideo = async (req, res, next) => {
  try {
    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    const { eventtype } = req.headers;

    let thoughtsfile = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      thoughtsfile = fields.includes('0') ? req.files[0].filename : 'null';
    }

    const thought = await new Thought({
      file: thoughtsfile,
      eventtype,
      createdAt,
    }).save();

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: thought,
    });
  } catch (error) {
    return next(error);
  }
}; */


//= =====================================================================//


exports.testupload = async (req, res, next) => {
  try {
    let wowtagvideo1 = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);

      wowtagvideo1 = fields.includes('wowtagvideo1') ? files.wowtagvideo1[0].filename : 'null';
    }

    return res.json({ success: true, message: wowtagvideo1 });
  } catch (error) {
    return next(error);
  }
};

exports.getwowtag = async (req, res, next) => {
  try {
    const wowtag = await User.find({}, { wowtagid: 1 });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: wowtag,
    });
  } catch (error) {
    return next(error);
  }
};

exports.keywordsuggestion = async (req, res, next) => {
  const { search } = req.body;

  let splitted = '';

  function words() {
    const parts = search.split(' ');

    for (let i = 0; i < parts.length; i += 1) {
      splitted += parts[i];

      if (i < parts.length - 1) {
        splitted += '|';
      }
    }

    return splitted;
  }

  words();

  const reg = new RegExp(splitted, 'gi');

  const list = await Keyword.find({ word: reg }, {});

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: list,
  });
};


/* Nearby Events List for Android */

exports.addnearbyevent = async (req, res, next) => {
  const { eventtype } = req.headers;
  let eventlogo = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);
    eventlogo = fields.includes('0') ?
      req.files[0].filename : 'null';
  }

  const nearbyevent = await new Nearby({
    eventtype,
    eventlogo,
  }).save();

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: nearbyevent,
  });
};


exports.adddumpevent = async (req, res, next) => {
  const { eventtype } = req.headers;
  let eventlogo = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);
    eventlogo = fields.includes('0') ?
      req.files[0].filename : 'null';
  }

  const dumpevent = await new Dump({
    eventtype,
    eventlogo,
  }).save();

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: dumpevent,
  });
};


/* exports.getnearbyevents = async (req, res, next) => {
  const nearbyevents = await Nearby.find({}, {});

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: nearbyevents,
  });
}; */

exports.getnearbyeventslist = async (req, res, next) => {
  const nearbyevents = await Dump.find({}, {});

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: nearbyevents,
  });
};

exports.getnearbyevents = async (req, res, next) => {
  try {
    const { location } = req.body;

    const event = await Event.find({ 'eventvenue.eventvenuecity': location }, {});

    const feedresult = event.filter(item => item.eventtype !== 'personal_event');

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: feedresult,
    });
  } catch (error) {
    return next(error);
  }
};
