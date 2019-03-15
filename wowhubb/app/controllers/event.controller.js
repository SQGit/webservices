const httpStatus = require('http-status');
const User = require('../models/user.model');
const Event = require('../models/event.model');
const Group = require('../models/group.model');
const Thought = require('../models/thought.model');
const Keyword = require('../models/keyword.model');
const moment = require('moment');
const { includes } = require('lodash');
// const { intersection } = require('lodash');
// const mime = require('mime');

// const path = require('path');
// const fs = require('fs');

// const transporter = require('../middlewares/mail');
// const Email = require('email-templates');

/* SG Config */

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey('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');

/*  */

/* Twilio Config */
const twilio = require('twilio');

const accountSid = 'ACc04aaaa52c3762a0a051b264d229d43e';
const authToken = 'd8b0a4f0ef8ec9e33e5a08f52cbf526e';

const client = twilio(accountSid, authToken);


/*  */


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
    let coverpageurl = '';


    if (req.files !== undefined) {
      const files = req.files;
      // console.log(files)
      const fields = Object.keys(files);

      coverpage = fields.includes('0') ? req.files[0].public_id : 'null';
      coverpageurl = fields.includes('0') ? req.files[0].url : 'null';
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
      coverpageurl,
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

// Android create event details

exports.androideventdetails = async (req, res, next) => {
  try {
    const id = req.user._id;

    const { eventtype, eventtitle, eventname, eventcategory,
      eventstartdate, eventenddate, eventtimezone, eventdescription,
      runtimefrom, runtimeto } = req.headers;

    let { eventtypeint } = req.headers;

    eventtypeint = parseInt(eventtypeint, 10);

    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    let coverpage = '';
    let wowtagvideo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);

      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].public_id : 'null';
      coverpageurl = fields.includes('coverpage') ? req.files.coverpage[0].url : 'null';


      wowtagvideo = fields.includes('wowtagvideo') ? req.files.wowtagvideo[0].public_id : 'null';
      wowtagvideourl = fields.includes('wowtagvideo') ? req.files.wowtagvideo[0].url : 'null';
      wowtagvideothumb = fields.includes('wowtagvideo') ? (req.files.wowtagvideo[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${wowtagvideo}.jpg` : 'null') : 'null';
    }

    const event = await new Event({
      userid: id,
      eventtype,
      eventtypeint,
      eventtitle,
      eventname,
      eventcategory,
      eventstartdate,
      eventenddate,
      eventtimezone,
      eventdescription,
      runtimefrom,
      runtimeto,
      wowtagvideo,
      wowtagvideourl,
      wowtagvideothumb,
      coverpage,
      coverpageurl,
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
    let coverpageurl = '';

    if (req.files !== undefined) {
      const files = req.files;
      // console.log(files)
      const fields = Object.keys(files);

      coverpage = fields.includes('0') ? req.files[0].public_id : 'null';
      coverpageurl = fields.includes('0') ? req.files[0].url : 'null';
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
      coverpageurl,
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
         eventdescription, eventstartdate, eventenddate, eventticketurl, organisationname } = req.headers;

    let { eventtypeint } = req.headers;

    eventtypeint = parseInt(eventtypeint, 10);

    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    let coverpage = '';
    let organisationlogo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);

      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].public_id : 'null';
      coverpageurl = fields.includes('coverpage') ? req.files.coverpage[0].url : 'null';

      organisationlogo = fields.includes('organisationlogo') ? req.files.organisationlogo[0].public_id : 'null';
      organisationlogourl = fields.includes('organisationlogo') ? req.files.organisationlogo[0].url : 'null';
    }

    const event = await new Event({
      userid: id,
      eventtype,
      eventtypeint,
      eventdayscount,
      eventcategory,
      eventname,
      tickettype,
      eventdescription,
      eventstartdate,
      eventenddate,
      eventticketurl,
      coverpage,
      coverpageurl,
      organisationname,
      organisationlogo,
      organisationlogourl,
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
      eventname, tickettype, eventdescription, organisationname,
    } = req.headers;

    let { eventtypeint } = req.headers;

    eventtypeint = parseInt(eventtypeint, 10);

    let coverpage = '';
    let organisationlogo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);

      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].public_id : 'null';
      coverpageurl = fields.includes('coverpage') ? req.files.coverpage[0].url : 'null';

      organisationlogo = fields.includes('organisationlogo') ? req.files.organisationlogo[0].public_id : 'null';
      organisationlogourl = fields.includes('organisationlogo') ? req.files.organisationlogo[0].url : 'null';
    }

    await Event.findByIdAndUpdate(eventid, { $set: {
      eventtype,
      eventtypeint,
      eventdayscount,
      eventcategory,
      eventname,
      tickettype,
      eventdescription,
      coverpage,
      coverpageurl,
      organisationname,
      organisationlogo,
      organisationlogourl,
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

      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].public_id : 'null';
      coverpageurl = fields.includes('coverpage') ? req.files.coverpage[0].url : 'null';

      sponsorslogo = fields.includes('sponsorslogo') ? req.files.sponsorslogo[0].public_id : 'null';
      sponsorslogourl = fields.includes('sponsorslogo') ? req.files.sponsorslogo[0].url : 'null';
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
      coverpageurl,
      sponsorslogo,
      sponsorslogourl,
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

      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].public_id : 'null';
      coverpageurl = fields.includes('coverpage') ? req.files.coverpage[0].url : 'null';

      sponsorslogo = fields.includes('sponsorslogo') ? req.files.sponsorslogo[0].public_id : 'null';
      sponsorslogourl = fields.includes('sponsorslogo') ? req.files.sponsorslogo[0].url : 'null';
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
      coverpageurl,
      sponsorslogo,
      sponsorslogourl,
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


      wowtagvideo = fields.includes('0') ? req.files[0].public_id : 'null';
      wowtagvideourl = fields.includes('0') ? req.files[0].url : 'null';
      wowtagvideothumb = fields.includes('0') ? (req.files[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${wowtagvideo}.jpg` : 'null') : 'null';
    }

    await Event.findByIdAndUpdate(eventid, { $set: { eventtitle,
      eventcity,
      runtimefrom,
      runtimeto,
      wowtagvideo,
      wowtagvideourl,
      wowtagvideothumb,
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

// android event venue

exports.androideventvenue = async (req, res, next) => {
  try {
    const { eventid, eventvenueguestshare, onlineevent, inviteonlyevent, eventcontactname, eventcontactphone, eventcontactemail, eventcontactmessage, registerrsvp,
      eventvenue } = req.body;

    const eventArray = [];

    await Event.findByIdAndUpdate(eventid, { $set: {
      eventvenueguestshare,
      onlineevent,
      inviteonlyevent,
      eventcontactname,
      eventcontactphone,
      eventcontactemail,
      eventcontactmessage,
      registerrsvp,
      eventvenue: [],
    } },
    { safe: true, upsert: true, new: true });

    if (eventvenue !== undefined) {
      for (let i = 0; i < eventvenue.length; i += 1) {
        eventArray.push(Event.findByIdAndUpdate(eventid, { $push: { eventvenue: eventvenue[i] } },
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
    return (error);
  }
};

// android online event

exports.androidonlineevent = async (req, res, next) => {
  try {
    const { eventid, onlineeventname, webinarlink, teleconferencephone,
      teleconferencepassword } = req.body;

    await Event.findByIdAndUpdate(eventid, { $set: {
      onlineeventname,
      webinarlink,
      teleconferencephone,
      teleconferencepassword,
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
      // eventfaqs: [],
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


    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);

      eventhighlights1 = fields.includes('eventhighlights1') ? req.files.eventhighlights1[0].public_id : 'null';
      eventhighlights1url = fields.includes('eventhighlights1') ? req.files.eventhighlights1[0].url : 'null';
      eventhighlights1thumb = fields.includes('eventhighlights1') ? (req.files.eventhighlights1[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${eventhighlights1}.jpg` : 'null') : 'null';


      eventhighlights2 = fields.includes('eventhighlights2') ? req.files.eventhighlights2[0].public_id : 'null';
      eventhighlights2url = fields.includes('eventhighlights2') ? req.files.eventhighlights2[0].url : 'null';
      eventhighlights2thumb = fields.includes('eventhighlights2') ? (req.files.eventhighlights2[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${eventhighlights2}.jpg` : 'null') : 'null';
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
      eventhighlights1url,
      eventhighlights1thumb,
      eventhighlights2,
      eventhighlights2url,
      eventhighlights2thumb,
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
    const { eventid, eventcontactname, eventcontactphone,
      eventcontactemail, eventcontactmessage, keywordsearch, ticketprice } = req.body;

    await Event.findByIdAndUpdate(eventid, { $set: {
      eventcontactname,
      eventcontactphone,
      eventcontactemail,
      eventcontactmessage,
      ticketprice,
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

      eventsalescoupon1 = fields.includes('eventsalescoupon1') ? req.files.eventsalescoupon1[0].public_id : 'null';
      eventsalescoupon1url = fields.includes('eventsalescoupon1') ? req.files.eventsalescoupon1[0].url : 'null';

      eventsalescoupon2 = fields.includes('eventsalescoupon2') ? req.files.eventsalescoupon2[0].public_id : 'null';
      eventsalescoupon2url = fields.includes('eventsalescoupon2') ? req.files.eventsalescoupon2[0].url : 'null';
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
      eventsalescoupon1url,
      eventsalescoupon2,
      eventsalescoupon2url,
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
      .populate('userid', 'wowtagid personalimageurl firstname lastname -_id');

    return res.json({ success: true, code: httpStatus.OK, message: event });
  } catch (error) {
    return next(error);
  }
};


exports.newfeed = async (req, res, next) => {
  const id = req.user._id;

  const friends = await User.findById(id, { friends: 1 });

  const userArray = [id];

  // if (friends.friends.length === 0) {
  //   return res.json({
  //     success: false,
  //     code: httpStatus.NO_CONTENT,
  //     message: 'Connect with friends to see Event feeds',
  //   });
  // }

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
        .populate('userid', 'wowtagid personalimageurl firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimageurl -_id')
        .lean(),
      );
      feedArray.push(Thought.find({ userid: userArray[i] })
        .populate('userid', 'wowtagid personalimageurl firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimageurl -_id')
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


exports.fetchparticularevent = async (req, res, next) => {
  try {
    const { eventid } = req.body;

    const event = await Event.findById(eventid, {})
      .populate('userid', 'wowtagid personalimageurl firstname lastname designation')
      .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname designation -_id')
      .populate('audienceengagementsubmission.userid', 'wowtagid personalimageurl firstname lastname designation -_id');


    return res.json({
      success: true,
      code: httpStatus.OK,
      event,
    });
  } catch (error) {
    return next(error);
  }
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
        .populate('userid', 'wowtagid personalimageurl firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimageurl -_id')
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
        .populate('userid', 'wowtagid personalimageurl firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimageurl -_id')
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

  // if (friends.friends.length === 0) {
  //   return res.json({
  //     success: false,
  //     code: httpStatus.NO_CONTENT,
  //     message: 'Connect with friends to see Event feeds',
  //   });
  // }

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
        .populate('userid', 'wowtagid personalimageurl firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimageurl -_id')
        .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname -_id')
        .lean(),
      );
      feedArray.push(Thought.find({ userid: userArray[i] })
        .populate('userid', 'wowtagid personalimageurl firstname lastname designation')
        .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
        .populate('comments.userid', 'wowtagid firstname lastname personalimageurl -_id')
        .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname -_id')
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
      //   .populate('userid', 'wowtagid personalimageurl firstname lastname designation')
      //   .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
      //   .populate('comments.userid', 'wowtagid firstname lastname personalimageurl -_id')
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
  //   .populate('userid', 'wowtagid personalimageurl firstname lastname -_id');

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
        .populate('userid', 'wowtagid personalimageurl firstname lastname designation -_id'),
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


  // const todaysEvent = await Event.find({$and: [{eventstartdate: 
  // {$gte: startDate}},{eventstartdate: {$lte: endDate}}]}, {});


  // const startDate = moment('235959', 'hmmss').subtract(1, 'day').add(1,'second').
  // format('YYYY/MM/DD H:mm:ss');

  // const endDate = moment('235959', 'hmmss').format('YYYY/MM/DD H:mm:ss');


  if (execute === true) {
    const startDate = moment().format('YYYY/MM/DD');

    const endDate = moment().add(1, 'day').format('YYYY/MM/DD');

    const userArray = [id];

    const friends = await User.findById(id, { friends: 1 });


    function pushFriends() {
      for (let i = 0; i < friends.friends.length; i += 1) {
        userArray.push(friends.friends[i]);
      }
    }

    pushFriends();


    const feedArray = [];

    function pullFeed() {
      for (let i = 0; i < userArray.length; i += 1) {
        feedArray.push(Event.find({ userid: userArray[i],
          $and: [{ eventstartdate: { $gte: startDate } }, { eventstartdate: { $lt: endDate } }],
        },
        { eventname: 1, runtimefrom: 1, runtimeto: 1, eventstartdate: 1, eventtitle: 1, userid: 1 }).populate('userid', 'wowtagid personalimageurl'),
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


/* backup 14 mar 

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
        { eventname: 1, runtimefrom: 1, runtimeto: 1, eventstartdate: 1, eventtitle: 1, userid: 1 }).populate('userid', 'wowtagid personalimageurl'),
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
}; */


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
      populate('userid', 'wowtagid personalimageurl'),
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

  const feedresult = [];

  const eventfeed = await Event.find({ userid: id }, {})
    .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
    .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname -_id')
    .populate('comments.userid', 'wowtagid firstname lastname personalimageurl -_id').lean();


  const thoughtfeed = await Thought.find({ userid: id }, {})
    .populate('wowsome.userid', 'wowtagid firstname lastname -_id')
    .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname -_id')
    .populate('comments.userid', 'wowtagid firstname lastname personalimageurl -_id').lean();

  function processFeed() {
    for (let i = 0; i < eventfeed.length; i += 1) {
      feedresult.push(eventfeed[i]);
    }
    for (let j = 0; j < thoughtfeed.length; j += 1) {
      feedresult.push(thoughtfeed[j]);
    }
  }

  processFeed();

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

  const result2 = feedresult.sort((a, b) => {
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


exports.hubbfeeds = async (req, res, next) => {
  const id = req.user._id;

  const feedresult = await Event.find({ userid: id }, {})
    .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname -_id');

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


exports.futurehubbfeeds = async (req, res, next) => {
  try {
    const id = req.user._id;
    const currentDate = moment().format('YYYY/MM/DD'); // CHANGE To time format later

    const feedresult = await Event.find({ userid: id, eventstartdate: { $gt: currentDate } }, {})
      .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname -_id');

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: feedresult,
    });
  } catch (error) {
    return next(error);
  }
};


exports.pasthubbfeeds = async (req, res, next) => {
  const id = req.user._id;

  // const currentDate = moment().format('YYYY/MM/DD H:mm:ss');
  const currentDate = moment().format('YYYY/MM/DD');

  const feedresult = await Event.find({ userid: id, eventenddate: { $lt: currentDate } }, {})
    .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname -_id');

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
      .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname -_id');

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
        .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname designation -_id');
      return res.json({
        success: true,
        message: result,
      });
    }

    await Event.update({ _id: eventid, 'rsvp.userid': userid },
      { $set: { 'rsvp.$.extra': extra } });

    const result = await Event.find({ _id: eventid, 'rsvp.userid': userid }, { 'rsvp.$': 1 })
      .populate('rsvp.userid', 'wowtagid personalimageurl firstname designation lastname -_id');

    return res.json({
      success: true,
      message: result,
    });
  } catch (error) {
    return next(error);
  }
};

exports.audienceengagementsubmission = async (req, res, next) => {
  try {
    const userid = req.user._id;
    const { fullname, wowtagid, email, phone, address1, address2, city, zipcode, country, gender, eventid } = req.body;

    const checksubmission = await Event.aggregate([
      { $match: { _id: ObjectId(eventid) } },
      { $unwind: '$audienceengagementsubmission' },
      { $match: { 'audienceengagementsubmission.userid': ObjectId(userid) } },
    ]);

    if (checksubmission.length === 0) {
      await Event.findByIdAndUpdate(eventid, { $push:
        { audienceengagementsubmission: { userid, fullname, wowtagid, email, phone, address1, address2, city, zipcode, country, gender } } });

      const result = await Event.find({ _id: eventid, 'audienceengagementsubmission.userid': userid }, { 'audienceengagementsubmission.$': 1 })
        .populate('audienceengagementsubmission.userid', 'wowtagid personalimageurl firstname lastname designation -_id');
      return res.json({
        success: true,
        message: result,
      });
    }

    await Event.update({ _id: eventid, 'audienceengagementsubmission.userid': userid },
      { $set: { 'audienceengagementsubmission.$.fullname': fullname,'audienceengagementsubmission.$.wowtagid': wowtagid,'audienceengagementsubmission.$.email': email,'audienceengagementsubmission.$.phone': phone,'audienceengagementsubmission.$.address1': address1,'audienceengagementsubmission.$.address2': address2,'audienceengagementsubmission.$.city': city,'audienceengagementsubmission.$.zipcode': zipcode,'audienceengagementsubmission.$.country': country,'audienceengagementsubmission.$.gender': gender } });

    const result = await Event.find({ _id: eventid, 'audienceengagementsubmission.userid': userid }, { 'audienceengagementsubmission.$': 1 })
      .populate('audienceengagementsubmission.userid', 'wowtagid personalimageurl firstname designation lastname -_id');

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
  const { eventid, comment, createddisplaytime } = req.body;
  const commentedAt = moment().format('YYYY/MM/DD H:mm:ss');

  await Event.findByIdAndUpdate(eventid, { $push:
    { comments: { userid, comment, createddisplaytime, commentedAt } } });


  const result = await Event.findById(eventid, { comments: 1 })
    .populate('comments.userid', 'wowtagid personalimageurl firstname lastname')
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
  const { thoughtid, comment, createddisplaytime } = req.body;
  const commentedAt = moment().format('YYYY/MM/DD H:mm:ss');

  await Thought.findByIdAndUpdate(thoughtid, { $push:
    { comments: { userid, comment, createddisplaytime, commentedAt } } });


  const result = await Thought.findById(thoughtid, { comments: 1 })
    .populate('comments.userid', 'wowtagid personalimageurl firstname lastname')
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
      .populate('comments.userid', 'wowtagid personalimageurl firstname lastname');

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
      .populate('comments.userid', 'wowtagid personalimageurl firstname lastname');

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

      couponimage = fields.includes('0') ? req.files[0].public_id : 'null';
      couponimageurl = fields.includes('0') ? req.files[0].url : 'null';
    }

    await Event.findByIdAndUpdate(eventid, { $set: { 'audienceengagementcoupon.couponcode': couponcode,
      'audienceengagementcoupon.couponexpirydate': couponexpirydate,
      'audienceengagementcoupon.termsandconditions': termsandconditions,
      'audienceengagementcoupon.couponimage': couponimage,
      'audienceengagementcoupon.couponimageurl': couponimageurl,
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


exports.editwowtagvideo = async (req, res, next) => {
  try {
    const id = req.user._id;

    const { eventid } = req.headers;

    let wowtagvideo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);

      wowtagvideo = fields.includes('0') ? req.files[0].public_id : 'null';
      wowtagvideourl = fields.includes('0') ? req.files[0].url : 'null';
      wowtagvideothumb = fields.includes('0') ? (req.files[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${wowtagvideo}.jpg` : 'null') : 'null';
    }

    const checkevent = await Event.findById(eventid, {});

    if (checkevent === null) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Event doesnot exist',
      });
    }

    const checkuser = await Event.findById(eventid, { userid: 1 });

    if (String(checkuser.userid) === String(id)) {
      // await Event.findByIdAndRemove(eventid, {}); // TODO
      await Event.findByIdAndUpdate(eventid, { $set: { wowtagvideo,
        wowtagvideourl,
        wowtagvideothumb,
      } });

      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Wowtagvideo was successfully Edited',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.UNAUTHORIZED,
      message: "You don't have permission to Edit this Wowtagvideo",
    });
  } catch (error) {
    return next(error);
  }
};

exports.deletewowtagvideo = async (req, res, next) => {
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

    if (String(checkuser.userid) === String(id)) {
      // await Event.findByIdAndRemove(eventid, {}); // TODO

      const event = await Event.findById(eventid, { wowtagvideo: 1 });

      const wowtagvideo = await event.wowtagvideo;

      if (wowtagvideo === 'null') {
        return res.json({
          success: false,
          code: httpStatus.CONFLICT,
          message: 'No Wotagvideo!',
        });
      }

      await Event.findByIdAndUpdate(eventid, { $set: { wowtagvideo: 'null' } });


      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'Wowtagvideo was successfully removed',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.UNAUTHORIZED,
      message: "You don't have permission to delete this Wowtagvideo",
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

    const { eventtype, thoughtstext, urllink, linkkeyword, title, description, imageurl } = req.headers;

    let thoughtsimage = '';
    let thoughtsvideo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);

      thoughtsimage = fields.includes('thoughtsimage') ? req.files.thoughtsimage[0].public_id : 'null';
      thoughtsimageurl = fields.includes('thoughtsimage') ? req.files.thoughtsimage[0].url : 'null';

      thoughtsvideo = fields.includes('thoughtsvideo') ? req.files.thoughtsvideo[0].public_id : 'null';
      thoughtsvideourl = fields.includes('thoughtsvideo') ? req.files.thoughtsvideo[0].url : 'null';
      thoughtsvideothumb = fields.includes('thoughtsvideo') ? (req.files.thoughtsvideo[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${thoughtsvideo}.jpg` : 'null') : 'null';
    }

    const thought = await new Thought({
      userid: id,
      urllink,
      thoughtstext,
      thoughtsimage,
      thoughtsimageurl,
      thoughtsvideo,
      thoughtsvideourl,
      thoughtsvideothumb,
      linkkeyword,
      eventtype,
      createdAt,
      title,
      description,
      imageurl,
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

exports.geteventtitles = async (req, res, next) => {
  try {
    const id = req.user._id;

    const result = await Event.find({ }, { eventtitle: 1, userid: 1 });

    const eventtitles = await result.filter(item => String(item.userid) !== String(id));

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventtitles,
    });
  } catch (error) {
    return next(error);
  }
};

exports.myeventtitles = async (req, res, next) => {
  try {
    const id = req.user._id;

    const eventtitles = await Event.find({ userid: id }, { eventtitle: 1 });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventtitles,
    });
  } catch (error) {
    return (error);
  }
};

exports.getparticulareventtitle = async (req, res, next) => {
  try {
    const { eventid } = req.body;

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
    const { location, eventcategory } = req.body;

    const event = await Event.find({ 'eventvenue.eventvenuecity': location, eventcategory }, {});

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


/* email invite  smtp gmail

exports.emailinvite = async (req, res, next) => {
  try {
    const { email, eventid } = req.body;

    const coverpagepath = path.join(__dirname, '..', '..', 'public', 'invite', 'coverpage.jpg');
    const logopath = path.join(__dirname, '..', '..', 'public', 'invite', 'logo.png');
    const playstorepath = path.join(__dirname, '..', '..', 'public', 'invite', 'playstore.png');

    // console.log(filepath);

    // let fileBuf = fs.readFileSync(filepath);    


    const coverpageBuf = fs.readFileSync(coverpagepath);
    const coverpageContent = coverpageBuf.toString('base64');

    // let fileContent = fileBuf.toString('base64');

    // console.log(fileContent)


    const event = await Event.findById(eventid, { userid: 1, eventtitle: 1 })
      .populate('userid', 'firstname lastname -_id');

    const firstname = event.userid.firstname;
    const lastname = event.userid.lastname;
    const eventtitle = event.eventtitle;

    const emailArray = [];

    const url = `http://104.197.80.225:8080/wowhubb/event/getparticularevent/${eventid}`;

    if (typeof email !== Object) {
      emailArray.push(email);
    } else {
      email.forEach((e) => {
        emailArray.push(e);
      });
    }

    const newemail = new Email({
      message: {
        from: 'wowhubbinfo@gmail.com',
      },
      attachments: [{
        filename: 'coverpage.jpg',
        path: coverpagepath,
        // content: coverpageContent,
        cid: 'abc',
      }, {
        filname: 'logo.png',
        path: logopath,
        cid: 'logopath@cid',
      }, {
        filname: 'playstore.png',
        path: playstorepath,
        cid: 'playstore',
      }],
      open: false,
      send: true,
      transport: transporter,
    });


    emailArray.forEach((element) => {
      newemail
        .send({
          template: 'invite',
          message: {
            to: element,
          },
          locals: {
            firstname,
            lastname,
            eventtitle,
            eventid,
            url,
            name: 'Hari',
          },
        });
    });


    return res.json({
      success: true,
      // sendinvite
      code: httpStatus.OK,
      message: 'Invite link has been sent',
    });
  } catch (error) {
    return next(error);
  }
}; */


exports.emailinvite = async (req, res, next) => {
  try {
    const { email, eventid, message } = req.body;

    const event = await Event.findById(eventid, { userid: 1, eventtitle: 1, wowtagvideothumb: 1 })
      .populate('userid', 'firstname lastname -_id');

    const firstname = event.userid.firstname;
    const lastname = event.userid.lastname;
    const eventtitle = event.eventtitle;
    const wowtagvideothumb = event.wowtagvideothumb;

    const emailArray = [];

    if (typeof email !== Object) {
      emailArray.push(email);
    } else {
      email.forEach((e) => {
        emailArray.push(e);
      });
    }

    const username = `${firstname} ${lastname}`;


    emailArray.forEach((element) => {
      sgMail.send({
        to: element,
        from: {
          email: 'invite@wowhubb.com',
          name: username,
        },
        subject: 'Wowhubb Event Invitaiton',
        templateId: '62993ed8-34ea-4c1b-b333-cbebbe1bb53c',
        substitutions: {
          firstname,
          lastname,
          eventname: eventtitle,
          wowtagvideothumb,
          eventid,
          message,
        },
      });
    });


    return res.json({
      success: true,
      // sendinvite
      code: httpStatus.OK,
      message: 'Invite link has been sent',
    });
  } catch (error) {
    return next(error);
  }
};


// Group email with gmail
// exports.groupemailinvite = async (req, res, next) => {
//   try {
//     const id = req.user._id;

//     const { eventid, groupid } = req.body;

//     const url = `http://104.197.80.225:8080/wowhubb/event/getparticularevent/${eventid}`;

//     const coverpagepath = path.join(__dirname, '..', '..', 'public', 'invite', 'coverpage.jpg');
//     const logopath = path.join(__dirname, '..', '..', 'public', 'invite', 'logo.png');
//     const playstorepath = path.join(__dirname, '..', '..', 'public', 'invite', 'playstore.png');

//     // console.log(filepath);

//     // let fileBuf = fs.readFileSync(filepath);    
//     // let coverpageBuf = fs.readFileSync(coverpagepath);
//     // let coverpageContent = coverpageBuf.toString('base64')

//     // let fileContent = fileBuf.toString('base64');

//     // console.log(fileContent)

//     const emailArray = [];

//     /* Async Function */

//     async function asyncForEach(array, callback) {
//       for (let index = 0; index < array.length; index++) {
//         await callback(array[index], index, array);
//       }
//     }

//     // asyncForEach([1, 2, 3], async (num) => {
//     //   await waitFor(50)
//     //   console.log(num)
//     // })

//     // const start = async () => {
//     //   await asyncForEach([1, 2, 3], async (num) => {
//     //     await waitFor(50)
//     //     console.log(num)
//     //   })
//     //   console.log('Done')
//     // }

//     // start()

//     const groupFetch = async () => {
//       await asyncForEach(groupid, async (gid) => {
//         const gr = await Group.findById(gid, {})
//           .populate('users.userid', 'email');
//         const users = gr.users;

//         // asyncForEach(users, async (u) => {
//         //   if(String(id) !== String(u.userid._id)){
//         //     emailArray.push(u)
//         //   }
//         // })
//         await users.forEach((u) => {
//           if (String(id) !== String(u.userid._id)) {
//             // emailArray.push(u.userid)
//             emailArray.push(u.userid.email);
//           }
//         });
//       });
//     };


//     if (typeof groupid === 'string') {
//       const gr = await Group.findById(groupid, {})
//         .populate('users.userid', 'email');
//       const users = gr.users;
//       users.forEach((u) => {
//         if (String(id) !== String(u.userid._id)) {
//           emailArray.push(u.userid.email);
//         }
//       });
//       // console.log("true")
//     } else {
//       // groupid.forEach(gid => {
//       //   let gr = await Group.findById(gid,{})
//       //     .populate('users.userid','email')
//       // let users = gr.users;
//       // console.log(gr)
//       // users.forEach(u => {
//       //   if(String(id) !== String(u.userid._id)){
//       //     emailArray.push(u.userid.email)
//       //   }
//       // })
//       // })
//       // console.log("false")
//       // asyncForEach(groupid, async (gid) => {
//       //   let gr = await Group.findById(gid,{})
//       //     .populate('users.userid','email')
//       //   let users = gr.users;

//       // asyncForEach(users, async (u) => {
//       //   if(String(id) !== String(u.userid._id)){
//       //     emailArray.push(u)
//       //   }
//       // })
//       // users.forEach((u) => {
//       //   if(String(id) !== String(u.userid._id)){
//       //     // emailArray.push(u.userid)
//       //     emailArray.push("true")
//       //   }
//       // })

//       // })
//       groupFetch();
//     }

//     // console.log(emailArray)


//     const event = await Event.findById(eventid, { userid: 1, eventtitle: 1 })
//       .populate('userid', 'firstname lastname -_id');

//     const firstname = event.userid.firstname;
//     const lastname = event.userid.lastname;
//     const eventtitle = event.eventtitle;

//     const newemail = new Email({
//       message: {
//         from: 'wowhubbinfo@gmail.com',
//       },
//       attachments: [{
//         filename: 'coverpage.jpg',
//         path: coverpagepath,
//         // content: coverpageContent,
//         cid: 'abc',
//       }, {
//         filname: 'logo.png',
//         path: logopath,
//         cid: 'logopath@cid',
//       }],
//       open: false,
//       send: true,
//       transport: transporter,
//     });


//     emailArray.forEach((element) => {
//       newemail
//         .send({
//           template: 'invite',
//           message: {
//             to: element,
//           },
//           locals: {
//             firstname,
//             lastname,
//             eventtitle,
//             eventid,
//             url,
//             name: 'Hari',
//           },
//         });
//     });


//     return res.json({
//       success: true,
//       // sendinvite
//       code: httpStatus.OK,
//       message: 'Invite link has been sent',
//     });
//   } catch (error) {
//     return next(error);
//   }
// };


exports.groupemailinvite = async (req, res, next) => {
  try {
    const id = req.user._id;

    const { eventid, groupid, message } = req.body;

    const url = `http://104.197.80.225:8080/wowhubb/event/getparticularevent/${eventid}`;


    const emailArray = [];

    async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }


    const groupFetch = async () => {
      await asyncForEach(groupid, async (gid) => {
        const gr = await Group.findById(gid, {})
          .populate('users.userid', 'email');
        const users = gr.users;


        await users.forEach((u) => {
          if (String(id) !== String(u.userid._id)) {
            emailArray.push(u.userid.email);
          }
        });
      });
    };


    if (typeof groupid === 'string') {
      const gr = await Group.findById(groupid, {})
        .populate('users.userid', 'email');
      const users = gr.users;
      users.forEach((u) => {
        if (String(id) !== String(u.userid._id)) {
          emailArray.push(u.userid.email);
        }
      });
    } else {
      groupFetch();
    }


    const event = await Event.findById(eventid, { userid: 1, eventtitle: 1, wowtagvideothumb: 1 })
      .populate('userid', 'firstname lastname -_id');

    const firstname = event.userid.firstname;
    const lastname = event.userid.lastname;
    const eventtitle = event.eventtitle;
    const wowtagvideothumb = event.wowtagvideothumb;

    const username = `${firstname} ${lastname}`;

    emailArray.forEach((element) => {
      sgMail.send({
        to: element,
        from: {
          email: 'invite@wowhubb.com',
          name: username,
        },
        subject: 'Wowhubb Event Invitaiton',
        templateId: '62993ed8-34ea-4c1b-b333-cbebbe1bb53c',
        substitutions: {
          firstname,
          lastname,
          eventname: eventtitle,
          wowtagvideothumb,
          eventid,
          message,
        },
      });
    });

    return res.json({
      success: true,
      // sendinvite
      code: httpStatus.OK,
      message: 'Invite link has been sent',
    });
  } catch (error) {
    return next(error);
  }
};


exports.smsinvite = async (req, res, next) => {
  try {
    const { phone, eventid } = req.body;

    const event = await Event.findById(eventid, { userid: 1, eventtitle: 1 })
      .populate('userid', 'firstname lastname -_id');

    const firstname = event.userid.firstname;
    const lastname = event.userid.lastname;
    const eventtitle = event.eventtitle;

    const phoneArray = [];

    if (typeof phone !== Object) {
      phoneArray.push(phone);
    } else {
      phone.forEach((e) => {
        phoneArray.push(e);
      });
    }

    /* await client.messages.create({  // eslint-disable-line
      to: phone,
      from: '+1 872-244-6538 ',
      body: `${firstname} ${lastname} has invited you for their ${eventtitle}. Click on this link to RSVP. http://104.197.80.225:3010/wowhubb/home/${eventtitle}`,
    }); */

    phoneArray.forEach((element) => {
       client.messages.create({  // eslint-disable-line
        to: element,
        from: '+1 872-244-6538 ',
        body: `${firstname} ${lastname} has invited you for their ${eventtitle}. Click on this link to RSVP. http://104.197.80.225:8080/wowhubb/event/getparticularevent/${eventid}`,
      });
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Invite link has been sent',
    });
  } catch (error) {
    return next(error);
  }
};


exports.groupsmsinvite = async (req, res, next) => {
  try {
    const id = req.user._id;

    const { eventid, groupid } = req.body;

    const event = await Event.findById(eventid, { userid: 1, eventtitle: 1 })
      .populate('userid', 'firstname lastname -_id');

    const firstname = event.userid.firstname;
    const lastname = event.userid.lastname;
    const eventtitle = event.eventtitle;


    const phoneArray = [];

    /* Async Function */

    async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }


    const groupFetch = async () => {
      await asyncForEach(groupid, async (gid) => {
        const gr = await Group.findById(gid, {})
          .populate('users.userid', 'phone');
        const users = gr.users;

        await users.forEach((u) => {
          if (String(id) !== String(u.userid._id)) {
            phoneArray.push(u.userid.phone);
          }
        });
      });
    };


    if (typeof groupid === 'string') {
      const gr = await Group.findById(groupid, {})
        .populate('users.userid', 'phone');
      const users = gr.users;
      users.forEach((u) => {
        if (String(id) !== String(u.userid._id)) {
          phoneArray.push(u.userid.phone);
        }
      });
    } else {
      groupFetch();
    }


    phoneArray.forEach((element) => {
      client.messages.create({  // eslint-disable-line
        to: element,
        from: '+1 872-244-6538 ',
        body: `${firstname} ${lastname} has invited you for their ${eventtitle}. Click on this link to RSVP. http://104.197.80.225:8080/wowhubb/event/getparticularevent/${eventid}`,
      });
    });


    return res.json({
      success: true,
      // sendinvite
      code: httpStatus.OK,
      message: 'Invite link has been sent',
    });
  } catch (error) {
    return next(error);
  }
};


exports.emailrender = async (req, res, next) => {
  try {
    // const { email, eventid } = req.body;

    // const coverpagepath = path.join(__dirname,'..','..','public','invite','coverpage.jpg');
    // const logopath = path.join(__dirname,'..','..','public','invite','logo.png');
    // const playstorepath = path.join(__dirname,'..','..','public','invite','playstore.png');  

    // console.log(filepath);

    // let fileBuf = fs.readFileSync(filepath);    
    // let coverpageBuf = fs.readFileSync(coverpagepath);
    // let coverpageContent = coverpageBuf.toString('base64')

    // let fileContent = fileBuf.toString('base64');

    // console.log(fileContent)


    // const event = await Event.findById(eventid,{userid: 1,eventtitle: 1})
    // .populate('userid','firstname lastname -_id')

    return res.render('html');
  } catch (error) {
    return next(error);
  }
};


exports.sendtest = async (req, res, next) => {
  try {
    // const coverpagepath = path.join(__dirname, '..', '..', 'public', 'invite', 'coverpage.jpg');
    // const logopath = path.join(__dirname, '..', '..', 'public', 'invite', 'logo.png');
    // const playstorepath = path.join(__dirname, '..', '..', 'public', 'invite', 'playstore.png');

    // console.log(filepath);

    // let fileBuf = fs.readFileSync(filepath);   


    // const coverpageBuf = fs.readFileSync(coverpagepath);
    // const coverpageContent = coverpageBuf.toString('base64');


    // console.log(coverpageBuf)

    // let fileContent = fileBuf.toString('base64');

    // console.log(fileContent)

    // const username = `${firstname} ${lastname}`;


    const msg = {
      to: 'kannan.pv24@gmail.com',
      // to: 'hari@sqindia.net',
      // to: 'sqindiaapi@gmail.com',
      from: {
        email: 'invite@wowhubb.com',
        // name: username,
      },
      subject: 'Wowhubb Event Invitaiton',
      // text: 'and easy to do anywhere, even with Node.js',
      // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      templateId: '62993ed8-34ea-4c1b-b333-cbebbe1bb53c',
      substitutions: {
        firstname: 'Hari',
        lastname: 'Vijay',
        eventname: 'Birthday',
        coverpage: '1520939545580.jpeg',
      },
    //   files: [
    //     {
    //       // filename: 'coverpage.jpg',          
    //       contentType: 'image/jpeg',
    //       cid: 'coverpagecid',
    //       // path: coverpagepath,
    //       // content: ('coverpagecid' | coverpageContent)
    //       url: 'http://104.197.80.225:3010/wow/media/business/coverpage-1520403167788.jpeg'
    //     },
    //     {
    //       filename: 'playstore.png',          
    //       contentType: 'image/png',
    //       cid: 'playlogocid',
    //       path: playstorepath,
    //       // content: coverpageContent
    //     }
    // ],
    };


    const sg = await sgMail.send(msg);

    return res.json({
      success: true,
      sg,
    });
  } catch (error) {
    return next(error);
  }
};
