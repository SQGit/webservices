const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Jobseeker = require('../../models/jobseeker/jobseeker.model');
const Job = require('../../models/jobs/job.model');
const Contract = require('../../models/jobs/contract.model');
const Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);

const ObjectId = mongoose.Types.ObjectId;


exports.jobslist = async (req, res, next) => {
  try {
    const id = req.user._id;
    const jobs = await Job.aggregate([
      { $match: { hiringstatus: 'open' } },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyid',
          foreignField: '_id',
          as: 'companydetails',
        },
      },
      {
        $project: {
          _id: 1,
          workdays: 1,
          project: 1,
          department: 1,
          jobtitle: 1,
          jobdescription: 1,
          employmenttype: 1,
          jobspecialization: 1,
          numberofpax: 1,
          jobperiodfrom: 1,
          jobperiodto: 1,
          starttime: 1,
          endtime: 1,
          breaktime: 1,
          addressunit: 1,
          addressstreet: 1,
          addresspostalcode: 1,
          addressregion: 1,
          addresslocation: 1,
          workingenvironment: 1,
          chargerate: 1,
          markuprate: 1,
          markupratetype: 1,
          salary: 1,
          markuprateincurrency: 1,
          jobstatus: 1,
          hiringstatus: 1,
          jobaddedby: 1,
          graceperiod: 1,
          overtimerounding: 1,
          workdaystype: 1,
          createdAt: 1,
          autooffer: 1,
          autoofferaccept: 1,
          numberofcontracts: 1,
          jobnumber: 1,
          addressblock: 1,
          otherjobspecialization: 1,
          'companydetails.companyname': 1,
          'companydetails.companycode': 1,
          'companydetails.profile': 1,
          'companydetails.uennumber': 1,
          'companydetails.industry': 1,
          'companydetails.companylogo': 1,
          savedjobseekers: {
            $filter: {
              input: '$savedjobseekers',
              as: 'savedjobseeker',
              cond: { $eq: ['$$savedjobseeker.jobseekerid', ObjectId(id)] },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          workdays: 1,
          project: 1,
          department: 1,
          jobtitle: 1,
          jobdescription: 1,
          employmenttype: 1,
          jobspecialization: 1,
          numberofpax: 1,
          jobperiodfrom: 1,
          jobperiodto: 1,
          starttime: 1,
          endtime: 1,
          breaktime: 1,
          addressunit: 1,
          addressstreet: 1,
          addresspostalcode: 1,
          addressregion: 1,
          addresslocation: 1,
          workingenvironment: 1,
          chargerate: 1,
          markuprate: 1,
          markupratetype: 1,
          salary: 1,
          markuprateincurrency: 1,
          jobstatus: 1,
          hiringstatus: 1,
          jobaddedby: 1,
          graceperiod: 1,
          overtimerounding: 1,
          workdaystype: 1,
          createdAt: 1,
          autooffer: 1,
          autoofferaccept: 1,
          numberofcontracts: 1,
          jobnumber: 1,
          addressblock: 1,
          otherjobspecialization: 1,
          'companydetails.companyname': 1,
          'companydetails.companycode': 1,
          'companydetails.profile': 1,
          'companydetails.uennumber': 1,
          'companydetails.industry': 1,
          'companydetails.companylogo': 1,
          savedjobseekers: {
            $cond: { if: { $isArray: '$savedjobseekers' }, then: { $size: '$savedjobseekers' }, else: 0 },
          },
        },
      },
      {
        $project: {
          _id: 1,
          workdays: 1,
          project: 1,
          department: 1,
          jobtitle: 1,
          jobdescription: 1,
          employmenttype: 1,
          jobspecialization: 1,
          numberofpax: 1,
          jobperiodfrom: 1,
          jobperiodto: 1,
          starttime: 1,
          endtime: 1,
          breaktime: 1,
          addressunit: 1,
          addressstreet: 1,
          addresspostalcode: 1,
          addressregion: 1,
          addresslocation: 1,
          workingenvironment: 1,
          chargerate: 1,
          markuprate: 1,
          markupratetype: 1,
          salary: 1,
          markuprateincurrency: 1,
          jobstatus: 1,
          hiringstatus: 1,
          jobaddedby: 1,
          graceperiod: 1,
          overtimerounding: 1,
          workdaystype: 1,
          createdAt: 1,
          autooffer: 1,
          autoofferaccept: 1,
          numberofcontracts: 1,
          jobnumber: 1,
          addressblock: 1,
          otherjobspecialization: 1,
          'companydetails.companyname': 1,
          'companydetails.companycode': 1,
          'companydetails.profile': 1,
          'companydetails.uennumber': 1,
          'companydetails.industry': 1,
          'companydetails.companylogo': 1,
          saved: {
            $cond: [{ $eq: ['$savedjobseekers', 1] }, true, false],
          },
        },
      },
    ]);

    return res.json({
      success: true,
      code: httpStatus.OK,
      jobs,
    });
  } catch (error) {
    return next(error);
  }
};

/* exports.fetchparticularjob = async (req, res, next) => {
  try {
    const { jobid } = req.body;

    const job = await Job.findById(jobid, {})
      .populate('companyid', 'companyname companycode profile uennumber industry companylogo');

    return res.json({
      success: true,
      code: httpStatus.OK,
      job,
    });
  } catch (error) {
    return next(error);
  }
}; */

exports.fetchparticularjob = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { jobid } = req.body;

    const job = await Job.aggregate([
      { $match: { _id: ObjectId(jobid) } },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyid',
          foreignField: '_id',
          as: 'companydetails',
        },
      },
      {
        $project: {
          _id: 1,
          workdays: 1,
          project: 1,
          department: 1,
          jobtitle: 1,
          jobdescription: 1,
          employmenttype: 1,
          jobspecialization: 1,
          numberofpax: 1,
          jobperiodfrom: 1,
          jobperiodto: 1,
          starttime: 1,
          endtime: 1,
          breaktime: 1,
          addressunit: 1,
          addressstreet: 1,
          addresspostalcode: 1,
          addressregion: 1,
          addresslocation: 1,
          workingenvironment: 1,
          chargerate: 1,
          markuprate: 1,
          markupratetype: 1,
          salary: 1,
          markuprateincurrency: 1,
          jobstatus: 1,
          hiringstatus: 1,
          jobaddedby: 1,
          graceperiod: 1,
          overtimerounding: 1,
          workdaystype: 1,
          createdAt: 1,
          autooffer: 1,
          autoofferaccept: 1,
          numberofcontracts: 1,
          jobnumber: 1,
          jobseekers: 1,
          addressblock: 1,
          otherjobspecialization: 1,
          'companydetails.companyname': 1,
          'companydetails.companycode': 1,
          'companydetails.profile': 1,
          'companydetails.uennumber': 1,
          'companydetails.industry': 1,
          'companydetails.companylogo': 1,
          savedjobseekers: {
            $filter: {
              input: '$savedjobseekers',
              as: 'savedjobseeker',
              cond: { $eq: ['$$savedjobseeker.jobseekerid', ObjectId(id)] },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          workdays: 1,
          project: 1,
          department: 1,
          jobtitle: 1,
          jobdescription: 1,
          employmenttype: 1,
          jobspecialization: 1,
          numberofpax: 1,
          jobperiodfrom: 1,
          jobperiodto: 1,
          starttime: 1,
          endtime: 1,
          breaktime: 1,
          addressunit: 1,
          addressstreet: 1,
          addresspostalcode: 1,
          addressregion: 1,
          addresslocation: 1,
          workingenvironment: 1,
          chargerate: 1,
          markuprate: 1,
          markupratetype: 1,
          salary: 1,
          markuprateincurrency: 1,
          jobstatus: 1,
          hiringstatus: 1,
          jobaddedby: 1,
          graceperiod: 1,
          overtimerounding: 1,
          workdaystype: 1,
          createdAt: 1,
          autooffer: 1,
          autoofferaccept: 1,
          numberofcontracts: 1,
          jobnumber: 1,
          jobseekers: 1,
          addressblock: 1,
          otherjobspecialization: 1,
          'companydetails.companyname': 1,
          'companydetails.companycode': 1,
          'companydetails.profile': 1,
          'companydetails.uennumber': 1,
          'companydetails.industry': 1,
          'companydetails.companylogo': 1,
          savedjobseekers: {
            $cond: { if: { $isArray: '$savedjobseekers' }, then: { $size: '$savedjobseekers' }, else: 0 },
          },
        },
      },
      {
        $project: {
          _id: 1,
          workdays: 1,
          project: 1,
          department: 1,
          jobtitle: 1,
          jobdescription: 1,
          employmenttype: 1,
          jobspecialization: 1,
          numberofpax: 1,
          jobperiodfrom: 1,
          jobperiodto: 1,
          starttime: 1,
          endtime: 1,
          breaktime: 1,
          addressunit: 1,
          addressstreet: 1,
          addresspostalcode: 1,
          addressregion: 1,
          addresslocation: 1,
          workingenvironment: 1,
          chargerate: 1,
          markuprate: 1,
          markupratetype: 1,
          salary: 1,
          markuprateincurrency: 1,
          jobstatus: 1,
          hiringstatus: 1,
          jobaddedby: 1,
          graceperiod: 1,
          overtimerounding: 1,
          workdaystype: 1,
          createdAt: 1,
          autooffer: 1,
          autoofferaccept: 1,
          numberofcontracts: 1,
          jobnumber: 1,
          jobseekers: 1,
          addressblock: 1,
          otherjobspecialization: 1,
          'companydetails.companyname': 1,
          'companydetails.companycode': 1,
          'companydetails.profile': 1,
          'companydetails.uennumber': 1,
          'companydetails.industry': 1,
          'companydetails.companylogo': 1,
          saved: {
            $cond: [{ $eq: ['$savedjobseekers', 1] }, true, false],
          },
        },
      },
    ]);

    return res.json({
      success: true,
      code: httpStatus.OK,
      job,
    });
  } catch (error) {
    return next(error);
  }
};

/* exports.myjobs = async (req, res, next) => {
  try {
    const id = req.user._id;

    const user = await Jobseeker.findById(id, {
      preferredspecialization: 1, preferredregion: 1, preferredlocation: 1, employmenttype: 1,
    });

    const specialization = await user.preferredspecialization;
    const region = await user.preferredregion;
    const location = await user.preferredlocation;
    const useremploymenttype = await user.employmenttype;

    const matches = await Job.find({
      addressregion: { $in: region }, addresslocation: { $in: location }, jobspecialization: { $in: specialization }, employmenttype: { $in: useremploymenttype }, jobstatus: 'live',
    }, {}).populate('companyid', 'companyname companycode profile uennumber industry companylogo');

    return res.json({
      success: true,
      code: httpStatus.OK,
      matches,
    });
  } catch (error) {
    return next(error);
  }
}; */

exports.myjobs = async (req, res, next) => {
  try {
    const id = req.user._id;

    const user = await Jobseeker.findById(id, {
      preferredspecialization: 1, preferredregion: 1, preferredlocation: 1, employmenttype: 1,
    });

    const specialization = await user.preferredspecialization;
    const region = await user.preferredregion;
    const location = await user.preferredlocation;
    const useremploymenttype = await user.employmenttype;

    const matches = await Job.aggregate([
      {
        $match: {
          addressregion: { $in: region }, addresslocation: { $in: location }, jobspecialization: { $in: specialization }, employmenttype: { $in: useremploymenttype }, hiringstatus: 'open',
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyid',
          foreignField: '_id',
          as: 'companydetails',
        },
      },
      {
        $project: {
          _id: 1,
          workdays: 1,
          project: 1,
          department: 1,
          jobtitle: 1,
          jobdescription: 1,
          employmenttype: 1,
          jobspecialization: 1,
          numberofpax: 1,
          jobperiodfrom: 1,
          jobperiodto: 1,
          starttime: 1,
          endtime: 1,
          breaktime: 1,
          addressunit: 1,
          addressstreet: 1,
          addresspostalcode: 1,
          addressregion: 1,
          addresslocation: 1,
          workingenvironment: 1,
          chargerate: 1,
          markuprate: 1,
          markupratetype: 1,
          salary: 1,
          markuprateincurrency: 1,
          jobstatus: 1,
          hiringstatus: 1,
          jobaddedby: 1,
          graceperiod: 1,
          overtimerounding: 1,
          workdaystype: 1,
          createdAt: 1,
          autooffer: 1,
          autoofferaccept: 1,
          numberofcontracts: 1,
          jobnumber: 1,
          addressblock: 1,
          otherjobspecialization: 1,
          'companydetails.companyname': 1,
          'companydetails.companycode': 1,
          'companydetails.profile': 1,
          'companydetails.uennumber': 1,
          'companydetails.industry': 1,
          'companydetails.companylogo': 1,
          savedjobseekers: {
            $filter: {
              input: '$savedjobseekers',
              as: 'savedjobseeker',
              cond: { $eq: ['$$savedjobseeker.jobseekerid', ObjectId(id)] },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          workdays: 1,
          project: 1,
          department: 1,
          jobtitle: 1,
          jobdescription: 1,
          employmenttype: 1,
          jobspecialization: 1,
          numberofpax: 1,
          jobperiodfrom: 1,
          jobperiodto: 1,
          starttime: 1,
          endtime: 1,
          breaktime: 1,
          addressunit: 1,
          addressstreet: 1,
          addresspostalcode: 1,
          addressregion: 1,
          addresslocation: 1,
          workingenvironment: 1,
          chargerate: 1,
          markuprate: 1,
          markupratetype: 1,
          salary: 1,
          markuprateincurrency: 1,
          jobstatus: 1,
          hiringstatus: 1,
          jobaddedby: 1,
          graceperiod: 1,
          overtimerounding: 1,
          workdaystype: 1,
          createdAt: 1,
          autooffer: 1,
          autoofferaccept: 1,
          numberofcontracts: 1,
          jobnumber: 1,
          addressblock: 1,
          otherjobspecialization: 1,
          'companydetails.companyname': 1,
          'companydetails.companycode': 1,
          'companydetails.profile': 1,
          'companydetails.uennumber': 1,
          'companydetails.industry': 1,
          'companydetails.companylogo': 1,
          savedjobseekers: {
            $cond: { if: { $isArray: '$savedjobseekers' }, then: { $size: '$savedjobseekers' }, else: 0 },
          },
        },
      },
      {
        $project: {
          _id: 1,
          workdays: 1,
          project: 1,
          department: 1,
          jobtitle: 1,
          jobdescription: 1,
          employmenttype: 1,
          jobspecialization: 1,
          numberofpax: 1,
          jobperiodfrom: 1,
          jobperiodto: 1,
          starttime: 1,
          endtime: 1,
          breaktime: 1,
          addressunit: 1,
          addressstreet: 1,
          addresspostalcode: 1,
          addressregion: 1,
          addresslocation: 1,
          workingenvironment: 1,
          chargerate: 1,
          markuprate: 1,
          markupratetype: 1,
          salary: 1,
          markuprateincurrency: 1,
          jobstatus: 1,
          hiringstatus: 1,
          jobaddedby: 1,
          graceperiod: 1,
          overtimerounding: 1,
          workdaystype: 1,
          createdAt: 1,
          autooffer: 1,
          autoofferaccept: 1,
          numberofcontracts: 1,
          jobnumber: 1,
          addressblock: 1,
          otherjobspecialization: 1,
          'companydetails.companyname': 1,
          'companydetails.companycode': 1,
          'companydetails.profile': 1,
          'companydetails.uennumber': 1,
          'companydetails.industry': 1,
          'companydetails.companylogo': 1,
          saved: {
            $cond: [{ $eq: ['$savedjobseekers', 1] }, true, false],
          },
        },
      },
    ]);

    return res.json({
      success: true,
      code: httpStatus.OK,
      matches,
    });
  } catch (error) {
    return next(error);
  }
};

exports.applytojob = async (req, res, next) => {
  const id = req.user._id;
  const { jobid } = req.body;

  const checkjobexist = await Jobseeker.findOne({ _id: id, 'jobs.jobid': ObjectId(jobid) });

  if (checkjobexist) {
    return res.json({
      success: false,
      code: httpStatus.CONFLICT,
      message: 'appliedalready',
    });
  }

  const job = await Job.findOne({ _id: jobid }, {
    hiringstatus: 1, jobperiodfrom: 1, jobperiodto: 1, starttime: 1, endtime: 1,
  });
  const checkhiringstatus = job.hiringstatus;

  const checkjobperiodfrom = job.jobperiodfrom;
  const checkjobperiodto = job.jobperiodto;
  const checkstarttime = job.starttime;
  const checkendtime = job.endtime;

  if (checkhiringstatus === 'closed') {
    return res.json({
      success: false,
      code: httpStatus.NOT_ACCEPTABLE,
      message: 'applicationclosed',
    });
  }

  const accept = await Jobseeker.aggregate([
    { $match: { _id: ObjectId(id) } },
    { $unwind: '$jobs' },
    { $match: { 'jobs.accepted': true } },
    {
      $lookup: {
        from: 'jobs',
        localField: 'jobs.jobid',
        foreignField: '_id',
        as: 'jobs.jobdetails',
      },
    },
    {
      $group: {
        _id: {
          _id: '$_id',
        },
        acceptedjobs: {
          $push: '$jobs.jobdetails',
        },
      },
    },
    {
      $project: {
        _id: '$_id._id',
        acceptedjobs: {
          $reduce: {
            input: '$acceptedjobs',
            initialValue: [],
            in: { $concatArrays: ['$$value', '$$this'] },
          },
        },
      },
    },
    {
      $project: {
        _id: '$_id',
        'acceptedjobs._id': 1,
        'acceptedjobs.hiringstatus': 1,
        'acceptedjobs.jobstatus': 1,
        'acceptedjobs.jobperiodfrom': 1,
        'acceptedjobs.jobperiodto': 1,
        'acceptedjobs.starttime': 1,
        'acceptedjobs.endtime': 1,
      },
    },
  ]);

  let acceptedjobs = [];

  if (accept.length > 0) {
    acceptedjobs = accept[0].acceptedjobs;
  }

  const newacceptedjobs = [];
  const datedjobs = [];
  const timedjobs = [];

  if (acceptedjobs.length > 0) {
    for (const a of acceptedjobs) {
      if (a.hiringstatus !== 'closed') {
        newacceptedjobs.push(a);
      }
    }


    for (const n of newacceptedjobs) {
      const isFromDate1 = n.jobperiodfrom <= checkjobperiodfrom;
      const isFromDate2 = checkjobperiodfrom <= n.jobperiodto;

      const isToDate1 = n.jobperiodfrom <= checkjobperiodto;
      const isToDate2 = checkjobperiodto <= n.jobperiodto;


      if ((isFromDate1 && isFromDate2) || (isToDate1 && isToDate2)) {
        datedjobs.push(n);
      }
    }


    for (const d of datedjobs) {
      d.starttime = moment(d.starttime, 'HH:mm').subtract(1, 'hour').format('HH:mm');
      d.endtime = moment(d.endtime, 'HH:mm').add(1, 'hour').format('HH:mm');
      const isStartTime1 = d.starttime <= checkstarttime;
      const isStartTime2 = checkstarttime <= d.endtime;

      const isEndTime1 = d.starttime <= checkendtime;
      const isEndTime2 = checkendtime <= d.endtime;

      if ((isStartTime1 && isStartTime2) || (isEndTime1 && isEndTime2)) {
        timedjobs.push(d);
      }
    }
  }

  if (timedjobs.length > 0) {
    return res.json({
      success: false,
      code: httpStatus.NOT_ACCEPTABLE,
      message: 'conflictjob',
    });
  }


  return res.json({
    success: true,
    code: httpStatus.OK,
    message: 'applicationsuccess',
    newacceptedjobs,
  });
};


exports.fetchappliedjobs = async (req, res, next) => {
  try {
    const id = req.user._id;

    const jobseeker = await Jobseeker.aggregate([
      { $match: { _id: ObjectId(id) } },
      { $unwind: '$jobs' },
      { $match: { 'jobs.applied': true } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobs.jobid',
          foreignField: '_id',
          as: 'jobs.jobdetails',
        },
      },
      { $unwind: '$jobs.jobdetails' },
      {
        $lookup: {
          from: 'companies',
          localField: 'jobs.jobdetails.companyid',
          foreignField: '_id',
          as: 'jobs.jobdetails.companydetails',
        },
      },
      {
        $group: {
          _id: {
            id: '$_id',
            jobid: '$jobid',
            jobseekerid: '$jobseekerid',
            createdAt: '$createdAt',
            savedjobs: '$savedjobs',
          },
          appliedjobs: { $push: '$jobs.jobdetails' },
        },
      },
      {
        $project: {
          'appliedjobs._id': 1,
          'appliedjobs.workdays': 1,
          'appliedjobs.project': 1,
          'appliedjobs.department': 1,
          'appliedjobs.jobtitle': 1,
          'appliedjobs.jobdescription': 1,
          'appliedjobs.employmenttype': 1,
          'appliedjobs.jobspecialization': 1,
          'appliedjobs.numberofpax': 1,
          'appliedjobs.jobperiodfrom': 1,
          'appliedjobs.jobperiodto': 1,
          'appliedjobs.starttime': 1,
          'appliedjobs.endtime': 1,
          'appliedjobs.breaktime': 1,
          'appliedjobs.addressunit': 1,
          'appliedjobs.addressstreet': 1,
          'appliedjobs.addresspostalcode': 1,
          'appliedjobs.addressregion': 1,
          'appliedjobs.addresslocation': 1,
          'appliedjobs.workingenvironment': 1,
          'appliedjobs.chargerate': 1,
          'appliedjobs.markuprate': 1,
          'appliedjobs.markupratetype': 1,
          'appliedjobs.salary': 1,
          'appliedjobs.markuprateincurrency': 1,
          'appliedjobs.jobstatus': 1,
          'appliejobs.hiringstatus': 1,
          'appliedjobs.jobaddedby': 1,
          'appliedjobs.graceperiod': 1,
          'appliedjobs.overtimerounding': 1,
          'appliedjobs.workdaystype': 1,
          'appliedjobs.createdAt': 1,
          'appliedjobs.autooffer': 1,
          'appliedjobs.autoofferaccept': 1,
          'appliedjobs.numberofcontracts': 1,
          'appliedjobs.jobnumber': 1,
          'appliedjobs.addressblock': 1,
          'appliedjobs.otherjobspecialization': 1,
          'appliedjobs.companydetails.companyname': 1,
          'appliedjobs.companydetails.companycode': 1,
          'appliedjobs.companydetails.profile': 1,
          'appliedjobs.companydetails.uennumber': 1,
          'appliedjobs.companydetails.industry': 1,
          'appliedjobs.companydetails.companylogo': 1,
        },
      },

    ]);

    let appliedjobs = [];
    const savedjobs = [];

    let jobseekersavedjobs = [];

    if (jobseeker.length > 0) {
      appliedjobs = jobseeker[0].appliedjobs;
      jobseekersavedjobs = jobseeker[0]._id.savedjobs;
    }

    for (i = 0; i < jobseekersavedjobs.length; i++) {
      savedjobs.push(jobseekersavedjobs[i].jobid);
    }

    if (appliedjobs.length > 0) {
      for (i = 0; i < appliedjobs.length; i++) {
        for (j = 0; j < savedjobs.length; j++) {
          if (String(appliedjobs[i]._id) == String(savedjobs[j])) {
            appliedjobs[i].saved = appliedjobs[i].saved || true;
          } else {
            appliedjobs[i].saved = appliedjobs[i].saved || false;
          }
        }
      }
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      appliedjobs,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchofferedjobs = async (req, res, next) => {
  try {
    const id = req.user._id;

    const jobseeker = await Jobseeker.aggregate([
      { $match: { _id: ObjectId(id) } },
      { $unwind: '$jobs' },
      { $match: { 'jobs.offered': true } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobs.jobid',
          foreignField: '_id',
          as: 'jobs.jobdetails',
        },
      },
      { $unwind: '$jobs.jobdetails' },
      {
        $lookup: {
          from: 'companies',
          localField: 'jobs.jobdetails.companyid',
          foreignField: '_id',
          as: 'jobs.jobdetails.companydetails',
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            jobid: '$jobid',
            jobseekerid: '$jobseekerid',
            createdAt: '$createdAt',
          },
          offeredjobs: { $push: '$jobs' },
        },
      },
      {
        $project: {
          'offeredjobs.jobdetails.jobseekers': 0,
          'offeredjobs.jobdetails.companydetails.uennumber': 0,
          'offeredjobs.jobdetails.companydetails.registeredby': 0,
          'offeredjobs.jobdetails.companydetails.termsaccepted': 0,
          'offeredjobs.jobdetails.companydetails.activestatus': 0,
          'offeredjobs.jobdetails.companydetails.jobs': 0,
          'offeredjobs.jobdetails.companydetails.termsandconditions': 0,
          'offeredjobs.jobdetails.companydetails.adminid': 0,
        },
      },
    ]);

    let offeredjobs = null;

    if (jobseeker.length > 0) {
      offeredjobs = jobseeker[0].offeredjobs;
    }


    return res.json({
      success: true,
      code: httpStatus.OK,
      offeredjobs,
    });
  } catch (error) {
    return next(error);
  }
};


exports.joboffers = async (req, res, next) => {
  try {
    const id = req.user._id;

    const jobseeker = await Jobseeker.aggregate([
      { $match: { _id: ObjectId(id) } },
      { $unwind: '$jobs' },
      { $match: { 'jobs.offered': true } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobs.jobid',
          foreignField: '_id',
          as: 'jobs.jobdetails',
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            jobid: '$jobid',
            jobseekerid: '$jobseekerid',
            createdAt: '$createdAt',
          },
          joboffers: { $push: '$jobs' },
        },
      },
      {
        $project: {
          _id: 0,
          joboffers: 1,
        },
      },
    ]);

    let joboffers = null;

    if (jobseeker.length > 0) {
      joboffers = jobseeker[0].joboffers;
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      joboffers,
    });
  } catch (error) {
    return next(error);
  }
};


exports.rejectjob = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { jobid } = req.body;

    const checkjobrejected = await Jobseeker.findOne({ _id: id, 'jobs.jobid': ObjectId(jobid), 'jobs.rejected': true });

    if (checkjobrejected) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'rejectedalready',
      });
    }

    const job = await Job.findOne({ _id: jobid }, { hiringstatus: 1 });
    const checkhiringstatus = job.hiringstatus;


    if (checkhiringstatus === 'closed') {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'applicationclosed',
      });
    }

    const status = 'rejected';
    const rejected = true;
    const rejectedAt = moment().format('YYYY/MM/DD HH:mm:ss');

    await Jobseeker.findOneAndUpdate({ _id: id, 'jobs.jobid': jobid }, { $set: { 'jobs.$.status': status, 'jobs.$.rejected': rejected, 'jobs.$.rejectedAt': rejectedAt } });
    await Job.findOneAndUpdate({ _id: jobid, 'jobseekers.jobseekerid': id }, { $set: { 'jobseekers.$.status': status, 'jobseekers.$.rejected': rejected, 'jobseekers.$.rejectedAt': rejectedAt } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'rejectionsuccess',
    });
  } catch (error) {
    return next(error);
  }
};


exports.confirmjob = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { jobid, contractstatus } = req.body;

    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

    const checkcontract = await Contract.findOne({ jobid, jobseekerid: id }, {});

    if (checkcontract) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'contractstarted',
      });
    }

    const job = await Job.findOne({ _id: jobid }, {
      hiringstatus: 1, jobperiodfrom: 1, jobperiodto: 1, starttime: 1, endtime: 1,
    });

    const checkhiringstatus = job.hiringstatus;
    const checkjobperiodfrom = job.jobperiodfrom;
    const checkjobperiodto = job.jobperiodto;
    const checkstarttime = job.starttime;
    const checkendtime = job.endtime;

    if (checkhiringstatus === 'closed') {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'applicationclosed',
      });
    }


    const accept = await Jobseeker.aggregate([
      { $match: { _id: ObjectId(id) } },
      { $unwind: '$jobs' },
      { $match: { 'jobs.accepted': true } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobs.jobid',
          foreignField: '_id',
          as: 'jobs.jobdetails',
        },
      },
      {
        $group: {
          _id: {
            id: '$_id',
          },
          acceptedjobs: { $push: '$jobs' },
        },
      },
      {
        $project: {
          'acceptedjobs.jobdetails.jobstatus': 1,
          'acceptedjobs.jobdetails.hiringstatus': 1,
          'acceptedjobs.jobdetails.jobperiodfrom': 1,
          'acceptedjobs.jobdetails.jobperiodto': 1,
          'acceptedjobs.jobdetails.starttime': 1,
          'acceptedjobs.jobdetails.endtime': 1,
        },
      },
    ]);

    let acceptedjobs = null;

    if (accept.length > 0) {
      acceptedjobs = accept[0].acceptedjobs;
    }

    const newacceptedjobs = [];
    const datedjobs = [];
    const timedjobs = [];

    if (acceptedjobs) {
      for (const a of acceptedjobs) {
        if (a.jobdetails[0].hiringstatus !== 'closed') {
          newacceptedjobs.push(a.jobdetails[0]);
        }
      }


      for (const n of newacceptedjobs) {
        const isFromDate1 = n.jobperiodfrom <= checkjobperiodfrom;
        const isFromDate2 = checkjobperiodfrom <= n.jobperiodto;

        const isToDate1 = n.jobperiodfrom <= checkjobperiodto;
        const isToDate2 = checkjobperiodto <= n.jobperiodto;


        if ((isFromDate1 && isFromDate2) || (isToDate1 && isToDate2)) {
          datedjobs.push(n);
        }
      }


      for (const d of datedjobs) {
        d.starttime = moment(d.starttime, 'HH:mm').subtract(1, 'hour').format('HH:mm');
        d.endtime = moment(d.endtime, 'HH:mm').add(1, 'hour').format('HH:mm');

        if(d.endtime > d.starttime){
          d.endtime = moment(d.endtime, 'HH:mm').add(1, 'hour').format('YYYY/MM/DD HH:mm');
        } else if (d.endtime < d.starttime) {
          d.endtime = moment(d.endtime, 'HH:mm').add(25, 'hours').format('YYYY/MM/DD HH:mm');
        }

        d.starttime = moment(d.starttime, 'HH:mm').format('YYYY/MM/DD HH:mm');

        if(checkendtime > checkstarttime){
          var datedEndtime = moment(checkendtime, 'HH:mm').format('YYYY/MM/DD HH:mm');
        }else if (checkendtime < checkstarttime){
          var datedEndtime = moment(checkendtime, 'HH:mm').add(1,'day').format('YYYY/MM/DD HH:mm');
        }

        const datedStarttime = moment(checkstarttime, 'HH:mm').format('YYYY/MM/DD HH:mm');
       

        const dates1 = [moment(d.starttime,'YYYY/MM/DD HH:mm'),moment(d.endtime,'YYYY/MM/DD HH:mm')];

        const dates2 = [moment(datedStarttime,'YYYY/MM/DD HH:mm'),moment(datedEndtime,'YYYY/MM/DD HH:mm')];


        const range1 = moment.range(dates1)
        const range2 = moment.range(dates2)


        if (range1.overlaps(range2)) {
          timedjobs.push(d);
        }

      }


    }


    if (timedjobs.length > 0) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'conflictjob',
      });
    }



    const application = await Jobseeker.findOne({ _id: id, 'jobs.jobid': ObjectId(jobid) }, { 'jobs.$.status': 1 });

    const applicationstatus = application.jobs[0].status;

    if (applicationstatus === 'rejected') {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'rejectedalready',
      });
    }

    const contract = await new Contract({
      contractstatus,
      jobid,
      jobseekerid: id,
      createdAt,
    }).save();

    const contractid = contract._id;

    const status = 'accepted';
    const accepted = true;
    const acceptedAt = moment().format('YYYY/MM/DD HH:mm:ss');

    await Jobseeker.findOneAndUpdate({ _id: id, 'jobs.jobid': jobid }, {
      $set: {
        'jobs.$.status': status, 'jobs.$.accepted': accepted, 'jobs.$.acceptedAt': acceptedAt, 'jobs.$.contractid': contractid,
      },
    });

    await Job.findOneAndUpdate({ _id: jobid, 'jobseekers.jobseekerid': id }, {
      $set: {
        'jobseekers.$.status': status, 'jobseekers.$.accepted': accepted, 'jobseekers.$.acceptedAt': acceptedAt, 'jobseekers.$.contractid': contractid,
      },
    });

    await Job.findOneAndUpdate({ _id: jobid, 'jobseekers.jobseekerid': id }, { $inc: { numberofcontracts: 1 } });

    const checkjobpax = await Job.findOne({ _id: jobid }, { numberofpax: 1 });
    const numberofpax = checkjobpax.numberofpax;

    const checkjobaccepted = await Job.aggregate([
      { $match: { _id: ObjectId(jobid) } },
      { $unwind: '$jobseekers' },
      { $match: { 'jobseekers.accepted': true } },
      {
        $group: {
          _id: {
            id: '$_id',
            jobid: '$jobid',
            jobseekerid: '$jobseekerid',
            createdAt: '$createdAt',
          },
          acceptedjobseekers: { $push: '$jobseekers' },
        },
      },
      {
        $project: {
          acceptedjobseekers: 1,
        },
      },
    ]);

    let acceptedjobseekers = null;

    if (checkjobaccepted.length > 0) {
      acceptedjobseekers = checkjobaccepted[0].acceptedjobseekers;
    }

    let acceptedjobseekerscount = 0;

    if (acceptedjobseekers) {
      acceptedjobseekerscount = acceptedjobseekers.length;
    }


    if (acceptedjobseekerscount === numberofpax) {
      await Job.findOneAndUpdate({ _id: jobid }, { hiringstatus: 'closed' });
    }


    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'contractsigned',
    });
  } catch (error) {
    return next(error);
  }
};


exports.newapplytojob = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { jobid } = req.body;

    const checkjobexist = await Jobseeker.findOne({ _id: id, 'jobs.jobid': ObjectId(jobid) });

    if (checkjobexist) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'appliedalready',
      });
    }

    const job = await Job.findOne({ _id: jobid }, {
      numberofpax: 1, autooffer: 1, autoofferaccept: 1, hiringstatus: 1, jobperiodfrom: 1, jobperiodto: 1, starttime: 1, endtime: 1,
    });
    const checkhiringstatus = job.hiringstatus;
    const autooffer = job.autooffer;
    const autoofferaccept = job.autoofferaccept;
    const checkjobperiodfrom = job.jobperiodfrom;
    const checkjobperiodto = job.jobperiodto;
    const checkstarttime = job.starttime;
    const checkendtime = job.endtime;

    if (checkhiringstatus === 'closed') {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'applicationclosed',
      });
    }


    const accept = await Jobseeker.aggregate([
      { $match: { _id: ObjectId(id) } },
      { $unwind: '$jobs' },
      { $match: { 'jobs.accepted': true } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobs.jobid',
          foreignField: '_id',
          as: 'jobs.jobdetails',
        },
      },
      {
        $group: {
          _id: {
            id: '$_id',
          },
          acceptedjobs: { $push: '$jobs' },
        },
      },
      {
        $project: {
          'acceptedjobs.jobdetails.jobstatus': 1,
          'acceptedjobs.jobdetails.hiringstatus': 1,
          'acceptedjobs.jobdetails.jobperiodfrom': 1,
          'acceptedjobs.jobdetails.jobperiodto': 1,
          'acceptedjobs.jobdetails.starttime': 1,
          'acceptedjobs.jobdetails.endtime': 1,
        },
      },
    ]);

    let acceptedjobs = null;

    if (accept.length > 0) {
      acceptedjobs = accept[0].acceptedjobs;
    }

    const newacceptedjobs = [];
    const datedjobs = [];
    const timedjobs = [];

    if (acceptedjobs) {
      for (const a of acceptedjobs) {
        if (a.jobdetails[0].jobstatus !== 'closed') {
          newacceptedjobs.push(a.jobdetails[0]);
        }
      }


      for (const n of newacceptedjobs) {
        const isFromDate1 = n.jobperiodfrom <= checkjobperiodfrom;
        const isFromDate2 = checkjobperiodfrom <= n.jobperiodto;

        const isToDate1 = n.jobperiodfrom <= checkjobperiodto;
        const isToDate2 = checkjobperiodto <= n.jobperiodto;


        if ((isFromDate1 && isFromDate2) || (isToDate1 && isToDate2)) {
          datedjobs.push(n);
        }
      }

      for (const d of datedjobs) {
        d.starttime = moment(d.starttime, 'HH:mm').subtract(1, 'hour').format('HH:mm');
        d.endtime = moment(d.endtime, 'HH:mm').add(1, 'hour').format('HH:mm');

        if(d.endtime > d.starttime){
          d.endtime = moment(d.endtime, 'HH:mm').add(1, 'hour').format('YYYY/MM/DD HH:mm');
        } else if (d.endtime < d.starttime) {
          d.endtime = moment(d.endtime, 'HH:mm').add(25, 'hours').format('YYYY/MM/DD HH:mm');
        }

        d.starttime = moment(d.starttime, 'HH:mm').format('YYYY/MM/DD HH:mm');

        if(checkendtime > checkstarttime){
          var datedEndtime = moment(checkendtime, 'HH:mm').format('YYYY/MM/DD HH:mm');
        }else if (checkendtime < checkstarttime){
          var datedEndtime = moment(checkendtime, 'HH:mm').add(1,'day').format('YYYY/MM/DD HH:mm');
        }

        const datedStarttime = moment(checkstarttime, 'HH:mm').format('YYYY/MM/DD HH:mm');
       

        const dates1 = [moment(d.starttime,'YYYY/MM/DD HH:mm'),moment(d.endtime,'YYYY/MM/DD HH:mm')];

        const dates2 = [moment(datedStarttime,'YYYY/MM/DD HH:mm'),moment(datedEndtime,'YYYY/MM/DD HH:mm')];


        const range1 = moment.range(dates1)
        const range2 = moment.range(dates2)


        if (range1.overlaps(range2)) {
          timedjobs.push(d);
        }

      }


    } 

    if (timedjobs.length > 0) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'conflictjob',
      });
    }


    const appliedAt = moment().format('YYYY/MM/DD HH:mm:ss');

    const jobs = {
      jobid,
      status: 'applied',
      applied: true,
      appliedAt,
    };

    const jobseekers = {
      jobseekerid: id,
      status: 'applied',
      applied: true,
      appliedAt,
    };


    await Jobseeker.findOneAndUpdate({ _id: id }, { $push: { jobs } });
    await Job.findOneAndUpdate({ _id: jobid }, { $push: { jobseekers } });

    if (!autooffer) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'applicationsuccess',
      });
    }

    const checkofferedjobseekers = await Job.aggregate([
      { $match: { _id: ObjectId(jobid) } },
      { $unwind: '$jobseekers' },
      { $match: { 'jobseekers.offered': true, 'jobseekers.jobseekerid': ObjectId(id) } },
    ]);

    if (checkofferedjobseekers.length !== 0) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'jobofferedalready',
      });
    }

    const offeredjob = await Job.aggregate([
      { $match: { _id: ObjectId(jobid) } },
      { $unwind: '$jobseekers' },
      { $match: { 'jobseekers.offered': true } },
      {
        $group: {
          _id: {
            id: '$_id',
            jobid: '$jobid',
            jobseekerid: '$jobseekerid',
            createdAt: '$createdAt',
            numberofpax: '$numberofpax',
          },
          offeredjobseekers: { $push: '$jobseekers' },
        },
      },
      {
        $project: {
          offeredjobseekers: 1,
        },
      },
    ]);

    let offeredjobseekers = null;

    if (offeredjob.length > 0) {
      offeredjobseekers = offeredjob[0].offeredjobseekers;
    }

    let offeredjobseekerscount = 0;

    if (offeredjobseekers) {
      offeredjobseekerscount = offeredjobseekers.length;
    }


    let status = 'offered';
    const offered = true;
    const offeredAt = moment().format('YYYY/MM/DD HH:mm:ss');

    await Jobseeker.findOneAndUpdate({ _id: id, 'jobs.jobid': jobid }, { $set: { 'jobs.$.status': status, 'jobs.$.offered': offered, 'jobs.$.offeredAt': offeredAt } });
    await Job.findOneAndUpdate({ _id: jobid, 'jobseekers.jobseekerid': id }, { $set: { 'jobseekers.$.status': status, 'jobseekers.$.offered': offered, 'jobseekers.$.offeredAt': offeredAt } });

    if (!autoofferaccept) {
      return res.json({
        success: true,
        code: httpStatus.OK,
        message: 'joboffered',
      });
    }

    const contractstatus = 'open';

    const createdAt = moment().format('YYYY/MM/DD HH:mm:ss');

    const checkcontract = await Contract.find({ jobid, jobseekerid: id }, {});


    if ((checkcontract.length) >= 1) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'contractstartedalready',
      });
    }

    const contract = await new Contract({
      contractstatus,
      jobid,
      jobseekerid: id,
      createdAt,
    }).save();

    const contractid = contract._id;

    status = 'accepted';
    const accepted = true;
    const acceptedAt = moment().format('YYYY/MM/DD HH:mm:ss');

    await Jobseeker.findOneAndUpdate({ _id: id, 'jobs.jobid': jobid }, {
      $set: {
        'jobs.$.status': status, 'jobs.$.accepted': accepted, 'jobs.$.acceptedAt': acceptedAt, 'jobs.$.contractid': contractid,
      },
    });

    await Job.findOneAndUpdate({ _id: jobid, 'jobseekers.jobseekerid': id }, {
      $set: {
        'jobseekers.$.status': status, 'jobseekers.$.accepted': accepted, 'jobseekers.$.acceptedAt': acceptedAt, 'jobseekers.$.contractid': contractid,
      },
    });

    await Job.findOneAndUpdate({ _id: jobid, 'jobseekers.jobseekerid': id }, { $inc: { numberofcontracts: 1 } });

    const newcheckjob = await Job.findOne({ _id: jobid }, { numberofpax: 1 });
    const newnumberofpax = newcheckjob.numberofpax;

    const checkjobaccepted = await Job.aggregate([
      { $match: { _id: ObjectId(jobid) } },
      { $unwind: '$jobseekers' },
      { $match: { 'jobseekers.accepted': true } },
      {
        $group: {
          _id: {
            id: '$_id',
            jobid: '$jobid',
            jobseekerid: '$jobseekerid',
            createdAt: '$createdAt',
          },
          acceptedjobseekers: { $push: '$jobseekers' },
        },
      },
      {
        $project: {
          acceptedjobseekers: 1,
        },
      },
    ]);

    let acceptedjobseekers = null;

    if (checkjobaccepted.length > 0) {
      acceptedjobseekers = checkjobaccepted[0].acceptedjobseekers;
    }

    let acceptedjobseekerscount = 0;

    if (acceptedjobseekers) {
      acceptedjobseekerscount = acceptedjobseekers.length;
    }


    if (acceptedjobseekerscount >= newnumberofpax) {
      await Job.findOneAndUpdate({ _id: jobid }, { hiringstatus: 'closed' });
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'contractsigned',
    });
  } catch (error) {
    return next(error);
  }
};


exports.savejob = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { jobid } = req.body;

    const checkjobexist = await Jobseeker.findOne({ _id: id, 'savedjobs.jobid': ObjectId(jobid) });

    if (checkjobexist) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'Job saved already',
      });
    }

    const savedAt = moment().format('YYYY/MM/DD HH:mm:ss');

    const savedjobs = {
      jobid,
      savedAt,
    };

    const savedjobseekers = {
      jobseekerid: id,
      savedAt,
    };

    await Jobseeker.findOneAndUpdate({ _id: id }, { $push: { savedjobs } });

    await Job.findOneAndUpdate({ _id: jobid }, { $push: { savedjobseekers } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Job saved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.unsavejob = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { jobid } = req.body;

    const checkjobexist = await Jobseeker.findOne({ _id: id, 'savedjobs.jobid': ObjectId(jobid) });

    if (!checkjobexist) {
      return res.json({
        success: false,
        code: httpStatus.CONFLICT,
        message: 'Job is not saved already',
      });
    }

    await Jobseeker.findOneAndUpdate({ _id: id, 'savedjobs.jobid': jobid }, { $pull: { savedjobs: { jobid } } });

    await Job.findOneAndUpdate({ _id: jobid, 'savedjobseekers.jobseekerid': id }, { $pull: { savedjobseekers: { jobseekerid: id } } });

    return res.json({
      success: true,
      code: httpStatus.OK,
      message: 'Unsaved job successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchsavedjobs = async (req, res, next) => {
  try {
    const id = req.user._id;

    const jobs = await Jobseeker.aggregate([
      { $match: { _id: ObjectId(id) } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'savedjobs.jobid',
          foreignField: '_id',
          as: 'savedjobs',
        },
      },
      { $unwind: '$savedjobs' },
      {
        $lookup: {
          from: 'companies',
          localField: 'savedjobs.companyid',
          foreignField: '_id',
          as: 'savedjobs.companydetails',
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
          },
          savedjobs: { $push: '$savedjobs' },
        },
      },
      {
        $project: {
          'savedjobs.savedjobseekers': 0,
          'savedjobs.companydetails.jobs': 0,
        },
      },
    ]);

    let savedjobs = [];

    if (jobs.length > 0) {
      savedjobs = jobs[0].savedjobs;
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      savedjobs,
    });
  } catch (error) {
    return next(error);
  }
};

