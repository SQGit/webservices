const httpStatus = require('http-status');
const EventVenue = require('../models/eventvenue.model');
const User = require('../models/user.model');
const moment = require('moment');

exports.eventvenueedetails = async (req, res, next) => {
  try {
    const id = req.user._id;

    const {
      firstname, lastname, email, phone, venuetype,
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

    const eventvenue = await new EventVenue({
      adminid: id,
      firstname,
      lastname,
      email,
      phone,
      venuetype,
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

    const eventvenueid = eventvenue._id;

    await User.findByIdAndUpdate(id, { $push: { eventvenue: eventvenueid } });
    const uservenue = await User.findById(id,{eventvenue: 1}).populate('eventvenue', 'companyname')

    return res.json({
      success: true,
      code: httpStatus.OK,
      message:eventvenue,
      uservenue
    });
  } catch (error) {
    return next(error);
  }
};

exports.eventvenueamenities = async(req, res, next) => {
  try {
    const { eventvenueid, amenities, foodsandbeverages } = req.body;
    const amenitiesArray = [];
    const foodsandbeveragesArray = [];

    await EventVenue.findByIdAndUpdate(eventvenueid, { $set: { amenities: [] } },
      { safe: true, upsert: true, new: true });

    if (amenities !== undefined) {
      for (let i = 0; i < amenities.length; i += 1) {
        amenitiesArray.push(EventVenue.findByIdAndUpdate(eventvenueid, { $push: { amenities: amenities[i] } },
          { safe: true, upsert: true, new: true }));
      }

      await Promise.all(amenitiesArray);
    }

    if (foodsandbeverages !== undefined) {
      for (let i = 0; i < foodsandbeverages.length; i += 1) {
        foodsandbeveragesArray.push(EventVenue.findByIdAndUpdate(eventvenueid, { $push: { foodsandbeverages: foodsandbeverages[i] } },
          { safe: true, upsert: true, new: true }));
      }

      await Promise.all(foodsandbeveragesArray);
    }

    const eventvenue = await EventVenue.findById(eventvenueid,{});

    return res.json({
      success: true,
      code: httpStatus.OK,
      eventvenue
    })

  } catch (error) {
    return next(error);
  }
}


exports.eventvenuehalls = async(req, res, next) => {
  try {
    const { eventvenueid, eventvenuehalltype, eventvenuehallname,eventvenuehallseating, eventvenuehallstanding, eventvenuehalldescription, discount1,dicountbegin1,discountend1,discount2,dicountbegin2,discountend2 } = req.headers;

    let eventvenuehallimage = '';
    let eventvenuehallimageurl = '';
    let eventvenuehallimagethumb = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
  
      eventvenuehallimage = fields.includes('0') ? req.files[0].public_id : 'null';
      eventvenuehallimageurl = fields.includes('0') ? req.files[0].url : 'null';
      eventvenuehallimagethumb = fields.includes('0') ? (req.files[0].format === 'mp4' ? `http://res.cloudinary.com/www-wowhubb-com/video/upload/v1524468143/${personalimage}.jpg` : 'null') : 'null';
    }

    await EventVenue.findByIdAndUpdate(eventvenueid, { $set: { eventvenuehalltype, eventvenuehallname,eventvenuehallseating, eventvenuehallstanding, eventvenuehalldescription,eventvenuehallimage, eventvenuehallimageurl, eventvenuehallimagethumb, discount1,dicountbegin1,discountend1,discount2,dicountbegin2,discountend2 } });


    const eventvenue = await EventVenue.findById(eventvenueid,{});

    return res.json({
      success: true,
      code: httpStatus.OK,
      eventvenue
    })


  } catch (error) {
    return next(error);
  }
}

exports.eventvenueavailability = async(req, res, next) => {
  try {
    const { eventvenueid, pricingandavailability, businesscoverageareas } = req.body;

    const pricingandavailabilityArray = [];
    const businesscoverageareasArray = [];

    if (pricingandavailability !== undefined) {
      for (let i = 0; i < pricingandavailability.length; i += 1) {
        pricingandavailabilityArray.push(EventVenue.findByIdAndUpdate(eventvenueid, { $push: {
          pricingandavailability: pricingandavailability[i] } },
        { safe: true, upsert: true, new: true }));
      }

      await Promise.all(pricingandavailabilityArray);
    }
 

    if (businesscoverageareas !== undefined) {
      for (let i = 0; i < businesscoverageareas.length; i += 1) {
        businesscoverageareasArray.push(EventVenue.findByIdAndUpdate(eventvenueid, { $push: {
          businesscoverageareas: businesscoverageareas[i] } },
        { safe: true, upsert: true, new: true }));
      }

      await Promise.all(businesscoverageareasArray);
    }


    const eventvenue = await EventVenue.findById(eventvenueid,{});

    return res.json({
      success: true,
      code: httpStatus.OK,
      eventvenue
    })

  } catch (error) {
    return next(error);
  }
}



exports.eventvenuefaqs = async (req, res, next) => {
  try {
    const { eventvenueid, eventvenuefaqs } = req.body;

    const faqsArray = [];

    await EventVenue.findByIdAndUpdate(eventvenueid, { $set: { eventvenuefaqs: [] } });


    if (eventvenuefaqs !== undefined) {
      for (let i = 0; i < eventvenuefaqs.length; i += 1) {
        faqsArray.push(EventVenue.findByIdAndUpdate(eventvenueid, { $push:
          { eventvenuefaqs: eventvenuefaqs[i] } },
        { safe: true, upsert: true, new: true }));
      }
      await Promise.all(faqsArray);
    }

    const eventvenue = await EventVenue.findById(eventvenueid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventvenue,
    });
  } catch (error) {
    return next(error);
  }
};

exports.myeventvenue = async (req, res, next) => {
  try {
    const id = req.user._id;

    const eventvenue = await EventVenue.find({ adminid: id }, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventvenue,
    });
  } catch (error) {
    next(error);
  }
};

exports.showparticulareventvenue = async (req, res, next) => {
  try {
    const { eventvenueid } = req.body;

    const eventvenue = await EventVenue.findById(eventvenueid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventvenue,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetcheventvenuebytype = async (req, res, next) => {
  try {
    const { venuetype } = req.body;

    const eventvenue = await EventVenue.find({venuetype}, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventvenue,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchparticulareventvenue = async (req, res, next) => {
  try {
    const { eventvenueid } = req.body;

    const eventvenue = await EventVenue.findById(eventvenueid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: eventvenue,
    });
  } catch (error) {
    return next(error);
  }
};

exports.filtereventvenue = async(req, res, next) => {
  try {
  
    const { city, country , venuetype } = req.body;

    async function Venue(city, venuetype,country){

      if(!city && !venuetype){
        let eventvenue = await EventVenue.find({country},{})
        return eventvenue
      }else if(!venuetype && !country){
        let eventvenue = await EventVenue.find({city},{})
        return eventvenue
      }else if(!city && !country){
        let eventvenue = await EventVenue.find({venuetype},{})
        return eventvenue
      }else if(!city){
        let eventvenue = await EventVenue.find({venuetype,country},{});
        return eventvenue
      }else if(!venuetype){
        let eventvenue = await EventVenue.find({city,country},{});
        return eventvenue
      }else if(!country){
        let eventvenue = await EventVenue.find({city,venuetype},{})
        return eventvenue
      }else{
        let eventvenue = await EventVenue.find({city,venuetype},{});
        return eventvenue
      }

    }

    const venue = await Venue(city, venuetype, country)

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: venue
    })

  } catch (error) {
    return next(error)
  }
}