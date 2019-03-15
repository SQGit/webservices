const httpStatus = require('http-status');
const Employer = require('../../models/employer/employer.model');
const Company = require('../../models/employer/company.model');
const moment = require('moment');
const Role = require('../../models/admin/role.model');

exports.unqiuecompany = async (req, res, next) => {
  try {
    const { uennumber } = req.body;

    const company = await Company.find({ uennumber });

    if (company.length === 0) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'companynotfound',
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

exports.createemployer = async (req, res, next) => {
  try {
    const {
      username, email, password, companyname, companycode, profile, uennumber, industry,
      country, activestatus, registeredby, termsaccepted,
    } = req.body;

    const employerrole = 'superemployer';

    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

    const company = await new Company({
      companyname,
      companycode,
      profile,
      uennumber,
      industry,
      country,
      registeredby,
      termsaccepted,
      activestatus,
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
      message: 'employercreated',
    });
  } catch (error) {
    return next(Company.checkDuplicates(error));
  }
};

exports.updatecompanydetails = async (req, res, next) => {
  try {
    const {
      companyname, companycode, profile, uennumber, industry,
      country, companyid,
    } = req.body;

    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

    await Company.findOneAndUpdate({ _id: companyid }, {
      $set: {
        companyname,
        companycode,
        profile,
        uennumber,
        industry,
        country,
      },
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'emplyerupdated',
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatecompanycode = async (req, res, next) => {
  try {
    const { companyid, companycode } = req.body;

    await Company.findByIdAndUpdate(companyid, { $set: { companycode } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'companycodeupdated',
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatetermsandconditions = async (req, res, next) => {
  try {
    const companyid = req.headers.companyid;

    let termsandconditions = '';

    if (req.files !== undefined) {
      const files = req.files;
      const fields = Object.keys(files);
      termsandconditions = fields.includes('0') ? req.files[0].filename : 'null';
    }

    await Company.findByIdAndUpdate(companyid, { $set: { termsandconditions } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: termsandconditions,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateactivestatus = async (req, res, next) => {
  try {
    const id = req.user._id;

    const { companyid, activestatus } = req.body;

    await Company.findByIdAndUpdate(companyid, { $set: { activestatus } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'activestatuschanged',
    });
  } catch (error) {
    return next(error);
  }
};

exports.employerslist = async (req, res, next) => {
  try {
    const employers = await Company.find({}, {})
      .populate('adminid', 'email username');

    return res.json({
      success: true,
      code: httpStatus.OK,
      employers,
    });
  } catch (error) {
    return next(error);
  }
};

exports.viewparticularemployer = async (req, res, next) => {
  try {
    const { companyid } = req.body;

    const employer = await Company.findById(companyid, {})
      .populate('adminid', 'email username');

    return res.json({
      success: true,
      code: httpStatus.OK,
      employer,
    });
  } catch (error) {
    return next(error);
  }
};

exports.createsupervisor = async (req, res, next) => {
  try {
    const {
      username, email, password, employerrole,companyid
    } = req.body;
    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

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
    const { companyid } = req.body;

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
