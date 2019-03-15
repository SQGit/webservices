const httpStatus = require('http-status');
const Business = require('../models/business.model');
const User = require('../models/user.model');
const moment = require('moment');

exports.businessdetails = async (req, res, next) => {
  try {
    const id = req.user._id;

    const {
      firstname, lastname, email, phone, businesstype, category,
      companyname, venue, address1, address2, zipcode, state,
      country, websitelink, description,
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

    const business = await new Business({
      adminid: id,
      firstname,
      lastname,
      email,
      phone,
      businesstype,
      category,
      companyname,
      venue,
      address1,
      address2,
      zipcode,
      state,
      country,
      websitelink,
      description,
      coverpage,
      coverpageurl,
      businesslogo,
      businesslogourl,
      createdAt,
    }).save();

    const businessid = business._id;

    await User.findByIdAndUpdate(id, { $push: { business: businessid } });

    const userbusiness = await User.findById(id,{business: 1}).populate('business', 'companyname')

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: business,
      userbusiness
    });
  } catch (error) {
    return next(error);
  }
};

exports.businessgallery = async (req, res, next) => {
  try {
    const { businessid, producttitle1, productheading1, productdescription1,
      producttitle2, productheading2, productdescription2 } = req.headers;

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

    await Business.findByIdAndUpdate(businessid, { $set: {
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
    } });

    const business = await Business.findById(businessid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: business,
    });
  } catch (error) {
    return next(error);
  }
};

exports.businesskeyword = async (req, res, next) => {
  try {
    const { businessid, businesscoverageareas, rankclientbase,
      businesssearchkeywords } = req.body;

    await Business.findByIdAndUpdate(businessid, { $set: {
      businesscoverageareas, rankclientbase, businesssearchkeywords,
    } });

    const business = await Business.findById(businessid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: business,
    });
  } catch (error) {
    return next(error);
  }
};

exports.mybusiness = async (req, res, next) => {
  try {
    const id = req.user._id;

    const business = await Business.find({ adminid: id }, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: business,
    });
  } catch (error) {
    next(error);
  }
};

exports.showparticularbusiness = async (req, res, next) => {
  try {
    const { businessid } = req.body;

    const business = await Business.findById(businessid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: business,
    });
  } catch (error) {
    return next(error);
  }
};

