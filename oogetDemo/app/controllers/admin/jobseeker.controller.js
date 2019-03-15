const httpStatus = require('http-status');
const Company = require('../../models/employer/company.model');
const Jobseeker = require('../../models/jobseeker/jobseeker.model');
const Job = require('../../models/jobs/job.model');
const moment = require('moment');
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const schedule = require('node-schedule');


const Accesscontrol = require('accesscontrol');

const ac = new Accesscontrol();
ac.grant('super')
  .createAny('jobseeker')
  .readAny('jobseeker', ['username', 'email']);

exports.fetchalljobseekers = async (req, res, next) => {
  try {
    const jobseekers = await Jobseeker.find({}, {password: 0});

    return res.json({
      success: true,
      code: httpStatus.OK,
      jobseekers,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchalljobseekersnew = async (req, res, next) => {
  try {
    const jobseekers = await Jobseeker.find({}, {username: 1, email: 1});

    return res.json({
      success: true,
      code: httpStatus.OK,
      jobseekers,
    });
  } catch (error) {
    return next(error);
  }
};



exports.updateactivestatus = async (req, res, next) => {
  try {

    const { jobseekerid, activestatus } = req.body;

    await Jobseeker.findByIdAndUpdate(jobseekerid, { $set: { activestatus } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'activestatuschanged',
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchpendingjobseekers = async (req, res, next) => {
  try {

    const pendingjobseekers = await Jobseeker.find({ activestatus: false }, {password: 0});

    return res.json({
      success: true,
      code: httpStatus.OK,
      pendingjobseekers,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatenriceditable = async (req, res, next) => {
  try {
    const { jobseekerid, nriceditable } = req.body;

    await Jobseeker.findByIdAndUpdate(jobseekerid, { $set: { nriceditable } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'nriceditableupdated',
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateidproofeditable = async (req, res, next) => {
  try {
    const { jobseekerid, jobseekeridproofeditable } = req.body;

    await Jobseeker.findByIdAndUpdate(jobseekerid, { $set: { jobseekeridproofeditable } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'jobseekeridproofeditablechanged',
    });
  } catch (error) {
    return next(error);
  }
};

exports.activatenotification = schedule.scheduleJob('0 0 1 * * *', async () => {
  const today = moment().format('YYYY/MM/DD');
  const jobseekers = await Jobseeker.find({ notificationalerttype: 'off', alertoffto: { $lt: today } });

  for (let i = 0; i < jobseekers.length; i++) {
    const jobseekerid = jobseekers[i]._id;
    await Jobseeker.findByIdAndUpdate(jobseekerid, {
      notificationalerttype: 'anytime', alertofffrom: '', alertoffto: '', alertswitchedoffdays: '',
    });
  }
});

exports.checkaccess = async (req, res, next) => {
  try {
    const jobseeker = await Jobseeker.findOne({ email: 'hari@sqindia.net' });

    const permission = ac.can('super').readAny('jobseeker');

    var data = null;

    if (!permission.granted) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
      });
    } else if (permission.granted) {
      var data = permission.filter(jobseeker.toObject());
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

