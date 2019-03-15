const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const Jobseeker = require('../../models/jobseeker/jobseeker.model');
const OOHome = require('../../models/admin/oohome.model');
const Faq = require('../../models/admin/faq.model');
const JobseekerTerms = require('../../models/admin/jobseekerterm.model');
const { jwtSecret } = require('../../config/vars');
const moment = require('moment');
const Featured = require('../../models/admin/featured.model');


/* emailconfig */

const email = require('emailjs');

const transporter = email.server.connect({
  user: 'noreply@ooget.com.sg',
  password: 'NR_36911',
  host: 'smtp-mail.outlook.com',
  tls: { ciphers: 'SSLv3' },
});

/* emailconfig */

function generateTokenResponse(jobseeker) {
  const accessToken = jwt.sign(jobseeker, jwtSecret, {
    expiresIn: '30 days',
  });
  return accessToken;
}

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

exports.fetchservertime = async (req, res, next) => {
  try {
    const date = new Date();

    return res.json({
      success: true,
      code: httpStatus.OK,
      date,
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

exports.uniquejobseeker = async (req, res, next) => {
  try {
    const { email } = req.body;

    const jobseeker = await Jobseeker.find({ email });

    if (jobseeker.length === 0) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'jobseekernotfound',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'jobseekerexists',
    });
  } catch (error) {
    return next(error);
  }
};

exports.uniquemobileno = async (req, res, next) => {
  try {
    const { mobileno } = req.body;

    const jobseeker = await Jobseeker.find({ mobileno });

    if (jobseeker.length === 0) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'mobileno not found',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'mobilenoexists',
    });
  } catch (error) {
    return next(error);
  }
};

exports.uniquenricfinno = async (req, res, next) => {
  try {
    const { nricfinno } = req.body;

    const jobseeker = await Jobseeker.find({ nricfinno });

    if (jobseeker.length === 0) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'nricfinnonotfound',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'nricfinnoexists',
    });
  } catch (error) {
    return next(error);
  }
};


exports.register = async (req, res, next) => {
  try {
    const {
      username, email, password, country, activestatus, race,
      residencytype,
    } = req.body;
    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

    const jobseeker = {
      username,
      email,
      password,
      country,
      race,
      residencytype,
      firsttime: 'true',
      activestatus,
      nriceditable: 'true',
      jobseekeridproofeditable: 'true',
      createdAt,
    };

    const newjobseeker = await (new Jobseeker(jobseeker)).save();
    const id = newjobseeker.id;

    res.status(httpStatus.CREATED);
    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'accountcreated',
      id,
    });
  } catch (error) {
    return next(Jobseeker.checkDuplicates(error));
  }
};

exports.forgetpassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const checkjobseeker = await Jobseeker.findOne({ email });

    if (!checkjobseeker) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'invalidemail',
      });
    }

    const jobseekerid = await checkjobseeker._id;

    const message	= {
      from: 'noreply@ooget.com.sg',
      to: email,
      subject:	'Ooget Password',
      attachment:
        [
          { data: `<html>Please click the below link to change password: <br /> https://www.ooget.com.sg/auth/change_pass/${jobseekerid}</html>`, alternative: true },
        ],
    };

   transporter.send(message, (error, info) => { 
      if (error) {
        console.log(error);
        return res.json({
          success: false,
          message: error,
        });
      }


      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'passwordforwarded',
      });
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchemailwithidnoauth = async (req, res, next) => {
  try {
    const { jobseekerid } = req.body;
    const checkjobseeker = await Jobseeker.findOne({ _id: jobseekerid });

    if (!checkjobseeker) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'invaliduser',
      });
    }

    const jobseeker = await Jobseeker.findById(jobseekerid, { email: 1 });

    return res.json({
      success: true,
      code: httpStatus.OK,
      jobseeker,
    });
  } catch (error) {
    return next(error);
  }
};

exports.changepasswordnoauth = async (req, res, next) => {
  try {
    const { jobseekerid, password } = req.body;
    const checkjobseeker = await Jobseeker.findOne({ _id: jobseekerid });

    if (!checkjobseeker) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'invaliduser',
      });
    }

    await Jobseeker.findByIdAndUpdate(jobseekerid, { $set: { password } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'passwordchanged',
    });
  } catch (error) {
    return next(error);
  }
};

exports.changepassword = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { oldpassword, password } = req.body;
    const checkjobseeker = await Jobseeker.findOne({ _id: id });

    if (checkjobseeker.password !== oldpassword) {
      return res.json({
        success: false,
        code: httpStatus.UNAUTHORIZED,
        message: 'wrongpassword',
      });
    }

    await Jobseeker.findByIdAndUpdate(id, { $set: { password } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'passwordchanged',
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateidproofnoauth = async (req, res, next) => {
  try {
    const id = req.headers.id;

    const jobseeker = await Jobseeker.findById(id, { jobseekeridprooffront: 1, jobseekeridproofback: 1 });

    let jobseekeridprooffront = '';
    let jobseekeridproofback = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      jobseekeridprooffront = fields.includes('jobseekeridprooffront') ? req.files.jobseekeridprooffront[0].filename : (jobseeker.jobseekeridprooffront !== 'null' ? jobseeker.jobseekeridprooffront : 'null');

      jobseekeridproofback = fields.includes('jobseekeridproofback') ? req.files.jobseekeridproofback[0].filename : (jobseeker.jobseekeridproofback !== 'null' ? jobseeker.jobseekeridproofback : 'null');
    }

    await Jobseeker.findByIdAndUpdate(id, { $set: { jobseekeridprooffront, jobseekeridproofback } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      jobseekeridprooffront,
      jobseekeridproofback,
    });
  } catch (error) {
    return next(error);
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const checkjobseeker = await Jobseeker.findOne({ email });


    if (!checkjobseeker) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'authenticationfailed',
      });
    } else if (checkjobseeker.password !== password) {
      return res.json({
        success: false,
        code: httpStatus.UNAUTHORIZED,
        message: 'authenticationfailed',
      });
    }

    const jobseeker = {
      _id: checkjobseeker._id,
      email: checkjobseeker.email,
      username: checkjobseeker.username,
    };

    const jobseekerimage = checkjobseeker.jobseekerimage;
    const firsttime = checkjobseeker.firsttime;
    const activestatus = checkjobseeker.activestatus;
    const race = checkjobseeker.race;
    const residencytype = checkjobseeker.residencytype;

    const token = generateTokenResponse(jobseeker);
    return res.json({
      success: true,
      code: httpStatus.OK,
      token,
      jobseeker,
      jobseekerimage,
      firsttime,
      activestatus,
      race,
      residencytype,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchprofiledetails = async (req, res, next) => {
  try {
    const id = req.user._id;

    const details = await Jobseeker.findById(id, { password: 0 });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: details,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateprofiledetails = async (req, res, next) => {
  try {
    const id = req.user._id;

    const {
      username, email, country, mobileno, address, nricfinno, dob, gender,
      ispaynowreg, bankname, accountno, bankcode, branchcode, nameinidcard,
      experiencein, totalexperienceinyears, previousexperince, preferredregion,
      preferredlocation, preferredspecialization, notificationalerttype,
      workingenvironment, alertofffrom, alertoffto, alertswitchedoffdays,
      employmenttype, race, residencytype,
    } = req.body;

    const jobseeker = await Jobseeker.findById(id, { nricfinno: 1, nriceditable: 1 });
    const oldnricfinno = jobseeker.nricfinno;
    const oldnriceditable = jobseeker.nriceditable;

    const newnricfinno = `${nricfinno}`.toUpperCase();

    await Jobseeker.findByIdAndUpdate(id, {
      $set: {
        username,
        email,
        country,
        mobileno,
        address,
        nricfinno: newnricfinno,
        dob,
        gender,
        ispaynowreg,
        bankname,
        bankcode,
        branchcode,
        nameinidcard,
        accountno,
        experiencein: [],
        totalexperienceinyears,
        previousexperince: [],
        workingenvironment: [],
        preferredregion: [],
        preferredlocation,
        preferredspecialization,
        notificationalerttype,
        alertofffrom,
        alertoffto,
        alertswitchedoffdays,
        employmenttype: [],
        firsttime: 'false',
        race,
        residencytype,
      },
    });

    const previousExperienceArray = [];
    const experienceinArray = [];
    const preferredregionArray = [];
    const workingenvironmentArray = [];
    const employmenttypeArray = [];


    if (previousexperince !== undefined) {
      for (let i = 0; i < previousexperince.length; i += 1) {
        previousExperienceArray.push(Jobseeker.findByIdAndUpdate(
          id, { $push: { previousexperince: previousexperince[i] } },
          { safe: true, upsert: true, new: true },
        ));
      }

      await Promise.all(previousExperienceArray);
    }

    if (experiencein !== undefined) {
      for (let i = 0; i < experiencein.length; i += 1) {
        experienceinArray.push(Jobseeker.findByIdAndUpdate(
          id, { $push: { experiencein: experiencein[i] } },
          { safe: true, upsert: true, new: true },
        ));
      }

      await Promise.all(experienceinArray);
    }

    if (preferredregion !== undefined) {
      for (let i = 0; i < preferredregion.length; i += 1) {
        preferredregionArray.push(Jobseeker.findByIdAndUpdate(
          id, { $push: { preferredregion: preferredregion[i] } },
          { safe: true, upsert: true, new: true },
        ));
      }

      await Promise.all(preferredregionArray);
    }

    if (workingenvironment !== undefined) {
      for (let i = 0; i < workingenvironment.length; i += 1) {
        workingenvironmentArray.push(Jobseeker.findByIdAndUpdate(
          id, { $push: { workingenvironment: workingenvironment[i] } },
          { safe: true, upsert: true, new: true },
        ));
      }

      await Promise.all(workingenvironmentArray);
    }

    if (employmenttype !== undefined) {
      for (let i = 0; i < employmenttype.length; i += 1) {
        employmenttypeArray.push(Jobseeker.findByIdAndUpdate(
          id, { $push: { employmenttype: employmenttype[i] } },
          { safe: true, upsert: true, new: true },
        ));
      }

      await Promise.all(employmenttypeArray);
    }

    if ((oldnricfinno !== nricfinno) && (nricfinno !== '')) {
      await Jobseeker.findByIdAndUpdate(id, { $set: { nriceditable: 'false' } });
    }


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

    let jobseekerimage = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      jobseekerimage = fields.includes('0') ? req.files[0].filename : 'null';
    }

    await Jobseeker.findByIdAndUpdate(id, { $set: { jobseekerimage } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: jobseekerimage,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateidproof = async (req, res, next) => {
  try {
    const id = req.user._id;

    const jobseeker = await Jobseeker.findById(id, { jobseekeridprooffront: 1, jobseekeridproofback: 1 });

    let jobseekeridprooffront = '';
    let jobseekeridproofback = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      jobseekeridprooffront = fields.includes('jobseekeridprooffront') ? req.files.jobseekeridprooffront[0].filename : (jobseeker.jobseekeridprooffront !== 'null' ? jobseeker.jobseekeridprooffront : 'null');

      jobseekeridproofback = fields.includes('jobseekeridproofback') ? req.files.jobseekeridproofback[0].filename : (jobseeker.jobseekeridproofback !== 'null' ? jobseeker.jobseekeridproofback : 'null');
    }

    await Jobseeker.findByIdAndUpdate(id, { $set: { jobseekeridprooffront, jobseekeridproofback, jobseekeridproofeditable: 'false' } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      jobseekeridprooffront,
      jobseekeridproofback,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateimageandproof = async (req, res, next) => {
  try {
    const id = req.user._id;

    const jobseeker = await Jobseeker.findById(id, { jobseekerimage: 1, jobseekeridprooffront: 1, jobseekeridproofback: 1 });

    let jobseekerimage = '';
    let jobseekeridprooffront = '';
    let jobseekeridproofback = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      jobseekerimage = fields.includes('jobseekerimage') ? req.files.jobseekerimage[0].filename : (jobseeker.jobseekerimage !== 'null' ? jobseeker.jobseekerimage : 'null');

      jobseekeridprooffront = fields.includes('jobseekeridprooffront') ? req.files.jobseekeridprooffront[0].filename : (jobseeker.jobseekeridprooffront !== 'null' ? jobseeker.jobseekeridprooffront : 'null');

      jobseekeridproofback = fields.includes('jobseekeridproofback') ? req.files.jobseekeridproofback[0].filename : (jobseeker.jobseekeridproofback !== 'null' ? jobseeker.jobseekeridproofback : 'null');

      jobseekeridproofeditable = (fields.includes('jobseekeridprooffront') || fields.includes('jobseekeridproofback')) ? 'false' : 'true';
    }

    await Jobseeker.findByIdAndUpdate(id, {
      $set: {
        jobseekeridprooffront, jobseekeridproofback, jobseekerimage, jobseekeridproofeditable,
      },
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      jobseekerimage,
      jobseekeridprooffront,
      jobseekeridproofback,
    });
  } catch (error) {
    return next(error);
  }
};
