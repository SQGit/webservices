const httpStatus = require('http-status');
const Company = require('../../models/employer/company.model');
const Employer = require('../../models/employer/employer.model');
const Job = require('../../models/jobs/job.model');
const Jobseeker = require('../../models/jobseeker/jobseeker.model');
const moment = require('moment');

const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;


exports.createjob = async (req, res, next) => {
  try {
    const {
      project, department, jobtitle, jobdescription, jobspecialization, otherjobspecialization, employmenttype,
      numberofpax, jobperiodfrom, jobperiodto, starttime, endtime, breaktime, addressblock, addressunit, addressstreet, addresspostalcode, addressregion, addresslocation, workingenvironment, companyid, autooffer, autoofferaccept, workdaystype, graceperiod, overtimerounding,
      sunday, monday, tuesday, wednesday,
      thursday, friday, saturday,
    } = req.body;

    const hiringstatus = 'closed';
    const jobstatus = 'pending';
    const jobaddedby = 'employer';


    const workdays = {
      sunday,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
    };

    const createdAt = moment().format('YYYY/MM/DD H:mm:ss');

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
      companyid,
      hiringstatus,
      jobstatus,
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
      autoofferaccept, workdaystype, graceperiod,
      overtimerounding, sunday, monday, tuesday, wednesday,
      thursday, friday, saturday, jobid,
    } = req.body;


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

exports.jobslist = async (req, res, next) => {
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

exports.fetchalljobappliedjobseekers = async(req, res, next) => {
  try {
    const id = req.user._id;

    const checkemployer = await Employer.findOne({_id: id},{})
      .populate('companyid', 'companyname companycode profile uennumber industry country registeredby termsandconditions _id');

    const company = {
      _id: checkemployer.companyid._id,
      companyname: checkemployer.companyid.companyname,
      companycode: checkemployer.companyid.companycode,
      profile: checkemployer.companyid.profile,
      uennumber: checkemployer.companyid.uennumber,
      industry: checkemployer.companyid.industry,
      country: checkemployer.companyid.country,
      registeredby: checkemployer.companyid.registeredby,
      termsandconditions: checkemployer.companyid.termsandconditions
    }

    const appliedjobseekers = await Employer.aggregate([
      {$match: {_id: ObjectId(id)}},
      {
        $lookup: {
          from: 'companies',
          localField: 'companyid',
          foreignField: '_id',
          as: 'company',
        },
      },
      {$unwind: '$company'},
      {
        $lookup: {
          from: 'jobs',
          localField: 'company.jobs.jobid',
          foreignField: '_id',
          as: 'company.jobs',
        },
      },
      {$unwind: '$company.jobs'},
      {$unwind: '$company.jobs.jobseekers'},
      { $match: { 'company.jobs.jobseekers.status': 'applied' } },
      {
        $lookup: {
          from: 'jobseekers',
          localField: 'company.jobs.jobseekers.jobseekerid',
          foreignField: '_id',
          as: 'company.jobs.jobseekersnew',
        },
      },
      {
        $project: {
          _id: 0,
          job: '$company.jobs'
        }
      },
      {$unwind: '$job.jobseekersnew'},
      {
        $project: {
          'job._id': '$job._id',
          'job.jobtitle': '$job.jobtitle',
          'job.jobnumber': '$job.jobnumber',
          'jobseeker._id': '$job.jobseekersnew._id',
          'jobseeker.username': '$job.jobseekersnew.username',
          'jobseeker.email': '$job.jobseekersnew.email',
          'appliedAt': '$job.jobseekers.appliedAt'
        }
      }
    ])

    return res.json({
      success: true,
      code: httpStatus.OK,
      appliedjobseekers,
      company
    })
  } catch (error) {
    return next(error)
  }
}


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


exports.fetchparticularjobsignedcandidates = async (req, res, next) => {
  try {
    const { jobid } = req.body;

    const job = await Job.findById(jobid, { _id: 1, candidatessigned: 1 })
      .populate('candidatessigned', 'username email mobileno _id jobsselected')
      .populate('companyid', 'companyname companycode');
    return res.json({
      success: true,
      code: httpStatus.OK,
      job,
    });
  } catch (error) {
    return next(error);
  }
};


exports.fetchpendingjobs = async (req, res, next) => {
  try {
    const { companyid } = req.body;

    const pendingjobs = await Job.find({ jobstatus: 'pending', companyid })
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


exports.changejobstatus = async (req, res, next) => {
  try {
    const { jobstatus, jobid, companyid } = req.body;

    const checkjob = await Job.findOne({ _id: jobid, companyid }, {});

    if (!checkjob) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'nopermission',
      });
    }


    await Job.findByIdAndUpdate(jobid, { $set: { jobstatus } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'jobstatusupdated',
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
