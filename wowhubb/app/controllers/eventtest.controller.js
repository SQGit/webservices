const httpStatus = require('http-status');
const User = require('../models/user.model');
const Event = require('../models/eventtest.model');
const moment = require('moment');
const { intersection } = require('lodash');

const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;


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
    const { eventtype, eventcategory, eventname, eventtimezone, eventstartdate,
      eventenddate, eventdescription,
    } = req.headers;

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


// Professional Event

exports.proeventdetails = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { eventtype, eventcategory, eventname, tickettype, ticketprice, eventdescription }
      = req.headers;

    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    let coverpage = '';
    let organisationlogo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].filename : 'null';
      organisationlogo = fields.includes('organisationlogo') ? req.files.organisationlogo[0].filename : 'null';
    }

    const event = await new Event({
      userid: id,
      eventtype,
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
      onlineevent, inviteonlyevent, eventvenue } = req.body;

    const eventArray = [];

    await Event.findByIdAndUpdate(eventid, { $set: { eventvenueaddressvisibility,
      eventvenueguestshare,
      onlineevent,
      inviteonlyevent,
      eventvenue: [] } },
    { safe: true, upsert: true, new: true });

    if (eventvenue !== undefined) {
      for (let i = 0; i < eventvenue.length; i += 1) {
        eventArray.push(Event.findByIdAndUpdate(eventid, { $push: { eventvenue: eventvenue[i] } },
          { safe: true, upsert: true, new: true }));
      }

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


/* ================================================================= */


/* exports.info = async (req, res, next) => {
  const { eventid, eventtype, eventtopic, eventname, eventdescription, eventcategory,
    eventstartdate, eventenddate, eventtimezone, runtimefrom, runtimeto,
    eventvenueaddressvisibility, eventvenueguestshare, eventtotaldays, eventcontactname,
    eventcontactphone, eventcontactemail, eventcontactmessage, privateevent,
    registerrsvp, giftregistryurl, donationsurl, eventnolinks, otherurl } = req.body;

  await Event.findByIdAndUpdate(eventid, { $set: {
    eventtype,
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

// TODO - trycatch

exports.newfeed = async (req, res, next) => {
  const id = req.user._id;

  const ownInterests = await User.findById(id, { interests: 1, _id: 0 });
  const otherIntersets = await User.find({}, { interests: 1 });


  const userArray = [];

  function intersect() {
    for (let i = 0; i < otherIntersets.length; i += 1) {
      if (intersection(ownInterests.interests, otherIntersets[i].interests).length > 0) {
        userArray.push(otherIntersets[i]._id);
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

// Deprecated newfeed

exports.newfeed2 = async (req, res, next) => {
  const id = req.user._id;

  // const event = await Event.find({ userid: id })
  //   .sort({ createdAt: -1 })
  //   .populate('userid', 'wowtagid personalimageurl firstname lastname -_id');

  const ownInterests = await User.findById(id, { interests: 1, _id: 0 });
  const otherIntersets = await User.find({}, { interests: 1 });


  /*   // concat interests
  function allInterests(){
    for(var i=0;i<interests.length;i++){
      const all = interests[i].interests;
      for(var j=0;j<all.length;j++){
        interestsArr.push(all[j]);
      }
    }
  }

  allInterests() */


  const userArray = [];

  function intersect() {
    for (let i = 0; i < otherIntersets.length; i += 1) {
      // console.log(intersection(ownInterests.interests,otherIntersets[i].interests))
      if (intersection(ownInterests.interests, otherIntersets[i].interests).length > 0) {
        userArray.push(otherIntersets[i]._id);
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
  // console.log(otherIntersets[0].interests);

  // console.log(intersection(ownInterests.interests,otherIntersets[2].interests))

  return res.json({ success: true, code: httpStatus.OK, message: result2 });
};


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
        .populate('rsvp.userid', 'wowtagid personalimageurl firstname lastname -_id');
      return res.json({
        success: true,
        message: result,
      });
    }

    await Event.update({ _id: eventid, 'rsvp.userid': userid },
      { $set: { 'rsvp.$.extra': extra } });

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

exports.postcomment = async (req, res, next) => {
  const userid = req.user._id;
  const { eventid, comment } = req.body;
  const commentedAt = moment().format('YYYY/MM/DD H:mm:ss');

  await Event.findByIdAndUpdate(eventid, { $push:
    { comments: { userid, comment, commentedAt } } });


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


// Professional Event

exports.proengagementform = async (req, res, next) => {
  try {
    const { eventid, engagementformtype, engagementformaction, fullname, wowtagid, email, phone,
      address1, address2, city, zipcode, country } = req.body;

    await Event.findByIdAndUpdate(eventid, { $set: { 'audienceengagementform.fullname': fullname,
      'audienceengagementform.wowtagid': wowtagid,
      'audienceengagementform.email': email,
      'audienceengagementform.phone': phone,
      'audienceengagementform.address1': address1,
      'audienceengagementform.address2': address2,
      'audienceengagementform.city': city,
      'audienceengagementform.zipcode': zipcode,
      'audienceengagementform.country': country,
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
