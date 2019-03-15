const httpStatus = require('http-status');
const Company = require('../../models/employer/company.model');
const Jobseeker = require('../../models/jobseeker/jobseeker.model');
const Job = require('../../models/jobs/job.model');
const moment = require('moment');
const mongoose = require('mongoose');

const schedule = require('node-schedule');

const ObjectId = mongoose.Types.ObjectId;

exports.createjob = async (req, res, next) => {
  try {
    const {
      project, department, jobtitle, jobdescription, jobspecialization, otherjobspecialization, employmenttype,
      numberofpax, jobperiodfrom, jobperiodto, starttime, endtime, breaktime, addressblock, addressunit, addressstreet, addresspostalcode, addressregion, addresslocation, workingenvironment, companyid, autooffer, autoofferaccept, workdaystype, chargerate, markuprate, markupratetype, graceperiod, overtimerounding,
      sunday, monday, tuesday, wednesday,
      thursday, friday, saturday,
    } = req.body;

    let salary;
    let markuprateincurrency;

    const hiringstatus = 'open';
    const jobstatus = 'live';
    const jobaddedby = 'ooget-team';

    if (markupratetype === 'percentage') {
      salary = (1 - (markuprate / 100)) * chargerate;
      salary = salary.toFixed(1);
      markuprateincurrency = chargerate - salary;
      markuprateincurrency = markuprateincurrency.toFixed(1);
    } else {
      salary = chargerate - markuprate;
      salary = salary.toFixed(1);
      markuprateincurrency = markuprate;
    }

    const workdays = {
      sunday,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
    };


    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

    const workingenvironmentArray = [];
    const breaktimeArray = [];

    const job = await new Job({
      project,
      department,
      jobtitle,
      jobdescription,
      employmenttype,
      jobspecialization,
      otherjobspecialization,
      numberofpax,
      jobperiodfrom,
      jobperiodto,
      starttime,
      endtime,
      breaktime: [],
      addressblock,
      addressunit,
      addressstreet,
      addresspostalcode,
      addressregion,
      addresslocation,
      workingenvironment: [],
      chargerate,
      markuprate,
      markupratetype,
      salary,
      markuprateincurrency,
      companyid,
      jobstatus,
      hiringstatus,
      jobaddedby,
      graceperiod,
      overtimerounding,
      workdays,
      workdaystype,
      createdAt,
      autooffer,
      autoofferaccept,
    }).save();

    const jobid = job._id;

    if (workingenvironment !== undefined) {
      for (let i = 0; i < workingenvironment.length; i += 1) {
        workingenvironmentArray.push(Job.findByIdAndUpdate(
          jobid, { $push: { workingenvironment: workingenvironment[i] } },
          { safe: true, upsert: true, new: true },
        ));
      }

      await Promise.all(workingenvironmentArray);
    }

    if (breaktime !== undefined) {
      for (let i = 0; i < breaktime.length; i += 1) {
        breaktimeArray.push(Job.findByIdAndUpdate(
          jobid, { $push: { breaktime: breaktime[i] } },
          { safe: true, upsert: true, new: true },
        ));
      }

      await Promise.all(breaktimeArray);
    }

    const companyjob = {
      jobid,
      createdAt,
    };

    await Company.findOneAndUpdate({ _id: companyid }, { $push: { jobs: companyjob } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'jobcreated',
    });
  } catch (error) {
    return next(error);
  }
};


exports.updatejob = async (req, res, next) => {
  try {
    const {
      project, department, jobtitle, jobdescription, jobspecialization, otherjobspecialization,
      employmenttype, numberofpax, jobperiodfrom, jobperiodto, starttime, endtime,
      breaktime, addressblock, addressunit, addressstreet, addresspostalcode,
      addressregion, addresslocation, workingenvironment, autooffer,
      autoofferaccept, workdaystype, chargerate, markuprate, markupratetype, graceperiod,
      overtimerounding, sunday, monday, tuesday, wednesday,
      thursday, friday, saturday, jobid,
    } = req.body;

    let salary;
    let markuprateincurrency;

    if (markupratetype === 'percentage') {
      salary = (1 - (markuprate / 100)) * chargerate;
      salary = salary.toFixed(1);
      markuprateincurrency = chargerate - salary;
      markuprateincurrency = markuprateincurrency.toFixed(1);
    } else {
      salary = chargerate - markuprate;
      salary = salary.toFixed(1);
      markuprateincurrency = markuprate;
    }

    const workdays = {
      sunday,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
    };

    const workingenvironmentArray = [];
    const breaktimeArray = [];

    await Job.findOneAndUpdate({ _id: jobid }, {
      $set: {
        project,
        department,
        jobtitle,
        jobdescription,
        jobspecialization,
        otherjobspecialization,
        employmenttype,
        numberofpax,
        jobperiodfrom,
        jobperiodto,
        starttime,
        endtime,
        breaktime: [],
        addressblock,
        addressunit,
        addressstreet,
        addresspostalcode,
        addressregion,
        addresslocation,
        workingenvironment: [],
        autooffer,
        autoofferaccept,
        workdaystype,
        chargerate,
        markuprate,
        markupratetype,
        graceperiod,
        overtimerounding,
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
      },
    });

    if (workingenvironment !== undefined) {
      for (let i = 0; i < workingenvironment.length; i += 1) {
        workingenvironmentArray.push(Job.findByIdAndUpdate(
          jobid, {
            $push: { workingenvironment: workingenvironment[i] },
          },
          { safe: true, upsert: true, new: true },
        ));
      }

      await Promise.all(workingenvironmentArray);
    }

    if (breaktime !== undefined) {
      for (let i = 0; i < breaktime.length; i += 1) {
        breaktimeArray.push(Job.findByIdAndUpdate(
          jobid, { $push: { breaktime: breaktime[i] } },
          { safe: true, upsert: true, new: true },
        ));
      }

      await Promise.all(breaktimeArray);
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'jobupdated',
    });
  } catch (error) {
    return next(error);
  }
};

exports.jobslistbyemployer = async (req, res, next) => {
  try {
    const { companyid } = req.body;

    const jobs = await Job.find({ companyid }, { jobseekers: 0 });
    const company = await Company.findById(companyid, { jobs: 0 });

    return res.json({
      success: true,
      code: httpStatus.OK,
      company,
      jobs,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchparticularjob = async (req, res, next) => {
  try {
    const { jobid } = req.body;

    const job = await Job.findOne({ _id: jobid }, {})
      .populate('companyid', 'companyname companylogo companycode _id');

    return res.json({
      success: true,
      code: httpStatus.OK,
      job,
    });
  } catch (error) {
    return next(error);
  }
};


exports.fetchparticularjobappliedjobseekers = async (req, res, next) => {
  try {
    const { jobid } = req.body;

    const checkjobexist = await Job.findOne({ _id: jobid }, {});

    if (!checkjobexist) {
      return res.json({
        success: false,
        message: 'Job not exists',
      });
    }

    const checkjobseekersexist = await Job.findOne({ _id: jobid, jobseekers: { $gt: [] } });

    const companyid = checkjobexist.companyid;

    const companydetails = await Company.find({ _id: { $in: [ObjectId(companyid)] } }, {
      companyname: 1, companycode: 1, profile: 1, industry: 1, country: 1,
    });
    const jobdetails = await Job.findOne({ _id: jobid }, { jobseekers: 0 });

    if (!checkjobseekersexist) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        jobdetails,
        companydetails,
        appliedjobseekers: [],
      });
    }


    const checkappliedjobseekers = await Job.findOne({
      _id: jobid,
      jobseekers:
    { $elemMatch: { applied: { $exists: true } } },
    });

    if (!checkappliedjobseekers) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        jobdetails,
        companydetails,
        appliedjobseekers: [],
      });
    }

    const job = await Job.aggregate([
      { $match: { _id: ObjectId(jobid) } },
      { $unwind: '$jobseekers' },
      { $match: { 'jobseekers.applied': true } },
      {
        $lookup: {
          from: 'jobseekers',
          localField: 'jobseekers.jobseekerid',
          foreignField: '_id',
          as: 'jobseekers.jobseeker',
        },
      },
      {
        $group: {
          _id: {
            id: '$_id',
            jobid: '$jobid',
            jobseekerid: '$jobseekerid',
            createdAt: '$createdAt',
            companyid: '$companyid',
          },
          appliedjobseekers: { $push: '$jobseekers' },
        },
      },
      {
        $project: {
          'appliedjobseekers.jobseeker.jobs': 0,
          'appliedjobseekers.jobseeker.password': 0,
        },
      },
    ]);

    let appliedjobseekers = [];

    if (job.length > 0) {
      appliedjobseekers = job[0].appliedjobseekers;
    }
    return res.json({
      success: true,
      code: httpStatus.OK,
      jobdetails,
      companydetails,
      appliedjobseekers,
    });
  } catch (error) {
    return next(error);
  }
};


exports.fetchparticularjobacceptedjobseekers = async (req, res, next) => {
  try {
    const { jobid } = req.body;

    const checkjobexist = await Job.findOne({ _id: jobid }, {});

    if (!checkjobexist) {
      return res.json({
        success: false,
        message: 'Job not exists',
      });
    }

    const checkjobseekersexist = await Job.findOne({ _id: jobid, jobseekers: { $gt: [] } });

    const companyid = checkjobexist.companyid;

    const companydetails = await Company.find({ _id: { $in: [ObjectId(companyid)] } }, {
      companyname: 1, companycode: 1, profile: 1, industry: 1, country: 1,
    });
    const jobdetails = await Job.findOne({ _id: jobid }, { jobseekers: 0 });

    if (!checkjobseekersexist) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        jobdetails,
        companydetails,
        acceptedjobseekers: [],
      });
    }

    const checkacceptedjobseekers = await Job.findOne({
      _id: jobid,
      jobseekers:
    { $elemMatch: { accepted: { $exists: true } } },
    });

    if (!checkacceptedjobseekers) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        jobdetails,
        companydetails,
        acceptedjobseekers: [],
      });
    }


    const job = await Job.aggregate([
      { $match: { _id: ObjectId(jobid) } },
      { $unwind: '$jobseekers' },
      { $match: { 'jobseekers.accepted': true } },
      {
        $lookup: {
          from: 'jobseekers',
          localField: 'jobseekers.jobseekerid',
          foreignField: '_id',
          as: 'jobseekers.jobseeker',
        },
      },
      {
        $group: {
          _id: {
            id: '$_id',
            jobid: '$jobid',
            jobseekerid: '$jobseekerid',
            createdAt: '$createdAt',
            companyid: '$companyid',
          },
          acceptedjobseekers: { $push: '$jobseekers' },
        },
      },
      {
        $project: {
          'acceptedjobseekers.jobseeker.jobs': 0,
          'acceptedjobseekers.jobseeker.password': 0,
        },
      },
    ]);

    let acceptedjobseekers = [];

    if (job.length > 0) {
      acceptedjobseekers = job[0].acceptedjobseekers;
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      acceptedjobseekers,
      companydetails,
      jobdetails,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchpendingjobs = async (req, res, next) => {
  try {
    const pendingjobs = await Job.find({ jobstatus: 'pending' })
      .populate('companyid', 'companyname companylogo companycode _id');
    return res.json({
      success: true,
      code: httpStatus.OK,
      pendingjobs,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchlivejobs = async (req, res, next) => {
  try {
    const livejobs = await Job.find({ jobstatus: 'live' })
      .populate('companyid', 'companyname companylogo companycode _id');
    return res.json({
      success: true,
      code: httpStatus.OK,
      livejobs,
    });
  } catch (error) {
    return next(error);
  }
};

exports.changejobstatus = async (req, res, next) => {
  try {
    const { jobstatus, hiringstatus, jobid } = req.body;

    await Job.findByIdAndUpdate(jobid, { $set: { jobstatus, hiringstatus } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'jobstatusupdated',
    });
  } catch (error) {
    return next(error);
  }
};

exports.changehiringstatus = async (req, res, next) => {
  try {
    const { hiringstatus, jobid } = req.body;

    await Job.findByIdAndUpdate(jobid, { $set: { hiringstatus } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'hiringstatusupdated',
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatejobstatuswithpayinfo = async (req, res, next) => {
  try {
    const {
      jobid, chargerate, markuprate, markupratetype, jobstatus, hiringstatus,
    } = req.body;

    let salary;
    let markuprateincurrency;

    if (markupratetype === 'percentage') {
      salary = (1 - (markuprate / 100)) * chargerate;
      salary = salary.toFixed(1);
      markuprateincurrency = chargerate - salary;
      markuprateincurrency = markuprateincurrency.toFixed(1);
    } else {
      salary = chargerate - markuprate;
      salary = salary.toFixed(1);
      markuprateincurrency = markuprate;
    }

    await Job.findByIdAndUpdate(jobid, {
      $set: {
        chargerate, markuprate, markupratetype, salary, markuprateincurrency, jobstatus, hiringstatus,
      },
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'jobstatusupdatedwithpay',
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchparticularjobseeker = async (req, res, next) => {
  try {
    const { jobseekerid } = req.body;

    const jobseeker = await Jobseeker.findById(jobseekerid, { password: 0 });
    return res.json({
      success: true,
      code: httpStatus.OK,
      jobseeker,
    });
  } catch (error) {
    return next(error);
  }
};


exports.offerjob = async (req, res, next) => {
  try {
    const { jobid, jobseekerid } = req.body;

    const checkjobexist = await Job.findOne({ _id: jobid }, {});

    if (!checkjobexist) {
      return res.json({
        success: false,
        message: 'Job not exists',
      });
    }

    const checkofferedjobseekers = await Job.aggregate([
      { $match: { _id: ObjectId(jobid) } },
      { $unwind: '$jobseekers' },
      { $match: { 'jobseekers.offered': true, 'jobseekers.jobseekerid': ObjectId(jobseekerid) } },
    ]);

    if (checkofferedjobseekers.length !== 0) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'jobofferedalready',
      });
    }

    const job = await Job.findOne({ _id: jobid }, {});
    const numberofpax = job.numberofpax;

    const jobsofferedjobseekers = await Job.aggregate([
      { $match: { _id: ObjectId(jobid) } },
      { $unwind: '$jobseekers' },
      { $match: { 'jobseekers.offered': true } },
      {
        $group: {
          _id: {
            _id: '$_id',
          },
          numberofpax: { $first: '$numberofpax' },
          offeredjobseekers: { $push: '$jobseekers' },
        },
      },
      {
        $project: {
          _id: '$_id._id', numberofpax: '$numberofpax', offeredjobseekers: '$offeredjobseekers',
        },
      },
    ]);

    let offeredjobseekers = [];

    if (jobsofferedjobseekers.length > 0) {
      if (jobsofferedjobseekers[0].offeredjobseekers.length > 0) {
        offeredjobseekers = jobsofferedjobseekers[0].offeredjobseekers;
      }
    }


    let offeredjobseekerscount = 0;

    if (offeredjobseekers) {
      offeredjobseekerscount = offeredjobseekers.length;
    }

    if (offeredjobseekerscount === numberofpax) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'offerlimitreached',
      });
    }

    const status = 'offered';
    const offered = true;
    const offeredAt = moment().format('YYYY/MM/DD HH:mm:ss');

    await Jobseeker.findOneAndUpdate({ _id: jobseekerid, 'jobs.jobid': jobid }, { $set: { 'jobs.$.status': status, 'jobs.$.offered': offered, 'jobs.$.offeredAt': offeredAt } });
    await Job.findOneAndUpdate({ _id: jobid, 'jobseekers.jobseekerid': jobseekerid }, { $set: { 'jobseekers.$.status': status, 'jobseekers.$.offered': offered, 'jobseekers.$.offeredAt': offeredAt } });


    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'joboffered',
    });
  } catch (error) {
    return next(error);
  }
};

exports.closejob = schedule.scheduleJob('0 0 1 * * *', async () => {
  const today = moment().format('YYYY/MM/DD');
  const checkjobs = await Job.find({ jobstatus: 'live', jobperiodto: { $lt: today } });

  for (let i = 0; i < checkjobs.length; i++) {
    const jobid = checkjobs[i]._id;
    await Job.findByIdAndUpdate(jobid, { jobstatus: 'closed', hiringstatus: 'closed' });
  }
});

