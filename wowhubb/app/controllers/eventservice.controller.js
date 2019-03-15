const httpStatus = require('http-status');
const EventService = require('../models/eventservice.model');
const User = require('../models/user.model');
const moment = require('moment');

exports.eventservicedetails = async (req, res, next) => {
  try {
    const id = req.user._id;

    const {
      firstname, lastname, email, phone, servicetype,
      companyname, venue, address1, address2, zipcode, city, state,
      country, websitelink, venuedescription,
    } = req.headers;

    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

    let coverpage = '';
    let businesslogo = '';

    let coverpageurl = '';
    let businesslogourl = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      coverpage = fields.includes('coverpage') ? req.files.coverpage[0].public_id : 'null';
      coverpageurl = fields.includes('coverpage') ? req.files.coverpage[0].url : 'null';

      businesslogo = fields.includes('businesslogo') ? req.files.businesslogo[0].public_id : 'null';
      businesslogourl = fields.includes('businesslogourl') ? req.files.businesslogo[0].url : 'null';
    }

    const eventservice = await new EventService({
      adminid: id,
      firstname,
      lastname,
      email,
      phone,
      servicetype,
      companyname,
      venue,
      address1,
      address2,
      zipcode,
      city,
      state,
      country,
      websitelink,
      venuedescription,
      coverpage,
      coverpageurl,
      businesslogo,
      businesslogourl,
      createdAt,
    }).save();

    const eventserviceid = eventservice._id;

    await User.findByIdAndUpdate(id, { $push: { eventservice: eventserviceid } });
    const userservice = await User.findById(id,{eventservice: 1}).populate('eventservice', 'companyname')

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventservice,
      userservice
    });
  } catch (error) {
    return next(error);
  }
};

exports.eventservicehours = async (req, res, next) => {
  try {
    const { eventserviceid, businesshours, customerengagementbutton, eventtype, eventcity,
      eventname, eventemail, eventphone, eventdate, eventtime, comments } = req.body;

    await EventService.findByIdAndUpdate(eventserviceid, { $set: {
      'customerengagementform.eventtype': eventtype,
      'customerengagementform.eventcity': eventcity,
      'customerengagementform.eventname': eventname,
      'customerengagementform.eventemail': eventemail,
      'customerengagementform.eventphone': eventphone,
      'customerengagementform.eventdate': eventdate,
      'customerengagementform.eventtime': eventtime,
      customerengagementbutton,
      comments,
    } });

    const businesshoursArray = [];

    if (businesshours !== undefined) {
      for (let i = 0; i < businesshours.length; i += 1) {
        businesshoursArray.push(EventService.findByIdAndUpdate(eventserviceid, { $push: {
          businesshours: businesshours[i] } },
        { safe: true, upsert: true, new: true }));
      }

      await Promise.all(businesshoursArray);
    }

    const eventservice = await EventService.findById(eventserviceid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventservice,
    });
  } catch (error) {
    return next(error);
  }
};

exports.eventservicegallery = async (req, res, next) => {
  try {
    const { eventserviceid, producttitle1, productheading1, productdescription1,
      producttitle2, productheading2, productdescription2,discount1,dicountbegin1,discountend1,discount2,dicountbegin2,discountend2 } = req.headers;

    let productfile1 = '';
    let productfile2 = '';

    let productfile1url = '';
    let productfile1thumb = '';

    let productfile2url = '';
    let productfile2thumb = '';


    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);

      productfile1 = fields.includes('productfile1') ? req.files.productfile1[0].public_id : 'null';
      productfile1url = fields.includes('productfile1') ? req.files.productfile1[0].url : 'null';
      productfile1thumb = fields.includes('productfile1') ? (req.files.productfile1[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${productfile1}.jpg` : 'null') : 'null';

      productfile2 = fields.includes('productfile2') ? req.files.productfile2[0].public_id : 'null';
      productfile2url = fields.includes('productfile2') ? req.files.productfile2[0].url : 'null';
      productfile2thumb = fields.includes('productfile2') ? (req.files.productfile2[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${productfile2}.jpg` : 'null') : 'null';
    }

    await EventService.findByIdAndUpdate(eventserviceid, { $set: {
      producttitle1,
      productheading1,
      productdescription1,
      producttitle2,
      productheading2,
      productdescription2,
      productfile1,
      productfile1url,
      productfile1thumb,
      productfile2,
      productfile2url,
      productfile2thumb,
      discount1,dicountbegin1,discountend1,
      discount2,dicountbegin2,discountend2
    } });

    const eventservice = await EventService.findById(eventserviceid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventservice,
    });
  } catch (error) {
    return next(error);
  }
};

exports.eventservicekeyword = async (req, res, next) => {
  try {
    const { eventserviceid, businesscoverageareas, rankclientbase,
      businesssearchkeywords } = req.body;

    await EventService.findByIdAndUpdate(eventserviceid, { $set: {
      businesscoverageareas, rankclientbase, businesssearchkeywords,
    } });

    const eventservice = await EventService.findById(eventserviceid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventservice,
    });
  } catch (error) {
    return next(error);
  }
};

exports.eventservicefaqs = async (req, res, next) => {
  try {
    const { eventserviceid, eventservicefaqs } = req.body;

    const faqsArray = [];

    await EventService.findByIdAndUpdate(eventserviceid, { $set: { eventservicefaqs: [] } });


    if (eventservicefaqs !== undefined) {
      for (let i = 0; i < eventservicefaqs.length; i += 1) {
        faqsArray.push(EventService.findByIdAndUpdate(eventserviceid, { $push:
          { eventservicefaqs: eventservicefaqs[i] } },
        { safe: true, upsert: true, new: true }));
      }
      await Promise.all(faqsArray);
    }

    const eventservice = await EventService.findById(eventserviceid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventservice,
    });
  } catch (error) {
    return next(error);
  }
};

exports.myeventservice = async (req, res, next) => {
  try {
    const id = req.user._id;

    const eventservice = await EventService.find({ adminid: id }, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventservice,
    });
  } catch (error) {
    next(error);
  }
};

exports.showparticulareventservice = async (req, res, next) => {
  try {
    const { eventserviceid } = req.body;

    const eventservice = await EventService.findById(eventserviceid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventservice,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetcheventservicebytype = async (req, res, next) => {
  try {
    const { servicetype } = req.body;

    const eventservice = await EventService.find({servicetype}, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventservice,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchparticulareventservice = async (req, res, next) => {
  try {
    const { eventserviceid } = req.body;

    const eventservice = await EventService.findById(eventserviceid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventservice,
    });
  } catch (error) {
    return next(error);
  }
};

exports.filtereventservice = async(req, res, next) => {
  try {
  
    const { city, country , servicetype } = req.body;

    async function Service(city, servicetype,country){

      if(!city && !servicetype){
        let eventservice = await EventService.find({country},{})
        return eventservice
      }else if(!servicetype && !country){
        let eventservice = await EventService.find({city},{})
        return eventservice
      }else if(!city && !country){
        let eventservice = await EventService.find({servicetype},{})
        return eventservice
      }else if(!city){
        let eventservice = await EventService.find({servicetype,country},{});
        return eventservice
      }else if(!servicetype){
        let eventservice = await EventService.find({city,country},{});
        return eventservice
      }else if(!country){
        let eventservice = await EventService.find({city,servicetype},{})
        return eventservice
      }else{
        let eventservice = await EventService.find({city,servicetype},{});
        return eventservice
      }

    }

    const service = await Service(city, servicetype, country)

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: service
    })

  } catch (error) {
    return next(error)
  }
}