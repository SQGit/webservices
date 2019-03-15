const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const Employer = require('../../models/employer/employer.model');
const Company = require('../../models/employer/company.model');
const moment = require('moment');
const { jwtSecret } = require('../../config/vars');
const Role = require('../../models/admin/role.model');

function generateTokenResponse(employer) {
  const accessToken = jwt.sign(employer, jwtSecret, {
    expiresIn: '30 days',
  });
  return accessToken;
}


exports.unqiuecompany = async (req, res, next) => {
  try {
    const { uennumber } = req.body;

    const company = await Company.find({ uennumber });

    if (company.length === 0) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'companynotound',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'companyexists',
    });
  } catch (error) {
    return next(error);
  }
};

exports.unqiueemployer = async (req, res, next) => {
  try {
    const { email } = req.body;

    const employer = await Employer.find({ email });

    if (employer.length === 0) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'employernotfound',
      });
    }

    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'employerexists',
    });
  } catch (error) {
    return next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const {
      username, email, password, companyname, profile, uennumber, industry, country, activestatus, registeredby, termsaccepted,
    } = req.body;

    const employerrole = 'superemployer';

    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

    const company = await new Company({
      companyname,
      profile,
      uennumber,
      industry,
      country,
      activestatus,
      registeredby,
      termsaccepted,
      createdAt,
    }).save();

    const companyid = company._id;

    const checkrole = await Role.findOne({ rolename: employerrole }, {});

    let roleid = null;

    if (!checkrole) {
      roleid = null;
    } else if (checkrole) {
      roleid = checkrole._id;
    }

    const defaultemployer = true;

    const employer = await new Employer({
      username,
      email,
      password,
      companyid,
      defaultemployer,
      roleid,
      rolename: employerrole,
      createdAt,
    }).save();

    const employerid = employer._id;

    await Company.findByIdAndUpdate(companyid, { adminid: employerid });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'accountcreated',
    });
  } catch (error) {
    return next(Company.checkDuplicates(error));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const checkemployer = await Employer.findOne({ email })
      .populate('companyid', 'companyname companycode companylogo activestatus _id')
      .populate('roleid', 'rolename permissions -_id');

    if (!checkemployer) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'authenticationfailed',
      });
    } else if (checkemployer.password !== password) {
      return res.json({
        success: false,
        code: httpStatus.UNAUTHORIZED,
        message: 'authenticationfailed',
      });
    } else if (!checkemployer.companyid.activestatus) {
      return res.json({
        success: false,
        code: httpStatus.UNAUTHORIZED,
        message: 'checkoogetforactivation',
      });
    }

    const employer = {
      _id: checkemployer._id,
      email: checkemployer.email,
      username: checkemployer.username,
      company: checkemployer.companyid,
      defaultemployer: checkemployer.defaultemployer,
      role: checkemployer.roleid,
    };

    const token = generateTokenResponse(employer);
    return res.json({
      success: true,
      code: httpStatus.OK,
      token,
      employer,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatecompanylogo = async (req, res, next) => {
  try {
    const id = req.user._id;

    const { companyid } = req.headers;

    let companylogo = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      companylogo = fields.includes('0') ? req.files[0].filename : 'null';
    }

    await Company.findByIdAndUpdate(companyid, { $set: { companylogo } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: companylogo,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchtermsstatus = async (req, res, next) => {
  try {
    const { companyid } = req.body;

    const company = await Company.findById(companyid, { termsaccepted: 1, termsandconditions: 1 });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: company,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatetermsstatus = async (req, res, next) => {
  try {
    const { companyid, termsaccepted } = req.body;

    const company = await Company.findByIdAndUpdate(companyid, { termsaccepted });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'termsstatusupdated',
    });
  } catch (error) {
    return next(error);
  }
};

// new

exports.fetchownprofile = async (req, res, next) => {
  try {
    const id = req.user._id;

    const fetchemployer = await Employer.findOne({ _id: id }, {})
      .populate('roleid', 'rolename permissions -_id');

    const profile = {
      _id: fetchemployer._id,
      email: fetchemployer.email,
      username: fetchemployer.username,
      password: fetchemployer.password,
      role: fetchemployer.roleid,
    };

    return res.json({
      success: true,
      code: httpStatus.OK,
      profile,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateownprofile = async (req, res, next) => {
  try {
    const id = req.user._id;

    const { username, email, password } = req.body;

    await Employer.findOneAndUpdate({ _id: id }, { $set: { username, email, password } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Profile has been updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.createsupervisor = async (req, res, next) => {
  try {
    const id = req.user._id;

    const {
      username, email, password, employerrole,
    } = req.body;
    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

    const checkemployer = await Employer.findOne({ _id: id }, { companyid: 1 });

    const companyid = checkemployer.companyid;
    const checkrole = await Role.findOne({ rolename: employerrole }, {});

    const checksupervisor = await Employer.findOne({ email }, {});

    if (checksupervisor) {
      return res.json({
        success: false,
        message: 'Employer email exists already',
      });
    }

    let roleid = null;

    if (!checkrole) {
      roleid = null;
    } else if (checkrole) {
      roleid = checkrole._id;
    }

    const employer = await Employer({
      username,
      email,
      password,
      companyid,
      roleid,
      rolename: employerrole,
      createdAt,
    }).save();

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'accountcreated',
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatesupervisor = async (req, res, next) => {
  try {
    const id = req.user._id;

    const {
      username, email, password, supervisorid, employerrole,
    } = req.body;

    const checksupervisor = await Employer.findOne({ _id: supervisorid }, {});

    if (!checksupervisor) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Supervisor not found',
      });
    }

    const checkrole = await Role.findOne({ rolename: employerrole }, {});

    if (!checkrole) {
      roleid = null;
    } else if (checkrole) {
      roleid = checkrole._id;
    }

    await Employer.findOneAndUpdate({ _id: supervisorid }, {
      $set: {
        username, email, password, employerrole,
      },
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Supervisor has been updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchsupervisor = async (req, res, next) => {
  try {
    const { supervisorid } = req.body;

    const checksupervisor = await Employer.findOne({ _id: supervisorid }, {})
      .populate('roleid', 'rolename permissions -_id');

    if (!checksupervisor) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Supervisor not found',
      });
    }

    const profile = {
      _id: checksupervisor._id,
      email: checksupervisor.email,
      username: checksupervisor.username,
      role: checksupervisor.roleid,
    };

    return res.json({
      success: true,
      code: httpStatus.OK,
      profile,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deletesupervisor = async (req, res, next) => {
  try {
    const { supervisorid } = req.body;

    const checksupervisor = await Employer.findOne({ _id: supervisorid }, {});

    if (!checksupervisor) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Supervisor not found',
      });
    }

    await Employer.findOneAndRemove({ _id: supervisorid }, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Supervisor removed',
    });
  } catch (error) {
    return next(error);
  }
};


exports.listsupervisors = async (req, res, next) => {
  try {
    const id = req.user._id;

    const employer = await Employer.findOne({ _id: id }, {});
    const companyid = employer.companyid;

    const supervisors = await Employer.find({ companyid }, { password: 0 })
      .populate('roleid', 'rolename permissions -_id');

    return res.json({
      success: true,
      code: httpStatus.OK,
      supervisors,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchcompany = async (req, res, next) => {
  try {
    const id = req.user._id;

    const employer = await Employer.findOne({ _id: id }, {});
    const companyid = employer.companyid;

    const company = await Company.findOne({ _id: companyid }, { adminid: 0 });

    return res.json({
      success: true,
      code: httpStatus.OK,
      company,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchownroles = async (req, res, next) => {
  try {
    const id = req.user._id;

    const fetchroles = await Employer.findOne({ _id: id }, {})
      .populate('roleid', 'rolename permissions -_id');

    const roles = fetchroles.roleid;

    return res.json({
      success: true,
      code: httpStatus.OK,
      roles,
    });
  } catch (error) {
    return next(error);
  }
};
