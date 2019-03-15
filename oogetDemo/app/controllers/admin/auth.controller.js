const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin/admin.model');
const OOHome = require('../../models/admin/oohome.model');
const Featured = require('../../models/admin/featured.model');
const Holiday = require('../../models/admin/holiday.model');
const JobseekerTerms = require('../../models/admin/jobseekerterm.model');
const Faq = require('../../models/admin/faq.model');
const { jwtSecret } = require('../../config/vars');
const moment = require('moment');

const Role = require('../../models/admin/role.model');


function generateTokenResponse(admin) {
  const accessToken = jwt.sign(admin, jwtSecret, {
    expiresIn: '30 days',
  });
  return accessToken;
}


exports.createadmin = async (req, res, next) => {
  try {
    await new Admin(req.body).save();
    return res.json({
      success: true,
      message: 'Admin created succesfully',
    });
  } catch (error) {
    return next(Admin.checkDuplicates(error));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const checkadmin = await Admin.findOne({ email });


    if (!checkadmin) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'authenticationfailed',
      });
    } else if (checkadmin.password !== password) {
      return res.json({
        success: false,
        code: httpStatus.UNAUTHORIZED,
        message: 'authenticationfailed',
      });
    }

    const admin = {
      _id: checkadmin._id,
      firstname: checkadmin.firstname,
      lastname: checkadmin.lastname,
      email: checkadmin.email,
      phone: checkadmin.phone,
      username: checkadmin.username,
      adminimage: checkadmin.adminimage,
    };

    const token = generateTokenResponse(admin);
    return res.json({
      success: true,
      code: httpStatus.OK,
      token,
      admin,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchprofiledetails = async (req, res, next) => {
  try {
    const id = req.user._id;

    const details = await Admin.findById(id, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: details,
    });
  } catch (error) {
    return next(error);
  }
};

exports.uniqueadminemail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const admin = await Admin.find({ email });

    if (admin.length === 0) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'emailnotfound',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'emailexists',
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateprofiledetails = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { email, password, username } = req.body;

    await Admin.findByIdAndUpdate(id, { $set: { email, password, username } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'profileupdated',
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateprofileimage = async (req, res, next) => {
  try {
    const id = req.user._id;

    let adminimage = '';

    if (req.files !== undefined) {
      const { files } = req;
      const fields = Object.keys(files);
      adminimage = fields.includes('0') ? req.files[0].filename : 'null';
    }

    await Admin.findByIdAndUpdate(id, { $set: { adminimage } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      adminimage,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchoogethome = async (req, res, next) => {
  try {
    const oogethome = await OOHome.findOne({}, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: oogethome,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateoogethome = async (req, res, next) => {
  try {
    const {
      title, subtitle, list1, list2, list3, list4,
    } = req.body;

    const checkoogethome = await OOHome.findOne({}, {});

    if (checkoogethome === null) {
      await new OOHome(req.body).save();
      const oogethome = await OOHome.findOne({}, {});
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: oogethome,
      });
    }

    await OOHome.findOneAndUpdate({}, {
      $set: {
        title, subtitle, list1, list2, list3, list4,
      },
    });
    const oogethome = await OOHome.findOne({}, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: oogethome,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchfeaturedimages = async (req, res, next) => {
  try {
    const featured = await Featured.find({}, {});

    return res.json({
      success: true,
      message: featured,
    });
  } catch (error) {
    return next(error);
  }
};

exports.addfeaturedimage = async (req, res, next) => {
  try {
    let featuredimage = '';
    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

    if (req.files !== undefined) {
      const { files } = req;
      const fields = Object.keys(files);
      featuredimage = fields.includes('0') ? req.files[0].filename : 'null';
    }

    const newfeatured = await new Featured({ featuredimage, createdAt }).save();
    const id = newfeatured._id;

    const featured = await Featured.find({ _id: id }, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: featured,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deletefeaturedimage = async (req, res, next) => {
  try {
    const { featuredimageid } = req.body;

    await Featured.findByIdAndRemove(featuredimageid, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'imagedeleted',
    });
  } catch (error) {
    return next(error);
  }
};


exports.addholiday = async (req, res, next) => {
  try {
    const { holidayname, holidaydate } = req.body;
    const year = moment(holidaydate, 'YYYY/MM/DD').format('YYYY');
    const checkholiday = await Holiday.find({ year, 'holidays.holidaydate': holidaydate }, { 'holidays.$.holidaydate': 1 });
    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');


    if (checkholiday.length > 0) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'holidayexists',
      });
    }

    await Holiday.findOneAndUpdate(
      { year }, {
        $push: { holidays: { holidayname, holidaydate, createdAt } },
      },
      { safe: true, upsert: true, new: true },
    );
    const holidays = await Holiday.find({ year, 'holidays.createdAt': createdAt }, { 'holidays.$.createdAt': 1 });
    const holiday = holidays[0].holidays[0];

    return res.json({
      success: true,
      code: httpStatus.OK,
      holiday,
    });
  } catch (error) {
    return next(error);
  }
};

exports.editholiday = async (req, res, next) => {
  try {
    const { holidayid, holidayname, holidaydate } = req.body;
    const checkholiday = await Holiday.findOne({ 'holidays._id': holidayid }, {});

    if (!checkholiday) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'holidaydoesnotexists',
      });
    }

    await Holiday.findOneAndUpdate({ 'holidays._id': holidayid }, { $set: { 'holidays.$.holidayname': holidayname, 'holidays.$.holidaydate': holidaydate } });

    const holidays = await Holiday.find({ 'holidays._id': holidayid }, { 'holidays.$._id': 1 });
    const holiday = holidays[0].holidays[0];

    return res.json({
      success: true,
      code: httpStatus.OK,
      holiday,
    });
  } catch (error) {
    return next(error);
  }
};


exports.deleteholiday = async (req, res, next) => {
  try {
    const { holidayid } = req.body;
    const checkholiday = await Holiday.findOne({ 'holidays._id': holidayid }, {});

    if (!checkholiday) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'holidaynotfound',
      });
    }

    await Holiday.findOneAndUpdate({ 'holidays._id': holidayid }, { $pull: { holidays: { _id: holidayid } } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'holidayremoved',
    });
  } catch (error) {
    return next(error);
  }
};


exports.fetchholidaylist = async (req, res, next) => {
  try {
    const currentyear = moment().format('YYYY');
    const holiday = await Holiday.find({ year: currentyear }, {});

    let holidays = [];

    if (holiday.length > 0) {
      holidays = holiday[0].holidays;
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      holidays,
    });
  } catch (error) {
    return next(error);
  }
};

exports.addfaq = async (req, res, next) => {
  try {
    const { faqquestion, faqanswer } = req.body;
    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

    const newfaq = await new Faq({
      faqquestion,
      faqanswer,
      createdAt,
    }).save();

    return res.json({
      success: true,
      faq: newfaq,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatefaq = async (req, res, next) => {
  try {
    const { faqid, faqquestion, faqanswer } = req.body;

    const faq = await Faq.findOne({ _id: faqid }, {});

    if (!faq) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Faq not found',
      });
    }

    await Faq.findOneAndUpdate({ _id: faqid }, { faqquestion, faqanswer });

    const newfaq = await Faq.findOne({ _id: faqid }, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      faq: newfaq,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deletefaq = async (req, res, next) => {
  try {
    const { faqid } = req.body;

    const faq = await Faq.findOne({ _id: faqid }, {});

    if (!faq) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Faq not found',
      });
    }

    await Faq.findOneAndRemove({ _id: faqid }, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Faq deleted',
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchfaqs = async (req, res, next) => {
  try {
    const faqs = await Faq.find({}, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      faqs,
    });
  } catch (error) {
    return next(error);
  }
};

exports.createrole = async (req, res, next) => {
  try {
    const { rolename, permissions } = req.body;

    const role = await Role.findOne({ rolename }, {});

    if (role) {
      return res.json({
        success: false,
        message: 'Role already exists',
      });
    }

    await new Role({ rolename, permissions }).save();

    return res.json({
      success: true,
      message: 'Role was created successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatejobseekerterms = async(req, res, next) => {
  try {
    
    const { jobseekerterm } = req.body;
    const jobsterm = await JobseekerTerms.findOne({});

    if(!jobsterm){
      const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');
      await new JobseekerTerms({jobseekerterm,createdAt}).save()
    }

    const updatedAt = moment().format('YYYY/MM/DD HH:mm:ss');

    await JobseekerTerms.findOneAndUpdate({},{$set: {jobseekerterm,updatedAt}})

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'jobseekertermsupdated'
    })

  } catch (error) {
    return next(error)
  }
}

exports.fetchjobseekerterms = async(req, res, next) => {
  try {
    const jobseekerterms = await JobseekerTerms.find({},{})

    return res.json({
      success: true,
      code: httpStatus.OK,
      jobseekerterms
    })
  } catch (error) {
    return next(error)
  }
}
