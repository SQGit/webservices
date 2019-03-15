const httpStatus = require('http-status');
const Company = require('../../models/employer/company.model');
const Job = require('../../models/jobs/job.model');
const Contract = require('../../models/jobs/contract.model');
const Payroll = require('../../models/jobs/payroll.model');
const Holiday = require('../../models/admin/holiday.model');
const moment = require('moment');
const mongoose = require('mongoose');
const Invoice = require('../../models/jobs/invoice.model');

const { ObjectId } = mongoose.Types;

const schedule = require('node-schedule');

function pad(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return `${number}`;
}

exports.contractslist = async (req, res, next) => {
  try {

    const { jobid } = req.body;

    const contracts = await Contract.find({ jobid }, {})
      .populate('jobseekerid', 'username email mobileno _id');

    return res.json({
      success: true,
      code: httpStatus.OK,
      contracts,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchparticularcontract = async (req, res, next) => {
  try {
    const { contractid } = req.body;

    const contract = await Contract.findById(contractid, {})
      .populate({
        path: 'jobid',
        select: '-candidatesapplied -candidatesseleceted -candidatessigned -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      })
      .populate('jobseekerid', 'username email mobileno accountno _id');

    return res.json({
      success: true,
      code: httpStatus.OK,
      contract,
    });
  } catch (error) {
    return next(error);
  }
};


exports.verifypunch = async (req, res, next) => {
  try {
    const {
      verifiedpunchouttime, contractid, timesheetid, verifiedpunchintime,
    } = req.body;

    let systempunchintime = verifiedpunchintime;
    const systempunchouttime = verifiedpunchouttime;

    const contract = await Contract.findOne({ _id: contractid }, {})
      .populate({
        path: 'jobid',
        select: '-candidatesapplied -candidatesseleceted -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      });

    const breaktime = contract.jobid.breaktime;

    let pay = contract.jobid.salary;
    const commission = contract.jobid.markuprateincurrency;
    let starttime = contract.jobid.starttime;
    let endtime = contract.jobid.endtime;
    const overtimerounding = contract.jobid.overtimerounding || 15;

    const punchinforbreak = moment(verifiedpunchintime, 'YYYY/MM/DD HH:mm').format('HH:mm');
    const punchoutforbreak = moment(verifiedpunchouttime, 'YYYY/MM/DD HH:mm').format('HH:mm');

    const graceperiod = contract.jobid.graceperiod;


    const timesheet = await Contract.findOne({ _id: contractid, timesheet: { $elemMatch: { _id: timesheetid } } }, { 'timesheet.$._id': 1 });

    if (!timesheet) {
      return res.json({
        success: false,
        code: httpStatus.NO_CONTENT,
        message: 'timesheetnotfound',
      });
    }


    let timesheetdate = null;


    let timesheetsalarymultiplier = null;

    if (timesheet) {
      timesheetdate = timesheet.timesheet[0].date;
      timesheetsalarymultiplier = timesheet.timesheet[0].salarymultiplier;
    }

    const initialstarttime = moment(timesheetdate + starttime, 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm');

    const gracestarttime = moment(timesheetdate + starttime, 'YYYY/MM/DD HH:mm').add(graceperiod, 'minutes').format('YYYY/MM/DD HH:mm');


    if (verifiedpunchintime < initialstarttime) {
      systempunchintime = initialstarttime;
    }

    if ((verifiedpunchintime > initialstarttime) && (verifiedpunchintime <= gracestarttime)) {
      if (graceperiod > 0) {
        systempunchintime = initialstarttime;
      }
    }

    const vBreaks = [];

    function validBreaks() {
      if (punchoutforbreak > punchinforbreak) {
        for (const b of breaktime) {
          if ((punchinforbreak < b.breakstart) && (punchoutforbreak > b.breakend)) {
            vBreaks.push(b);
          }
        }
      } else if (punchoutforbreak < punchinforbreak) {
        for (const b of breaktime) {
          if ((punchinforbreak < b.breakstart) && (punchoutforbreak < b.breakend)) {
            vBreaks.push(b);
          }
        }
      }
    }

    validBreaks();

    let breakduration = 0;

    function timeParse() {
      for (const v of vBreaks) {
        const end = moment(v.breakend, 'HH:mm');
        const start = moment(v.breakstart, 'HH:mm');

        const timeduration = moment.duration(end.diff(start));
        const breaktime = timeduration.asMinutes();
        breakduration += breaktime;
      }
    }

    timeParse();

    let totalbreakduration = 0;

    function totalBreaks() {
      for (const b of breaktime) {
        const end = moment(b.breakend, 'HH:mm');
        const start = moment(b.breakstart, 'HH:mm');

        const timeduration = moment.duration(end.diff(start));
        const breaktime = timeduration.asMinutes();
        totalbreakduration += breaktime;
      }
    }

    totalBreaks();

    if (endtime > starttime) {
      endtime = moment(endtime, 'HH:mm').format('YYYY/MM/DD HH:mm');
    } else if (endtime < starttime) {
      endtime = moment(endtime, 'HH:mm').add(1, 'day').format('YYYY/MM/DD HH:mm');
    }

    starttime = moment(starttime, 'HH:mm').format('YYYY/MM/DD HH:mm');

    const workend = moment(endtime, 'YYYY/MM/DD HH:mm');
    const workstart = moment(starttime, 'YYYY/MM/DD HH:mm');

    const workduration = moment.duration(workend.diff(workstart));
    let durationofwork = Math.round(workduration.asMinutes());

    durationofwork -= breakduration;

    let durationofworkhour = pad(Math.floor(durationofwork / 60), 2);
    let durationofworkminutes = pad(Math.floor(durationofwork % 60), 2);

    let totaldurationofwork = `${durationofworkhour}:${durationofworkminutes}`;

    const workedend = moment(systempunchouttime, 'YYYY/MM/DD HH:mm');
    const workedstart = moment(systempunchintime, 'YYYY/MM/DD HH:mm');

    const workedduration = moment.duration(workedend.diff(workedstart));

    let durationofworked = Math.round(workedduration.asMinutes());

    durationofworked -= breakduration;

    const durationofworkedhour = pad(Math.floor(durationofworked / 60), 2);
    const durationofworkedminutes = pad(Math.floor(durationofworked % 60), 2);

    const totaldurationofworked = `${durationofworkedhour}:${durationofworkedminutes}`;

    let payperquarter;

    let normalworkminutes;
    let normalworkhour;

    let otworkminutes;
    let otworkhour;

    let totalworkminutes;
    let totalworkhour;
    let normalsalary;
    let otsalary;
    let totalsalary;
    let normalemployercharges;
    let otemployercharges;
    let totalemployercharges;

    let oogetsnormalcommission;
    let oogetsovertimecommission;
    let oogetscommission;


    if (timesheetsalarymultiplier > 1) {
      normalworkhour = '00:00';
      otworkhour = totaldurationofworked;

      otworkminutes = durationofworked / 15;
      otworkminutes = Math.floor(otworkminutes);

      pay *= timesheetsalarymultiplier;
      payperquarter = pay / 4;

      totalworkminutes = durationofworked;
      totalworkhour = `${pad(Math.floor(totalworkminutes / 60), 2)}:${pad(Math.floor(totalworkminutes % 60), 2)}`;

      normalsalary = 0;


      otsalary = otworkminutes * payperquarter;
      otsalary = Math.floor(otsalary * 100) / 100;

      oogetsnormalcommission = 0;

      normalemployercharges = normalsalary + oogetsnormalcommission;

      oogetsovertimecommission = commission / 4;
      oogetsovertimecommission = otworkminutes * oogetsovertimecommission;

      oogetsovertimecommission = Math.floor(oogetsovertimecommission * 100) / 100;

      otemployercharges = otsalary + oogetsovertimecommission;


      totalsalary = normalsalary + otsalary;
      totalsalary = Math.round(totalsalary * 100) / 100;

      oogetscommission = oogetsnormalcommission + oogetsovertimecommission;

      oogetscommission = Math.round(oogetscommission * 100) / 100;

      totalemployercharges = normalemployercharges + otemployercharges;
      totalemployercharges = Math.round(totalemployercharges * 100) / 100;
    } else if (timesheetsalarymultiplier == 1) {
      if (durationofworked <= durationofwork) {
        normalworkhour = totaldurationofworked;

        normalworkminutes = durationofworked / 15;
        normalworkminutes = Math.floor(normalworkminutes);

        payperquarter = pay / 4;
        otworkminutes = 0;
        if (otworkminutes <= 29) {
          otworkminutes = 0;
          otworkhour = '00:00';
        } else if (otworkminutes > 29) {
          otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${pad(Math.floor(otworkminutes % 60), 2)}`;
        }

        totalworkminutes = durationofworked + otworkminutes;
        totalworkhour = `${pad(Math.floor(totalworkminutes / 60), 2)}:${pad(Math.floor(totalworkminutes % 60), 2)}`;

        normalsalary = normalworkminutes * payperquarter;
        normalsalary = Math.round(normalsalary * 100) / 100;


        otworkminutes = Math.floor(otworkminutes / overtimerounding);
        otroundofpay = pay / 4;

        oogetsnormalcommission = commission / 4;
        oogetsnormalcommission = normalworkminutes * oogetsnormalcommission;

        oogetsnormalcommission = Math.floor(oogetsnormalcommission * 100) / 100;

        normalemployercharges = normalsalary + oogetsnormalcommission;

        oogetsovertimecommission = commission / 4;

        if (overtimerounding === 15) {
          otroundofpay = otroundofpay;
          oogetsovertimecommission = oogetsovertimecommission;
        } else if (overtimerounding === 10) {
          otroundofpay = pay / 6;
          oogetsovertimecommission = commission / 6;
        } else if (overtimerounding === 5) {
          otroundofpay = pay / 12;
          oogetsovertimecommission = commission / 12;
        }

        otsalary = otworkminutes * otroundofpay * 1.5;
        otsalary = Math.round(otsalary * 100) / 100;

        oogetsovertimecommission = otworkminutes * oogetsovertimecommission * 1.5;

        oogetsovertimecommission = Math.round(oogetsovertimecommission * 100) / 100;

        otemployercharges = otsalary + oogetsovertimecommission;


        totalsalary = normalsalary + otsalary;
        totalsalary = Math.round(totalsalary * 100) / 100;

        oogetscommission = oogetsnormalcommission + oogetsovertimecommission;

        oogetscommission = Math.round(oogetscommission * 100) / 100;


        totalemployercharges = normalemployercharges + otemployercharges;
        totalemployercharges = Math.round(totalemployercharges * 100) / 100;
      } else {


        durationofworkhour = pad(Math.floor(durationofwork / 60), 2);
        durationofworkminutes = pad(Math.floor(durationofwork % 60), 2);

        totaldurationofwork = `${durationofworkhour}:${durationofworkminutes}`;

        normalworkhour = totaldurationofwork;



        normalworkminutes = durationofwork / 15;
        normalworkminutes = Math.floor(normalworkminutes);

        payperquarter = pay / 4;

        otworkminutes = durationofworked - durationofwork;
        if (otworkminutes <= 29) {
          otworkminutes = 0;
          otworkhour = '00:00';
        } else if (otworkminutes > 29) {
          if (overtimerounding === 15) {
            let otminutes = pad(Math.floor(otworkminutes % 60), 2) - pad(Math.floor(otworkminutes % 15), 2);
            otminutes = pad(otminutes, 2);
            otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${otminutes}`;
          } else if (overtimerounding === 10) {
            let otminutes = pad(Math.floor(otworkminutes % 60), 2) - pad(Math.floor(otworkminutes % 10), 2);
            otminutes = pad(otminutes, 2);
            otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${otminutes}`;
          } else if (overtimerounding === 5) {
            let otminutes = pad(Math.floor(otworkminutes % 60), 2) - pad(Math.floor(otworkminutes % 5), 2);
            otminutes = pad(otminutes, 2);
            otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${otminutes}`;
          }
        }

        totalworkminutes = durationofwork + otworkminutes;

        totalworkhour = `${pad(Math.floor(totalworkminutes / 60), 2)}:${pad(Math.floor(totalworkminutes % 60), 2)}`;


        normalsalary = normalworkminutes * payperquarter;
        normalsalary = Math.round(normalsalary * 100) / 100;

        otworkminutes = Math.floor(otworkminutes / overtimerounding);
        otroundofpay = pay / 4;


        oogetsnormalcommission = commission / 4;
        oogetsnormalcommission = normalworkminutes * oogetsnormalcommission;

        oogetsnormalcommission = Math.floor(oogetsnormalcommission * 100) / 100;

        normalemployercharges = normalsalary + oogetsnormalcommission;

        oogetsovertimecommission = commission / 4;



        if (overtimerounding === 15) {
          otroundofpay = otroundofpay;
          oogetsovertimecommission = oogetsovertimecommission;
        } else if (overtimerounding === 10) {
          otroundofpay = pay / 6;
          oogetsovertimecommission = commission / 6;
        } else if (overtimerounding === 5) {
          otroundofpay = pay / 12;
          oogetsovertimecommission = commission / 12;
        }


        otsalary = otworkminutes * otroundofpay * 1.5;
        otsalary = Math.round(otsalary * 100) / 100;


        oogetsovertimecommission = otworkminutes * oogetsovertimecommission * 1.5;

        oogetsovertimecommission = Math.round(oogetsovertimecommission * 100) / 100;


        otemployercharges = otsalary + oogetsovertimecommission;

        totalsalary = normalsalary + otsalary;
        totalsalary = Math.round(totalsalary * 100) / 100;


        oogetscommission = oogetsnormalcommission + oogetsovertimecommission;

        oogetscommission = Math.round(oogetscommission * 100) / 100;


        totalemployercharges = normalemployercharges + otemployercharges;
        totalemployercharges = Math.round(totalemployercharges * 100) / 100;
      }
    }


    await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
      $set: {
        'timesheet.$.verifiedpunchintime': verifiedpunchintime,
        'timesheet.$.verifiedpunchouttime': verifiedpunchouttime,
        'timesheet.$.systempunchintime': systempunchintime,
        'timesheet.$.systempunchouttime': systempunchouttime,
        'timesheet.$.normalworkhour': normalworkhour,
        'timesheet.$.otworkhour': otworkhour,
        'timesheet.$.totalworkhour': totalworkhour,
        'timesheet.$.normalsalary': normalsalary,
        'timesheet.$.otsalary': otsalary,
        'timesheet.$.totalsalary': totalsalary,
        'timesheet.$.oogetsnormalcommission': oogetsnormalcommission,
        'timesheet.$.oogetsovertimecommission': oogetsovertimecommission,
        'timesheet.$.oogetscommission': oogetscommission,
        'timesheet.$.normalemployercharges': normalemployercharges,
        'timesheet.$.otemployercharges': otemployercharges,
        'timesheet.$.totalemployercharges': totalemployercharges,
      },
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      verifiedpunchintime,
      verifiedpunchouttime,
    });
  } catch (error) {
    return next(error);
  }
};


exports.verifypunchin = async (req, res, next) => {
  try {
    const {
      verifiedpunchouttime, contractid, timesheetid, verifiedpunchintime,
    } = req.body;

    let systempunchintime = verifiedpunchintime;
    const systempunchouttime = verifiedpunchouttime;


    const contract = await Contract.findOne({ _id: contractid }, {})
      .populate({
        path: 'jobid',
        select: '-candidatesapplied -candidatesseleceted -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      });

    const breaktime = contract.jobid.breaktime;

    let pay = contract.jobid.salary;
    const commission = contract.jobid.markuprateincurrency;
    let starttime = contract.jobid.starttime;
    let endtime = contract.jobid.endtime;
    const overtimerounding = contract.jobid.overtimerounding || 15;

    const graceperiod = contract.jobid.graceperiod;

    const punchinforbreak = moment(verifiedpunchintime, 'YYYY/MM/DD HH:mm').format('HH:mm');
    const punchoutforbreak = moment(verifiedpunchouttime, 'YYYY/MM/DD HH:mm').format('HH:mm');

    const timesheet = await Contract.findOne({ _id: contractid, timesheet: { $elemMatch: { _id: timesheetid } } }, { 'timesheet.$._id': 1 });

    if (!timesheet) {
      return res.json({
        success: false,
        code: httpStatus.NO_CONTENT,
        message: 'timesheetnotfound',
      });
    }

    let timesheetdate = null;

    let timesheetsalarymultiplier = null;

    if (timesheet) {
      timesheetdate = timesheet.timesheet[0].date;
      timesheetsalarymultiplier = timesheet.timesheet[0].salarymultiplier;
    }

    const initialstarttime = moment(timesheetdate + starttime, 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm');

    const gracestarttime = moment(timesheetdate + starttime, 'YYYY/MM/DD HH:mm').add(graceperiod, 'minutes').format('YYYY/MM/DD HH:mm');


    if (verifiedpunchintime < initialstarttime) {
      systempunchintime = initialstarttime;
    }

    if ((verifiedpunchintime > initialstarttime) && (verifiedpunchintime <= gracestarttime)) {
      if (graceperiod > 0) {
        systempunchintime = initialstarttime;
      }
    }



    const vBreaks = [];

    function validBreaks() {
      if (punchoutforbreak > punchinforbreak) {
        for (const b of breaktime) {
          if ((punchinforbreak < b.breakstart) && (punchoutforbreak > b.breakend)) {
            vBreaks.push(b);
          }
        }
      } else if (punchoutforbreak < punchinforbreak) {
        for (const b of breaktime) {
          if ((punchinforbreak < b.breakstart) && (punchoutforbreak < b.breakend)) {
            vBreaks.push(b);
          }
        }
      }
    }

    validBreaks();

    let breakduration = 0;

    function timeParse() {
      for (const v of vBreaks) {
        const end = moment(v.breakend, 'HH:mm');
        const start = moment(v.breakstart, 'HH:mm');

        const timeduration = moment.duration(end.diff(start));
        const breaktime = timeduration.asMinutes();
        breakduration += breaktime;
      }
    }

    timeParse();

    let totalbreakduration = 0;

    function totalBreaks() {
      for (const b of breaktime) {
        const end = moment(b.breakend, 'HH:mm');
        const start = moment(b.breakstart, 'HH:mm');

        const timeduration = moment.duration(end.diff(start));
        const breaktime = timeduration.asMinutes();
        totalbreakduration += breaktime;
      }
    }

    totalBreaks();






    if (verifiedpunchouttime < verifiedpunchintime) {
      await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
        $set: {
          'timesheet.$.verifiedpunchintime': verifiedpunchintime,
          'timesheet.$.verifiedpunchouttime': verifiedpunchouttime,
          'timesheet.$.systempunchintime': systempunchintime,
          'timesheet.$.systempunchouttime': systempunchouttime,
          'timesheet.$.normalworkhour': '00:00',
          'timesheet.$.otworkhour': '00:00',
          'timesheet.$.totalworkhour': '00:00',
          'timesheet.$.normalsalary': 0,
          'timesheet.$.otsalary': 0,
          'timesheet.$.totalsalary': 0,
          'timesheet.$.oogetsnormalcommission': 0,
          'timesheet.$.oogetsovertimecommission': 0,
          'timesheet.$.oogetscommission': 0,
          'timesheet.$.normalemployercharges': 0,
          'timesheet.$.otemployercharges': 0,
          'timesheet.$.totalemployercharges': 0,
          'timesheet.$.verifiedpunchinedited': true,
        },
      });

      return res.json({
        success: true,
        code: httpStatus.OK,
        verifiedpunchintime,
        verifiedpunchouttime,
      });
    }




    if (endtime > starttime) {
      endtime = moment(endtime, 'HH:mm').format('YYYY/MM/DD HH:mm');
    } else if (endtime < starttime) {
      endtime = moment(endtime, 'HH:mm').add(1, 'day').format('YYYY/MM/DD HH:mm');
    }

    starttime = moment(starttime, 'HH:mm').format('YYYY/MM/DD HH:mm');

    const workend = moment(endtime, 'YYYY/MM/DD HH:mm');
    const workstart = moment(starttime, 'YYYY/MM/DD HH:mm');

    const workduration = moment.duration(workend.diff(workstart));
    let durationofwork = Math.round(workduration.asMinutes());

    durationofwork -= breakduration;

    let durationofworkhour = pad(Math.floor(durationofwork / 60), 2);
    let durationofworkminutes = pad(Math.floor(durationofwork % 60), 2);

    let totaldurationofwork = `${durationofworkhour}:${durationofworkminutes}`;

    const workedend = moment(systempunchouttime, 'YYYY/MM/DD HH:mm');
    const workedstart = moment(systempunchintime, 'YYYY/MM/DD HH:mm');

    const workedduration = moment.duration(workedend.diff(workedstart));

    let durationofworked = Math.round(workedduration.asMinutes());

    durationofworked -= breakduration;

    const durationofworkedhour = pad(Math.floor(durationofworked / 60), 2);
    const durationofworkedminutes = pad(Math.floor(durationofworked % 60), 2);

    const totaldurationofworked = `${durationofworkedhour}:${durationofworkedminutes}`;

    let payperquarter;

    let normalworkminutes;
    let normalworkhour;

    let otworkminutes;
    let otworkhour;

    let totalworkminutes;
    let totalworkhour;
    let normalsalary;
    let otsalary;
    let totalsalary;
    let normalemployercharges;
    let otemployercharges;
    let totalemployercharges;

    let oogetsnormalcommission;
    let oogetsovertimecommission;
    let oogetscommission;



    if (timesheetsalarymultiplier > 1) {
      normalworkhour = '00:00';
      otworkhour = totaldurationofworked;

      otworkminutes = durationofworked / 15;
      otworkminutes = Math.floor(otworkminutes);

      pay *= timesheetsalarymultiplier;
      payperquarter = pay / 4;

      totalworkminutes = durationofworked;
      totalworkhour = `${pad(Math.floor(totalworkminutes / 60), 2)}:${pad(Math.floor(totalworkminutes % 60), 2)}`;

      normalsalary = 0;

      otsalary = otworkminutes * payperquarter;
      otsalary = Math.floor(otsalary * 100) / 100;

      oogetsnormalcommission = 0;

      normalemployercharges = normalsalary + oogetsnormalcommission;

      oogetsovertimecommission = commission / 4;
      oogetsovertimecommission = otworkminutes * oogetsovertimecommission;

      oogetsovertimecommission = Math.floor(oogetsovertimecommission * 100) / 100;

      otemployercharges = otsalary + oogetsovertimecommission;

      totalsalary = normalsalary + otsalary;
      totalsalary = Math.round(totalsalary * 100) / 100;

      oogetscommission = oogetsnormalcommission + oogetsovertimecommission;

      oogetscommission = Math.round(oogetscommission * 100) / 100;

      totalemployercharges = normalemployercharges + otemployercharges;
      totalemployercharges = Math.round(totalemployercharges * 100) / 100;
    } else if (timesheetsalarymultiplier == 1) {
      if (durationofworked <= durationofwork) {
        normalworkhour = totaldurationofworked;

        normalworkminutes = durationofworked / 15;
        normalworkminutes = Math.floor(normalworkminutes);

        payperquarter = pay / 4;
        otworkminutes = 0;
        if (otworkminutes <= 29) {
          otworkminutes = 0;
          otworkhour = '00:00';
        } else if (otworkminutes > 29) {
          otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${pad(Math.floor(otworkminutes % 60), 2)}`;
        }

        totalworkminutes = durationofworked + otworkminutes;
        totalworkhour = `${pad(Math.floor(totalworkminutes / 60), 2)}:${pad(Math.floor(totalworkminutes % 60), 2)}`;

        normalsalary = normalworkminutes * payperquarter;
        normalsalary = Math.round(normalsalary * 100) / 100;

        otworkminutes = Math.floor(otworkminutes / overtimerounding);
        otroundofpay = pay / 4;


        oogetsnormalcommission = commission / 4;
        oogetsnormalcommission = normalworkminutes * oogetsnormalcommission;

        oogetsnormalcommission = Math.floor(oogetsnormalcommission * 100) / 100;

        normalemployercharges = normalsalary + oogetsnormalcommission;

        oogetsovertimecommission = commission / 4;



        if (overtimerounding === 15) {
          otroundofpay = otroundofpay;
          oogetsovertimecommission = oogetsovertimecommission;
        } else if (overtimerounding === 10) {
          otroundofpay = pay / 6;
          oogetsovertimecommission = commission / 6;
        } else if (overtimerounding === 5) {
          otroundofpay = pay / 12;
          oogetsovertimecommission = commission / 12;
        }


        otsalary = otworkminutes * otroundofpay * 1.5;
        otsalary = Math.round(otsalary * 100) / 100;


        oogetsovertimecommission = otworkminutes * oogetsovertimecommission * 1.5;

        oogetsovertimecommission = Math.round(oogetsovertimecommission * 100) / 100;


        otemployercharges = otsalary + oogetsovertimecommission;


        totalsalary = normalsalary + otsalary;
        totalsalary = Math.round(totalsalary * 100) / 100;


        oogetscommission = oogetsnormalcommission + oogetsovertimecommission;

        oogetscommission = Math.round(oogetscommission * 100) / 100;


        totalemployercharges = normalemployercharges + otemployercharges;
        totalemployercharges = Math.round(totalemployercharges * 100) / 100;
      } else {

        durationofworkhour = pad(Math.floor(durationofwork / 60), 2);
        durationofworkminutes = pad(Math.floor(durationofwork % 60), 2);

        totaldurationofwork = `${durationofworkhour}:${durationofworkminutes}`;

        normalworkhour = totaldurationofwork;



        normalworkminutes = durationofwork / 15;
        normalworkminutes = Math.floor(normalworkminutes);

        payperquarter = pay / 4;

        otworkminutes = durationofworked - durationofwork;
        if (otworkminutes <= 29) {
          otworkminutes = 0;
          otworkhour = '00:00';
        } else if (otworkminutes > 29) {
          if (overtimerounding === 15) {
            let otminutes = pad(Math.floor(otworkminutes % 60), 2) - pad(Math.floor(otworkminutes % 15), 2);
            otminutes = pad(otminutes, 2);
            otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${otminutes}`;
          } else if (overtimerounding === 10) {
            let otminutes = pad(Math.floor(otworkminutes % 60), 2) - pad(Math.floor(otworkminutes % 10), 2);
            otminutes = pad(otminutes, 2);
            otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${otminutes}`;
          } else if (overtimerounding === 5) {
            let otminutes = pad(Math.floor(otworkminutes % 60), 2) - pad(Math.floor(otworkminutes % 5), 2);
            otminutes = pad(otminutes, 2);
            otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${otminutes}`;
          }
        }

        totalworkminutes = durationofwork + otworkminutes;

        totalworkhour = `${pad(Math.floor(totalworkminutes / 60), 2)}:${pad(Math.floor(totalworkminutes % 60), 2)}`;

        normalsalary = normalworkminutes * payperquarter;
        normalsalary = Math.round(normalsalary * 100) / 100;

        otworkminutes = Math.floor(otworkminutes / overtimerounding);
        otroundofpay = pay / 4;


        oogetsnormalcommission = commission / 4;
        oogetsnormalcommission = normalworkminutes * oogetsnormalcommission;

        oogetsnormalcommission = Math.floor(oogetsnormalcommission * 100) / 100;

        normalemployercharges = normalsalary + oogetsnormalcommission;

        oogetsovertimecommission = commission / 4;



        if (overtimerounding === 15) {
          otroundofpay = otroundofpay;
          oogetsovertimecommission = oogetsovertimecommission;
        } else if (overtimerounding === 10) {
          otroundofpay = pay / 6;
          oogetsovertimecommission = commission / 6;
        } else if (overtimerounding === 5) {
          otroundofpay = pay / 12;
          oogetsovertimecommission = commission / 12;
        }


        otsalary = otworkminutes * otroundofpay * 1.5;
        otsalary = Math.round(otsalary * 100) / 100;


        oogetsovertimecommission = otworkminutes * oogetsovertimecommission * 1.5;

        oogetsovertimecommission = Math.round(oogetsovertimecommission * 100) / 100;


        otemployercharges = otsalary + oogetsovertimecommission;

        totalsalary = normalsalary + otsalary;
        totalsalary = Math.round(totalsalary * 100) / 100;


        oogetscommission = oogetsnormalcommission + oogetsovertimecommission;

        oogetscommission = Math.round(oogetscommission * 100) / 100;

        totalemployercharges = normalemployercharges + otemployercharges;
        totalemployercharges = Math.round(totalemployercharges * 100) / 100;
      }
    }


    await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
      $set: {
        'timesheet.$.verifiedpunchintime': verifiedpunchintime,
        'timesheet.$.verifiedpunchouttime': verifiedpunchouttime,
        'timesheet.$.systempunchintime': systempunchintime,
        'timesheet.$.systempunchouttime': systempunchouttime,
        'timesheet.$.normalworkhour': normalworkhour,
        'timesheet.$.otworkhour': otworkhour,
        'timesheet.$.totalworkhour': totalworkhour,
        'timesheet.$.normalsalary': normalsalary,
        'timesheet.$.otsalary': otsalary,
        'timesheet.$.totalsalary': totalsalary,
        'timesheet.$.oogetsnormalcommission': oogetsnormalcommission,
        'timesheet.$.oogetsovertimecommission': oogetsovertimecommission,
        'timesheet.$.oogetscommission': oogetscommission,
        'timesheet.$.verifiedpunchinedited': true,
        'timesheet.$.normalemployercharges': normalemployercharges,
        'timesheet.$.otemployercharges': otemployercharges,
        'timesheet.$.totalemployercharges': totalemployercharges,
      },
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      verifiedpunchintime,
      verifiedpunchouttime,
    });
  } catch (error) {
    return next(error);
  }
};


exports.verifypunchout = async (req, res, next) => {
  try {
    const { verifiedpunchouttime, contractid, timesheetid } = req.body;

    const systempunchouttime = verifiedpunchouttime;

    const contract = await Contract.findOne({ _id: contractid }, {})
      .populate({
        path: 'jobid',
        select: '-candidatesapplied -candidatesseleceted -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      });

    const breaktime = contract.jobid.breaktime;

    let pay = contract.jobid.salary;
    const commission = contract.jobid.markuprateincurrency;
    let starttime = contract.jobid.starttime;
    let endtime = contract.jobid.endtime;
    const overtimerounding = contract.jobid.overtimerounding || 15;

    if (endtime > starttime) {
      endtime = moment(endtime, 'HH:mm').format('YYYY/MM/DD HH:mm');
    } else if (endtime < starttime) {
      endtime = moment(endtime, 'HH:mm').add(1, 'day').format('YYYY/MM/DD HH:mm');
    }

    starttime = moment(starttime, 'HH:mm').format('YYYY/MM/DD HH:mm');

    const workend = moment(endtime, 'YYYY/MM/DD HH:mm');
    const workstart = moment(starttime, 'YYYY/MM/DD HH:mm');

    const timesheet = await Contract.findOne({ _id: contractid, timesheet: { $elemMatch: { _id: timesheetid } } }, { 'timesheet.$._id': 1 });

    if (!timesheet) {
      return res.json({
        success: false,
        code: httpStatus.NO_CONTENT,
        message: 'timesheetnotfound',
      });
    }

    let verifiedpunchintime = null;
    let timesheetsalarymultiplier = null;
    let systempunchintime = null; 7

    if (timesheet) {
      verifiedpunchintime = timesheet.timesheet[0].verifiedpunchintime;
      systempunchintime = timesheet.timesheet[0].systempunchintime;
      timesheetsalarymultiplier = timesheet.timesheet[0].salarymultiplier;
    }



    const punchinforbreak = moment(systempunchintime, 'YYYY/MM/DD HH:mm').format('HH:mm');
    const punchoutforbreak = moment(verifiedpunchouttime, 'YYYY/MM/DD HH:mm').format('HH:mm');


    const vBreaks = [];

    function validBreaks() {
      if (punchoutforbreak > punchinforbreak) {
        for (const b of breaktime) {
          if ((punchinforbreak < b.breakstart) && (punchoutforbreak > b.breakend)) {
            vBreaks.push(b);
          }
        }
      } else if (punchoutforbreak < punchinforbreak) {
        for (const b of breaktime) {
          if ((punchinforbreak < b.breakstart) && (punchoutforbreak < b.breakend)) {
            vBreaks.push(b);
          }
        }
      }
    }

    validBreaks();

    let breakduration = 0;

    function timeParse() {
      for (const v of vBreaks) {
        const end = moment(v.breakend, 'HH:mm');
        const start = moment(v.breakstart, 'HH:mm');

        const timeduration = moment.duration(end.diff(start));
        const breaktime = timeduration.asMinutes();
        breakduration += breaktime;
      }
    }

    timeParse();



    let totalbreakduration = 0;

    function totalBreaks() {
      for (const b of breaktime) {
        const end = moment(b.breakend, 'HH:mm');
        const start = moment(b.breakstart, 'HH:mm');

        const timeduration = moment.duration(end.diff(start));
        const breaktime = timeduration.asMinutes();
        totalbreakduration += breaktime;
      }
    }

    totalBreaks();


    const workduration = moment.duration(workend.diff(workstart));
    let durationofwork = Math.round(workduration.asMinutes());

    durationofwork -= breakduration;

    let durationofworkhour = pad(Math.floor(durationofwork / 60), 2);
    let durationofworkminutes = pad(Math.floor(durationofwork % 60), 2);

    let totaldurationofwork = `${durationofworkhour}:${durationofworkminutes}`;



    if (verifiedpunchouttime < systempunchintime) {
      await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
        $set: {
          'timesheet.$.verifiedpunchintime': verifiedpunchintime,
          'timesheet.$.verifiedpunchouttime': verifiedpunchouttime,
          'timesheet.$.systempunchintime': systempunchintime,
          'timesheet.$.systempunchouttime': systempunchouttime,
          'timesheet.$.normalworkhour': '00:00',
          'timesheet.$.otworkhour': '00:00',
          'timesheet.$.totalworkhour': '00:00',
          'timesheet.$.normalsalary': 0,
          'timesheet.$.otsalary': 0,
          'timesheet.$.totalsalary': 0,
          'timesheet.$.oogetsnormalcommission': 0,
          'timesheet.$.oogetsovertimecommission': 0,
          'timesheet.$.oogetscommission': 0,
          'timesheet.$.normalemployercharges': 0,
          'timesheet.$.otemployercharges': 0,
          'timesheet.$.totalemployercharges': 0,
          'timesheet.$.verifiedpunchoutedited': true,
        },
      });

      return res.json({
        success: true,
        code: httpStatus.OK,
        verifiedpunchintime,
        verifiedpunchouttime,
      });
    }



    const workedend = moment(systempunchouttime, 'YYYY/MM/DD HH:mm');
    const workedstart = moment(systempunchintime, 'YYYY/MM/DD HH:mm');

    const workedduration = moment.duration(workedend.diff(workedstart));

    let durationofworked = Math.round(workedduration.asMinutes());

    durationofworked -= breakduration;

    const durationofworkedhour = pad(Math.floor(durationofworked / 60), 2);
    const durationofworkedminutes = pad(Math.floor(durationofworked % 60), 2);

    const totaldurationofworked = `${durationofworkedhour}:${durationofworkedminutes}`;


    let payperquarter;

    let normalworkminutes;
    let normalworkhour;

    let otworkminutes;
    let otworkhour;

    let totalworkminutes;
    let totalworkhour;
    let normalsalary;
    let otsalary;
    let totalsalary;
    let normalemployercharges;
    let otemployercharges;
    let totalemployercharges;

    let oogetsnormalcommission;
    let oogetsovertimecommission;
    let oogetscommission;




    if (timesheetsalarymultiplier > 1) {
      normalworkhour = '00:00';
      otworkhour = totaldurationofworked;

      otworkminutes = durationofworked / 15;
      otworkminutes = Math.floor(otworkminutes);

      pay *= timesheetsalarymultiplier;
      payperquarter = pay / 4;

      totalworkminutes = durationofworked;
      totalworkhour = `${pad(Math.floor(totalworkminutes / 60), 2)}:${pad(Math.floor(totalworkminutes % 60), 2)}`;

      normalsalary = 0;

      otsalary = otworkminutes * payperquarter;
      otsalary = Math.floor(otsalary * 100) / 100;

      oogetsnormalcommission = 0;

      normalemployercharges = normalsalary + oogetsnormalcommission;

      oogetsovertimecommission = commission / 4;
      oogetsovertimecommission = otworkminutes * oogetsovertimecommission;

      oogetsovertimecommission = Math.floor(oogetsovertimecommission * 100) / 100;

      otemployercharges = otsalary + oogetsovertimecommission;

      totalsalary = normalsalary + otsalary;
      totalsalary = Math.round(totalsalary * 100) / 100;

      oogetscommission = oogetsnormalcommission + oogetsovertimecommission;

      oogetscommission = Math.round(oogetscommission * 100) / 100;

      totalemployercharges = normalemployercharges + otemployercharges;
      totalemployercharges = Math.round(totalemployercharges * 100) / 100;
    } else if (timesheetsalarymultiplier == 1) {
      if (durationofworked <= durationofwork) {
        normalworkhour = totaldurationofworked;

        normalworkminutes = durationofworked / 15;
        normalworkminutes = Math.floor(normalworkminutes);

        payperquarter = pay / 4;
        otworkminutes = 0;
        if (otworkminutes <= 29) {
          otworkminutes = 0;
          otworkhour = '00:00';
        } else if (otworkminutes > 29) {
          otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${pad(Math.floor(otworkminutes % 60), 2)}`;
        }

        totalworkminutes = durationofworked + otworkminutes;
        totalworkhour = `${pad(Math.floor(totalworkminutes / 60), 2)}:${pad(Math.floor(totalworkminutes % 60), 2)}`;

        normalsalary = normalworkminutes * payperquarter;
        normalsalary = Math.round(normalsalary * 100) / 100;

        otworkminutes = Math.floor(otworkminutes / overtimerounding);
        otroundofpay = pay / 4;


        oogetsnormalcommission = commission / 4;
        oogetsnormalcommission = normalworkminutes * oogetsnormalcommission;

        oogetsnormalcommission = Math.floor(oogetsnormalcommission * 100) / 100;

        normalemployercharges = normalsalary + oogetsnormalcommission;

        oogetsovertimecommission = commission / 4;



        if (overtimerounding === 15) {
          otroundofpay = otroundofpay;
          oogetsovertimecommission = oogetsovertimecommission;
        } else if (overtimerounding === 10) {
          otroundofpay = pay / 6;
          oogetsovertimecommission = commission / 6;
        } else if (overtimerounding === 5) {
          otroundofpay = pay / 12;
          oogetsovertimecommission = commission / 12;
        }


        otsalary = otworkminutes * otroundofpay * 1.5;
        otsalary = Math.round(otsalary * 100) / 100;


        oogetsovertimecommission = otworkminutes * oogetsovertimecommission * 1.5;

        oogetsovertimecommission = Math.round(oogetsovertimecommission * 100) / 100;


        otemployercharges = otsalary + oogetsovertimecommission;

        totalsalary = normalsalary + otsalary;
        totalsalary = Math.round(totalsalary * 100) / 100;


        oogetscommission = oogetsnormalcommission + oogetsovertimecommission;

        oogetscommission = Math.round(oogetscommission * 100) / 100;

        totalemployercharges = normalemployercharges + otemployercharges;
        totalemployercharges = Math.round(totalemployercharges * 100) / 100;
      } else {

        durationofworkhour = pad(Math.floor(durationofwork / 60), 2);
        durationofworkminutes = pad(Math.floor(durationofwork % 60), 2);

        totaldurationofwork = `${durationofworkhour}:${durationofworkminutes}`;

        normalworkhour = totaldurationofwork;


        normalworkminutes = durationofwork / 15;
        normalworkminutes = Math.floor(normalworkminutes);

        payperquarter = pay / 4;

        otworkminutes = durationofworked - durationofwork;
        if (otworkminutes <= 29) {
          otworkminutes = 0;
          otworkhour = '00:00';
        } else if (otworkminutes > 29) {
          if (overtimerounding === 15) {
            let otminutes = pad(Math.floor(otworkminutes % 60), 2) - pad(Math.floor(otworkminutes % 15), 2);
            otminutes = pad(otminutes, 2);
            otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${otminutes}`;
          } else if (overtimerounding === 10) {
            let otminutes = pad(Math.floor(otworkminutes % 60), 2) - pad(Math.floor(otworkminutes % 10), 2);
            otminutes = pad(otminutes, 2);
            otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${otminutes}`;
          } else if (overtimerounding === 5) {
            let otminutes = pad(Math.floor(otworkminutes % 60), 2) - pad(Math.floor(otworkminutes % 5), 2);
            otminutes = pad(otminutes, 2);
            otworkhour = `${pad(Math.floor(otworkminutes / 60), 2)}:${otminutes}`;
          }
        }

        totalworkminutes = durationofwork + otworkminutes;

        totalworkhour = `${pad(Math.floor(totalworkminutes / 60), 2)}:${pad(Math.floor(totalworkminutes % 60), 2)}`;


        normalsalary = normalworkminutes * payperquarter;
        normalsalary = Math.round(normalsalary * 100) / 100;

        otworkminutes = Math.floor(otworkminutes / overtimerounding);
        otroundofpay = pay / 4;


        oogetsnormalcommission = commission / 4;
        oogetsnormalcommission = normalworkminutes * oogetsnormalcommission;

        oogetsnormalcommission = Math.floor(oogetsnormalcommission * 100) / 100;

        normalemployercharges = normalsalary + oogetsnormalcommission;

        oogetsovertimecommission = commission / 4;



        if (overtimerounding === 15) {
          otroundofpay = otroundofpay;
          oogetsovertimecommission = oogetsovertimecommission;
        } else if (overtimerounding === 10) {
          otroundofpay = pay / 6;
          oogetsovertimecommission = commission / 6;
        } else if (overtimerounding === 5) {
          otroundofpay = pay / 12;
          oogetsovertimecommission = commission / 12;
        }


        otsalary = otworkminutes * otroundofpay * 1.5;
        otsalary = Math.round(otsalary * 100) / 100;



        oogetsovertimecommission = otworkminutes * oogetsovertimecommission * 1.5;

        oogetsovertimecommission = Math.round(oogetsovertimecommission * 100) / 100;


        otemployercharges = otsalary + oogetsovertimecommission;

        totalsalary = normalsalary + otsalary;
        totalsalary = Math.round(totalsalary * 100) / 100;


        oogetscommission = oogetsnormalcommission + oogetsovertimecommission;

        oogetscommission = Math.round(oogetscommission * 100) / 100;

        totalemployercharges = normalemployercharges + otemployercharges;
        totalemployercharges = Math.round(totalemployercharges * 100) / 100;
      }
    }


    await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
      $set: {
        'timesheet.$.verifiedpunchintime': verifiedpunchintime,
        'timesheet.$.verifiedpunchouttime': verifiedpunchouttime,
        'timesheet.$.systempunchintime': systempunchintime,
        'timesheet.$.systempunchouttime': systempunchouttime,
        'timesheet.$.normalworkhour': normalworkhour,
        'timesheet.$.otworkhour': otworkhour,
        'timesheet.$.totalworkhour': totalworkhour,
        'timesheet.$.normalsalary': normalsalary,
        'timesheet.$.otsalary': otsalary,
        'timesheet.$.totalsalary': totalsalary,
        'timesheet.$.oogetsnormalcommission': oogetsnormalcommission,
        'timesheet.$.oogetsovertimecommission': oogetsovertimecommission,
        'timesheet.$.oogetscommission': oogetscommission,
        'timesheet.$.verifiedpunchoutedited': true,
        'timesheet.$.normalemployercharges': normalemployercharges,
        'timesheet.$.otemployercharges': otemployercharges,
        'timesheet.$.totalemployercharges': totalemployercharges,
      },
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      verifiedpunchintime,
      verifiedpunchouttime,
    });
  } catch (error) {
    return next(error);
  }
};


exports.verifytimesheet = async (req, res, next) => {
  try {
    const { contractid, timesheetids } = req.body;

    let contract = await Contract.findOne({ _id: contractid }, {});

    if (!contract) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'nocontract',
      });
    }

    if (typeof timesheetids === 'string') {
      const timesheet = await Contract.findOne({ _id: contractid, 'timesheet._id': timesheetids }, { timesheet: 1 });

      if (!timesheet) {
        return res.json({
          success: false,
          code: httpStatus.NOT_FOUND,
          message: 'timesheetsnotexist',
        });
      }

      await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetids }, {
        $set: {
          'timesheet.$.verified': true,
        },
      });
    } else {
      for (const t of timesheetids) {
        const timesheet = await Contract.findOne({ _id: contractid, 'timesheet._id': t }, { timesheet: 1 });

        if (timesheet) {
          await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': t }, {
            $set: {
              'timesheet.$.verified': true,
            },
          });
        }
      }
    }

    contract = await Contract.findOne({ _id: contractid }, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      contract,
    });
  } catch (error) {
    return next(error);
  }
};


exports.fetchtimesheetdetails = async (req, res, next) => {
  try {
    const { contractid } = req.body;

    const timesheetdetails = await Contract.aggregate([
      { $match: { _id: ObjectId(contractid) } },
      { $unwind: '$timesheet' },
      { $match: { 'timesheet.payrollgenerated': false } },
      {
        $group: {
          _id: {
            id: '$_id',
            jobid: '$jobid',
            jobseekerid: '$jobseekerid',
            createdAt: '$createdAt',
          },
          timesheet: { $push: '$timesheet' },
        },
      },
      {
        $project: {
          timesheet: 1,
          finalnormalworkhour: { $sum: '$timesheet.normalworkhour' },
          finalotworkhour: { $sum: '$timesheet.otworkhour' },
          finaltotalworkhour: { $sum: '$timesheet.totalworkhour' },
          finalnormalsalary: { $sum: '$timesheet.normalsalary' },
          finalotsalary: { $sum: '$timesheet.otsalary' },
          finaltotalsalary: { $sum: '$timesheet.totalsalary' },
          finalnormalemployercharges: { $sum: '$timesheet.normalemployercharges' },
          finalotemployercharges: { $sum: '$timesheet.otemployercharges' },
          finaltotalemployercharges: { $sum: '$timesheet.totalemployercharges' },
          finaloogetsnormalcommission: { $sum: '$timesheet.oogetsnormalcommission' },
          finaloogetsovertimecommission: { $sum: '$timesheet.oogetsovertimecommission' },
          finaloogetscommission: { $sum: '$timesheet.oogetscommission' },
        },
      },
    ]);

    return res.json({
      success: true,
      code: httpStatus.OK,
      timesheetdetails,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchoffdays = async (req, res, next) => {
  try {
    const { contractid } = req.body;
    const contract = await Contract.findById(contractid, { offdays: 1 });
    const offdays = contract.offdays;

    return res.json({
      success: true,
      code: httpStatus.OK,
      offdays,
    });
  } catch (error) {
    return next(error);
  }
};

exports.addoffday = async (req, res, next) => {
  try {
    const { contractid, offday } = req.body;
    const checkflexible = await Contract.findById(contractid, { jobid: 1 })
      .populate('jobid', 'workdaystype');
    const checkoffday = await Contract.findOne({ _id: contractid, 'offdays.date': offday });

    const workdaystype = checkflexible.jobid.workdaystype;

    if (!workdaystype || (workdaystype !== 'flexible')) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'notflexible',
      });
    }

    if (checkoffday) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'alreadydded',
      });
    }

    await Contract.findByIdAndUpdate(contractid, { $push: { offdays: { date: offday } } });
    const contract = await Contract.find({ _id: contractid, 'offdays.date': offday }, { 'offdays.$.date': 1 });
    const offdays = contract[0].offdays[0];

    return res.json({
      success: true,
      code: httpStatus.OK,
      offdays,
    });
  } catch (error) {
    return next(error);
  }
};

exports.removeoffday = async (req, res, next) => {
  try {
    const { contractid, offdayid } = req.body;
    const checkflexible = await Contract.findById(contractid, { jobid: 1 })
      .populate('jobid', 'workdaystype');
    const checkoffday = await Contract.findOne({ 'offdays._id': offdayid });

    const workdaystype = checkflexible.jobid.workdaystype;

    if (!workdaystype || (workdaystype !== 'flexible')) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'notflexible',
      });
    }

    if (!checkoffday) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'noffday',
      });
    }

    await Contract.findByIdAndUpdate(contractid, { $pull: { offdays: { _id: offdayid } } });

    return res.json({
      success: true,
      code: httpStatus.OK,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatenotes = async (req, res, next) => {
  try {
    const { contractid, timesheetid, notes } = req.body;

    const timesheet = await Contract.findOne({ _id: contractid, timesheet: { $elemMatch: { _id: timesheetid } } }, { 'timesheet.$._id': 1 });

    if (!timesheet) {
      return res.json({
        success: false,
        code: httpStatus.NO_CONTENT,
        message: 'timesheetnotfound',
      });
    }

    await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
      $set: {
        'timesheet.$.notes': notes,
      },
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      notes,
    });
  } catch (error) {
    return next(error);
  }
};

exports.inserttimesheet = async (req, res, next) => {
  try {
    const { contractid } = req.body;
    const currentyear = moment().format('YYYY');
    const currentdate = moment().format('YYYY/MM/DD');
    const currentday = moment().format('dddd');
    const contract = await Contract.findOne({ _id: contractid }, {})
      .populate({
        path: 'jobid',
        select: '-candidatesapplied -candidatesseleceted -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      });

    const jobid = contract.jobid._id;

    const jobperiodfrom = contract.jobid.jobperiodfrom;
    const jobperiodto = contract.jobid.jobperiodto;

    const isFrom = jobperiodfrom <= currentdate;
    const isTo = currentdate <= jobperiodto;

    if (!(isFrom && isTo)) {
      if (!isFrom) {
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          contractid,
          jobperiodfrom,
          message: 'cannotinsert',
        });
      } else if (!isTo) {
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          contractid,
          jobperiodto,
          message: 'cannotinsert',
        });
      }
    }

    const holidays = await Holiday.find({ year: currentyear, 'holidays.holidaydate': currentdate }, { 'holidays.$.holidaydate': 1 });

    let holiday = false;

    const checkwworkdaystype = await Contract.findOne({ _id: contractid }, { jobid: 1 })
      .populate('jobid', 'workdaystype');
    const workdaystype = checkwworkdaystype.jobid.workdaystype;

    let offdays = null;

    let offday = null;
    let workday = null;

    if (holidays.length) {
      holiday = true;
    } else if (workdaystype === 'flexible') {
      const checkoffdays = await Contract.findOne({ _id: contractid }, { offdays: 1 });
      offdays = checkoffdays.offdays;
    } else if (workdaystype === 'normal') {
      const work = {};
      work[`workdays.${currentday.toLowerCase()}`] = 1;
      const checkworkdays = await Job.findOne({ _id: jobid }, work);
      workday = checkworkdays.workdays[currentday.toLowerCase()];
    }

    if (offdays) {
      for (const o of offdays) {
        if (o.date === currentdate) {
          offday = true;
        }
      }
    }

    const timesheet = {
      date: currentdate,
      punchintime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
      verifiedpunchintime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
      punchouttime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
      verifiedpunchouttime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
      punchedin: false,
      punchedout: false,
      verifiedpunchinedited: false,
      verifiedpunchoutedited: false,
      notes: '',
      late: false,
      lateinhour: '00:00',
      lateintimation: false,
      normalworkhour: '00:00',
      otworkhour: '00:00',
      totalworkhour: '00:00',
      normalsalary: 0,
      otsalary: 0,
      totalsalary: 0,
      normalemployercharges: 0,
      otemployercharges: 0,
      totalemployercharges: 0,
      oogetsnormalcommission: 0,
      oogetsovertimecommission: 0,
      oogetscommission: 0,
    };

    if (holiday) {
      timesheet.salarymultiplier = 2;
      await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
    } else if (!holiday && workdaystype === 'normal') {
      if (workday) {
        timesheet.salarymultiplier = 1;
        await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
      } else {
        timesheet.salarymultiplier = 1.5;
        await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
      }
    } else if (!holiday && workdaystype === 'flexible') {
      if (!offday) {
        timesheet.salarymultiplier = 1;
        await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
      } else {
        timesheet.salarymultiplier = 1.5;
        await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
      }
    }


    return res.json({
      success: true,
      holiday,
      workdaystype,
      offday,
      workday,
    });
  } catch (error) {
    return next(error);
  }
};


exports.insertnewtimesheet = async (req, res, next) => {
  try {
    const { contractid } = req.body;
    const currentyear = moment().format('YYYY');
    const currentdate = moment().format('YYYY/MM/DD');
    const currentday = moment().format('dddd');
    const contract = await Contract.findOne({ _id: contractid }, {})
      .populate({
        path: 'jobid',
        select: '-candidatesapplied -candidatesseleceted -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      });

    const jobid = contract.jobid._id;

    const jobperiodfrom = contract.jobid.jobperiodfrom;
    const jobperiodto = contract.jobid.jobperiodto;

    const isFrom = jobperiodfrom <= currentdate;
    const isTo = currentdate <= jobperiodto;


    if (!(isFrom && isTo)) {
      if (!isFrom) {
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          contractid,
          jobperiodfrom,
          message: 'cannotinsert',
        });
      } else if (!isTo) {
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          contractid,
          jobperiodto,
          message: 'cannotinsert',
        });
      }
    }

    const checktimesheetexist = await Contract.find({ _id: contractid, 'timesheet.date': currentdate }, { 'timesheet.$.date': 1 });

    if (checktimesheetexist.length !== 0) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'alreadyexists',
      });
    }

    const holidays = await Holiday.find({ year: currentyear, 'holidays.holidaydate': currentdate }, { 'holidays.$.holidaydate': 1 });

    let holiday = false;

    const checkwworkdaystype = await Contract.findOne({ _id: contractid }, { jobid: 1 })
      .populate('jobid', 'workdaystype');
    const workdaystype = checkwworkdaystype.jobid.workdaystype;

    let offdays = null;

    let offday = null;
    let workday = null;

    if (holidays.length) {
      holiday = true;
    } else if (workdaystype === 'flexible') {
      const checkoffdays = await Contract.findOne({ _id: contractid }, { offdays: 1 });
      offdays = checkoffdays.offdays;
    } else if (workdaystype === 'normal') {
      const work = {};
      work[`workdays.${currentday.toLowerCase()}`] = 1;
      const checkworkdays = await Job.findOne({ _id: jobid }, work);
      workday = checkworkdays.workdays[currentday.toLowerCase()];
    }

    if (offdays) {
      for (const o of offdays) {
        if (o.date === currentdate) {
          offday = true;
        }
      }
    }

    const timesheet = {
      date: currentdate,
      punchintime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
      verifiedpunchintime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
      punchouttime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
      verifiedpunchouttime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
      punchedin: false,
      punchedout: false,
      verifiedpunchinedited: false,
      verifiedpunchoutedited: false,
      notes: '',
      late: false,
      lateinhour: '00:00',
      lateintimation: false,
      normalworkhour: '00:00',
      otworkhour: '00:00',
      totalworkhour: '00:00',
      normalsalary: 0,
      otsalary: 0,
      totalsalary: 0,
      normalemployercharges: 0,
      otemployercharges: 0,
      totalemployercharges: 0,
      oogetsnormalcommission: 0,
      oogetsovertimecommission: 0,
      oogetscommission: 0,
    };

    if (holiday) {
      timesheet.salarymultiplier = 2;
      await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
    } else if (!holiday && workdaystype === 'normal') {
      if (workday) {
        timesheet.salarymultiplier = 1;
        await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
      } else {
        timesheet.salarymultiplier = 1.5;
        await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
      }
    } else if (!holiday && workdaystype === 'flexible') {
      if (!offday) {
        timesheet.salarymultiplier = 1;
        await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
      } else {
        timesheet.salarymultiplier = 1.5;
        await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
      }
    }


    return res.json({
      success: true,
      holiday,
      workdaystype,
      offday,
      workday,
    });
  } catch (error) {
    return next(error);
  }
};

exports.inserttimes = schedule.scheduleJob('*/10 * * * *', async () => {
  const contracts = await Contract.find({}, {});
  const currentyear = moment().format('YYYY');
  const currentdate = moment().format('YYYY/MM/DD');
  const currentday = moment().format('dddd');
  const currendayttime = moment().format('YYYY/MM/DD HH:mm');

  for (const c of contracts) {
    const contractid = c._id;
    const contractstatus = c.contractstatus;
    const contract = await Contract.findOne({ _id: ObjectId(contractid) }, {})
      .populate({
        path: 'jobid',
        select: '-candidatesapplied -candidatesseleceted -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      });

    const jobid = contract.jobid._id;

    const jobperiodfrom = contract.jobid.jobperiodfrom;
    let jobperiodto = contract.jobid.jobperiodto;

    const endtime = contract.jobid.endtime;

    const isFrom = jobperiodfrom <= currentdate;
    const isTo = currentdate <= jobperiodto;


    if (isFrom && isTo) {
      const checktimesheetexist = await Contract.find({ _id: contractid, 'timesheet.date': currentdate }, { 'timesheet.$.date': 1 });

      if (checktimesheetexist.length !== 1) {
        const holidays = await Holiday.find({ year: currentyear, 'holidays.holidaydate': currentdate }, { 'holidays.$.holidaydate': 1 });

        let holiday = false;

        const checkwworkdaystype = await Contract.findOne({ _id: contractid }, { jobid: 1 })
          .populate('jobid', 'workdaystype');

        const workdaystype = checkwworkdaystype.jobid.workdaystype;

        let offdays = null;

        let offday = null;
        let workday = null;

        if (holidays.length) {
          holiday = true;
        } else if (workdaystype === 'flexible') {
          const checkoffdays = await Contract.findOne({ _id: contractid }, { offdays: 1 });
          offdays = checkoffdays.offdays;
        } else if (workdaystype === 'normal') {
          const work = {};
          work[`workdays.${currentday.toLowerCase()}`] = 1;
          const checkworkdays = await Job.findOne({ _id: jobid }, work);
          workday = checkworkdays.workdays[currentday.toLowerCase()];
        }

        if (offdays) {
          for (const o of offdays) {
            if (o.date === currentdate) {
              offday = true;
            }
          }
        }

        const timesheet = {
          date: currentdate,
          punchintime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
          verifiedpunchintime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
          punchouttime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
          verifiedpunchouttime: moment(currentdate, 'YYYY/MM/DD').format('YYYY/MM/DD HH:mm'),
          punchedin: false,
          punchedout: false,
          verifiedpunchinedited: false,
          verifiedpunchoutedited: false,
          notes: '',
          late: false,
          lateinhour: '00:00',
          lateintimation: false,
          normalworkhour: '00:00',
          otworkhour: '00:00',
          totalworkhour: '00:00',
          normalsalary: 0,
          otsalary: 0,
          totalsalary: 0,
          normalemployercharges: 0,
          otemployercharges: 0,
          totalemployercharges: 0,
          oogetsnormalcommission: 0,
          oogetsovertimecommission: 0,
          oogetscommission: 0,
        };

        if (holiday) {
          timesheet.salarymultiplier = 2;
          await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
        } else if (!holiday && workdaystype === 'normal') {
          if (workday) {
            timesheet.salarymultiplier = 1;
            await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
          } else {
            timesheet.salarymultiplier = 1.5;
            await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
          }
        } else if (!holiday && workdaystype === 'flexible') {
          if (!offday) {
            timesheet.salarymultiplier = 1;
            await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
          } else {
            timesheet.salarymultiplier = 1.5;
            await Contract.findOneAndUpdate({ _id: contractid }, { $push: { timesheet } });
          }
        }
      }
    } else if (!isTo) {
      jobperiodto = moment(jobperiodto + endtime, 'YYYY/MM/DD HH:mm').add(24, 'hours').format('YYYY/MM/DD HH:mm');

      if ((currendayttime > jobperiodto) && (contractstatus === 'open')) {
        await Contract.findOneAndUpdate({ _id: contractid }, { $set: { contractstatus: 'closed' } });
      }
    }
  }
});


exports.generatepayroll = async (req, res, next) => {
  try {
    const { contractid } = req.body;

    const contract = await Contract.findOne({ _id: contractid }, {})
      .populate({
        path: 'jobid',
        select: '-jobseeksers',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      })
      .populate('jobseekerid', 'username email mobileno accountno bankcode branchcode _id');

    if (!contract) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'nocontract',
      });
    }

    const accountno = contract.jobseekerid.accountno;

    if (!accountno || accountno === '') {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'cantgenerate',
      });
    }

    const createdAt = moment().format('YYYY/MM/DD HH:mm');

    const originatingaccountnumber = '0039552343';

    const benificaryname = contract.jobseekerid.username;
    const benificaryaccountnumber = accountno;
    const receivingbankcode = contract.jobseekerid.bankcode;
    const receivingbranchcode = contract.jobseekerid.branchcode;

    let amount = 0;

    const timesheet = await Contract.aggregate([
      { $match: { _id: ObjectId(contractid) } },
      { $unwind: '$timesheet' },
      { $match: { 'timesheet.verified': true, 'timesheet.payrollgenerated': false } },
    ]);

    let fromdate = null;
    let todate = null;

    for (const t of timesheet) {
      amount += t.timesheet.totalsalary;
      totaltransactionamount = amount;

      if (!fromdate) {
        fromdate = t.timesheet.date;
      } else if (fromdate) {
        if (fromdate < t.timesheet.date) {
          fromdate = fromdate;
        } else {
          fromdate = t.timesheet.date;
        }
      }

      if (!todate) {
        todate = t.timesheet.date;
      } else if (todate) {
        if (todate > t.timesheet.date) {
          todate = todate;
        } else {
          todate = t.timesheet.date;
        }
      }
    }

    if (!fromdate && !todate) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'novalidtimesheets',
      });
    }

    const valuedate = moment().format('YYYY/MM/DD');
    const messagesequencenumber = Math.floor(Math.random() * 90000) + 10000;

    const payrollheader = {
      valuedate,
      originatingbanknumber: '7171',
      originatingbranchnumber: '003',
      originatingaccountnumber,
      originatorsname: 'OOGET PTE LTD',
      messagesequencenumber,
      senderscompanyid: 'OOGET',
      recordtype: '0',
    };


    const payrollbody = [{
      receivingbanknumber: receivingbankcode,
      receivingbranchnumber: receivingbranchcode,
      receivingaccountnumber: benificaryaccountnumber,
      receivingaccountname: benificaryname,
      transactioncode: '22',
      amount,
      recordtype: '1',
    }];

    const payroll = {
      contractid,
      payrollheader,
      payrollbody,
      fromdate,
      todate,
      createdAt,
    };

    const newpayroll = await new Payroll(payroll).save();

    const payrollid = newpayroll._id;

    for (const t of timesheet) {
      await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': t.timesheet._id }, { $set: { 'timesheet.$.payrollid': payrollid, 'timesheet.$.payrollgeneratedat': createdAt, 'timesheet.$.payrollgenerated': true } });
    }


    return res.json({
      success: true,
      code: httpStatus.OK,
      payroll: newpayroll,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchpayrollforparticularcontract = async (req, res, next) => {
  try {
    const { contractid } = req.body;

    const payrolls = await Payroll.find({ contractid }, {});

    return res.json({
      success: true,
      code: httpStatus.OK,
      payrolls,
    });
  } catch (error) {
    return next(error);
  }
};


exports.fetchcontractforpayroll = async (req, res, next) => {
  try {
    const { contractid } = req.body;

    const contract = await Contract.aggregate([
      { $match: { _id: ObjectId(contractid) } },
      { $unwind: '$timesheet' },
      {
        $group: {
          _id: {
            month: {
              $month: {
                $dateFromString: {
                  dateString: '$timesheet.date',
                },
              },
            },
            day: {
              $dayOfMonth: {
                $dateFromString: {
                  dateString: '$timesheet.date',
                },
              },
            },
            year: {
              $year: {
                $dateFromString: {
                  dateString: '$timesheet.date',
                },
              },
            },
          },
          weeklytimesheet: { $push: '$$ROOT' },
        },
      },
    ]);


    return res.json({
      success: true,
      code: httpStatus.OK,
      contract,
    });
  } catch (error) {
    return next(error);
  }
};


exports.generatereportforparticularcontract = async (req, res, next) => {
  try {
    const { contractid } = req.body;

    if (!contractid) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Please provide contract id',
      });
    }


    const reports = await Contract.aggregate([
      { $match: { _id: ObjectId(contractid) } },
      { $unwind: '$timesheet' },
      {
        $group: {
          _id: {
            month: {
              $month: {
                $dateFromString: {
                  dateString: '$timesheet.date',
                },
              },
            },
            day: {
              $dayOfMonth: {
                $dateFromString: {
                  dateString: '$timesheet.date',
                },
              },
            },
            year: {
              $year: {
                $dateFromString: {
                  dateString: '$timesheet.date',
                },
              },
            },
          },
          weeklytimesheet: { $push: '$$ROOT' },
        },
      },
      { $match: { '_id.month': 7, '_id.day': { $lte: 15 } } },
      {
        $project: {
          timesheet: '$weeklytimesheet.timesheet',
        },
      },
    ]);


    return res.json({
      success: true,
      code: httpStatus.OK,
      reports,
    });
  } catch (error) {
    return next(error);
  }
};


exports.generatereportforparticularjob = async (req, res, next) => {
  try {
    const { jobid, fromdate, todate } = req.body;

    if (!jobid) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Please provide job id',
      });
    }

    const reports = await Contract.aggregate([
      { $match: { jobid: ObjectId(jobid) } },
      {
        $lookup: {
          from: 'jobseekers',
          localField: 'jobseekerid',
          foreignField: '_id',
          as: 'jobseeker',
        },
      },
      { $unwind: '$timesheet' },
      { $match: { 'timesheet.date': { $gte: moment(fromdate, 'YYYY/MM/DD').format('YYYY/MM/DD'), $lt: moment(todate, 'YYYY/MM/DD').format('YYYY/MM/DD') } } },
      {
        $group: {
          _id: {
            _id: '$_id',
            createdAt: '$createdAt',
            jobseeker: '$jobseeker',
          },
          timesheet: {
            $push: {
              timesheet: '$timesheet',
            },
          },
        },
      },
      {
        $project: {
          _id: '$_id._id', createdAt: '$_id.createdAt', email: { $arrayElemAt: ['$_id.jobseeker.email', 0] }, username: { $arrayElemAt: ['$_id.jobseeker.username', 0] }, timesheet: '$timesheet.timesheet',
        },
      },
    ]);

    return res.json({
      success: true,
      code: httpStatus.OK,
      reports,
    });
  } catch (error) {
    return next(error);
  }
};




exports.generatereportforparticularemployer = async (req, res, next) => {
  try {
    const { companyid } = req.body;

    const fromdate = '2019/01/01';
    const todate = moment().format('YYYY/MM/DD');

    if (!companyid) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Please provide company id',
      });
    }

    const employerreport = await Company.aggregate([
      { $match: { _id: ObjectId(companyid) } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobs.jobid',
          foreignField: '_id',
          as: 'jobs',
        },
      },
      { $unwind: '$jobs' },
      {
        $lookup: {
          from: 'contracts',
          localField: 'jobs._id',
          foreignField: 'jobid',
          as: 'jobs.contracts',
        },
      },
      { $unwind: '$jobs.contracts' },
      {
        $lookup: {
          from: 'jobseekers',
          localField: 'jobs.contracts.jobseekerid',
          foreignField: '_id',
          as: 'jobs.contracts.jobseeker',
        },
      },
      { $unwind: '$jobs.contracts.timesheet' },
      { $match: { 'jobs.contracts.timesheet.date': { $gte: moment(fromdate, 'YYYY/MM/DD').format('YYYY/MM/DD'), $lt: moment(todate, 'YYYY/MM/DD').format('YYYY/MM/DD') } } },
      {
        $group: {
          _id: {
            _id: '$_id',
            contractid: '$jobs.contracts._id',
          },
          companyname: { $first: '$companyname' },
          companycode: { $first: '$companycode' },
          jobs: {
            $first: {
              _id: '$jobs._id',
              jobnumber: '$jobs.jobnumber',
            },
          },
          contracts: {
            $first: {
              _id: '$jobs.contracts._id',
              jobseekername: '$jobs.contracts.jobseeker.username',
            },
          },
          timesheets: {
            $push: '$jobs.contracts.timesheet',
          },
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id._id',
            contractid: '$_id.contractid',
          },
          companyname: { $first: '$companyname' },
          companycode: { $first: '$companycode' },
          jobs: { $first: '$jobs' },
          contracts: {
            $push: {
              _id: '$contracts._id',
              jobseekername: { $arrayElemAt: ['$contracts.jobseekername', 0] },
              timesheets: '$timesheets',
            },
          },
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id._id',
            jobid: '$jobs._id',
          },
          companyname: { $first: '$companyname' },
          companycode: { $first: '$companycode' },
          jobs: {
            $push: {
              _id: '$jobs._id',
              jobnumber: '$jobs.jobnumber',
            },
          },
          contracts: {
            $push: {
              contracts: { $arrayElemAt: ['$contracts', 0] },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id._id',
            jobid: '$jobs._id',
          },
          companyname: { $first: '$companyname' },
          companycode: { $first: '$companycode' },
          jobs: {
            $push: {
              _id: { $arrayElemAt: ['$jobs._id', 0] },
              jobnumber: { $arrayElemAt: ['$jobs.jobnumber', 0] },
              contracts: '$contracts.contracts',
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id._id',
          companyname: { $first: '$companyname' },
          companycode: { $first: '$companycode' },
          jobs: {
            $push: {
              jobs: '$jobs',
            },
          },
        },
      },
      {
        $project: {
          _id: '$_id',
          companyname: '$companyname',
          companycode: '$companycode',
          jobs: {
            $reduce: {
              input: '$jobs.jobs',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] },
            },
          },
        },
      },
    ]);

    return res.json({
      success: true,
      code: httpStatus.OK,
      employerreport,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchoffdayssheetforparticularjob = async (req, res, next) => {
  try {
    const { jobid, fromdate, todate } = req.body;

    const holidaylist = await Holiday.find({});

    const holidays = [];
    const nationalHolidays = [];

    function holidayParse() {
      if (holidaylist.length > 0) {
        for (let i = 0; i < holidaylist.length; i++) {
          if ((holidaylist[i].holidays).length > 0) {
            listHolidays = holidaylist[i].holidays;
            for (let j = 0; j < listHolidays.length; j++) {
              holidays.push(listHolidays[j].holidaydate);
            }
          }
        }
      }
    }

    holidayParse();

    const checkjobexist = await Job.findOne({ _id: jobid }, {});

    if (!checkjobexist) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Job not exists',
      });
    }

    const checkjob = await Job.findOne({ _id: jobid }, {});

    function holidayFinal() {
      if (holidays.length > 0) {
        for (let i = 0; i < holidays.length; i++) {
          const currentdate = moment(holidays[i], 'YYYY/MM/DD');
          const from = moment(fromdate, 'YYYY/MM/DD');
          const to = moment(todate, 'YYYY/MM/DD');
          const checkdate = currentdate.isBetween(from, to);
          if (checkdate) {
            nationalHolidays.push(holidays[i]);
          }
        }
      }
    }

    holidayFinal();


    const job = await Job.aggregate([
      { $match: { _id: ObjectId(jobid) } },
      { $unwind: '$jobseekers' },
      { $match: { 'jobseekers.accepted': true } },
      {
        $lookup: {
          from: 'contracts',
          localField: 'jobseekers.contractid',
          foreignField: '_id',
          as: 'contracts',
        },
      },
      { $unwind: '$contracts' },
      {
        $lookup: {
          from: 'jobseekers',
          localField: 'contracts.jobseekerid',
          foreignField: '_id',
          as: 'contracts.jobseeker',
        },
      },
      { $unwind: '$contracts.timesheet' },
      { $match: { 'contracts.timesheet.date': { $gte: moment(fromdate, 'YYYY/MM/DD').format('YYYY/MM/DD'), $lt: moment(todate, 'YYYY/MM/DD').format('YYYY/MM/DD') } } },
      {
        $group: {
          _id: {
            _id: '$_id',
            contractid: '$contracts._id',
          },
          workdays: { $first: '$workdays' },
          workdaystype: { $first: '$workdaystype' },
          contracts: {
            $first: {
              _id: '$contracts._id',
              contractstatus: '$contracts.contractstatus',
              offdays: '$contracts.offdays',
              jobseekername: '$contracts.jobseeker.username',
            },
          },
          timesheets: {
            $push: '$contracts.timesheet',
          },
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id._id',
            contractid: '$_id.contractid',
          },
          workdays: { $first: '$workdays' },
          workdaystype: { $first: '$workdaystype' },
          contracts: {
            $push: {
              _id: '$contracts._id',
              contractstatus: '$contracts.contractstatus',
              offdays: '$contracts.offdays',
              jobseekername: { $arrayElemAt: ['$contracts.jobseekername', 0] },
              timesheets: '$timesheets',
            },
          },
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id._id',
          },
          workdays: { $first: '$workdays' },
          workdaystype: { $first: '$workdaystype' },
          contracts: {
            $push: {
              contracts: '$contracts'
            }
          }
        }
      },
      {
        $project: {
          _id: '$_id._id',
          workdays: 1,
          workdaystype: 1,
          contracts: {
            $reduce: {
              input: '$contracts.contracts',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] }
            },
          },
        },
      },
    ]);


    return res.json({
      success: true,
      code: httpStatus.OK,
      job,
      holiday: nationalHolidays,
    });
  } catch (error) {
    return next(error);
  }
};

exports.generatetimesheetreportforparticularjobseeker = async (req, res, next) => {
  try {

    const { jobseekerid, fromdate, todate } = req.body;

    if (!jobseekerid) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'Please provide jobseeker id',
      });
    }

    const jobperiod = `${fromdate} to ${todate}`

    const timesheetreport = await Contract.aggregate([
      { $match: { jobseekerid: ObjectId(jobseekerid) } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobid',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: 'companies',
          localField: 'job.companyid',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $match: { 'timesheet.date': { $gte: moment(fromdate, 'YYYY/MM/DD').format('YYYY/MM/DD'), $lt: moment(todate, 'YYYY/MM/DD').format('YYYY/MM/DD') } } },
      {
        $group: {
          _id: {
            _id: '$_id',
          },
          contractstatus: { $first: '$contractstatus' },
          createdAt: { $first: '$createdAt' },
          offdays: { $first: '$offdays' },
          job: {
            $first: {
              _id: '$job._id',
              jobperiodfrom: '$job.jobperiodfrom',
              jobperiodto: '$job.jobperiodto',
              starttime: '$job.starttime',
              endtime: '$job.endtime',
              breaktime: '$job.breaktime',
              salary: '$job.salary'
            }
          },
          timesheet: { $first: '$timesheet' },
          company: { $first: '$company' },
        }
      },
      {
        $project: {
          _id: '$_id._id',
          contractstatus: '$contractstatus',
          createdAt: '$createdAt',
          offdays: '$offdays',
          job: '$job',
          timesheet: '$timesheet',
          companyname: { $arrayElemAt: ['$company.companyname', 0] },
        }
      }
    ])

    return res.json({
      success: true,
      code: httpStatus.OK,
      jobperiod,
      timesheetreport
    })

  } catch (error) {
    return next(error)
  }
}

exports.generateinvoice = async (req, res, next) => {
  try {

    const { jobid } = req.body;

    const createdAt = moment().format('YYYY/MM/DD HH:mm');

    const currentdate = moment().format('YYYY/MM/DD');
    const currentday = moment(currentdate, 'YYYY/MM/DD').format('DD');

    var fromdate;
    var todate

    if (currentday > 15) {
      fromdate = moment().startOf('month').format('YYYY/MM/DD')
      todate = moment('15', 'DD').format('YYYY/MM/DD')
    } else {
      fromdate = moment('16', 'DD').subtract(1, 'month').format('YYYY/MM/DD');
      todate = moment().endOf('month').subtract(1, 'month').format('YYYY/MM/DD');
    }

    const fromaddress = `OOGET PTE LTD<br> 11 SIMS DRIVE #02-01 SCN CENTRE, SINGAPORE 387385<br> TEL: (65) 6248 3513, FAX: (65) 6214 0809<br> CO REG NO.: 201721377K, CO EA LICENSE NO.:18C9125`;

    const toaddress = `Allport Cargo Services Logistics Pte Limited<br> 11 Sims Drive, SCN Centre<br> #02-01<br> Singapore 387385`;

    const jobdetails = await Job.findOne({ _id: jobid }, { jobperiodfrom: 1, jobperiodto: 1, chargerate: 1, companyid: 1 })
      .populate('companyid', 'companycode');
    const jobchargerate = jobdetails.chargerate;
    const companycode = jobdetails.companyid.companycode;

    const invoicedate = moment().format('YYYY/MM/DD');

    const contracts = await Contract.aggregate([
      { $match: { jobid: ObjectId(jobid) } },
      {
        $lookup: {
          from: 'jobseekers',
          localField: 'jobseekerid',
          foreignField: '_id',
          as: 'jobseeker'
        }
      },
      { $unwind: '$timesheet' },
      { $match: { 'timesheet.date': { $gte: moment(fromdate, 'YYYY/MM/DD').format('YYYY/MM/DD'), $lte: moment(todate, 'YYYY/MM/DD').format('YYYY/MM/DD') }, 'timesheet.verified': true, invoicegenerated: true } },
      {
        $group: {
          _id: {
            _id: '$_id',
          },
          timesheet: {
            $push: {
              timesheet: '$timesheet'
            }
          },
          jobseeker: {
            $first: {
              _id: '$jobseeker._id',
              username: '$jobseeker.username',
              email: '$jobseeker.email',
            }
          },
        }
      },
      {
        $project: {
          _id: "$_id._id",
          timesheet: "$timesheet.timesheet",
          jobseekerusername: { $arrayElemAt: ['$jobseeker.username', 0] },
          jobseekeremail: { $arrayElemAt: ['$jobseeker.email', 0] }
        }
      }
    ])


    function invoiceGeneration() {

      let invoiceChargesArray = [];

      for (let i = 0; i < contracts.length; i++) {

        let contractid = contracts[i]._id

        let timesheet = contracts[i].timesheet;
        let jobseekerusername = contracts[i].jobseekerusername;
        let jobseekeremail = contracts[i].jobseekeremail;

        let normaljobchargerate = jobchargerate;
        let normalemployercharges = 0;
        let normalworkminutes = 0;


        let otjobchargerate15 = jobchargerate * 1.5;
        let otemployercharges15 = 0;
        let otworkminutes15 = 0;

        let otjobchargerate20 = jobchargerate * 2.0;
        let otemployercharges20 = 0;
        let otworkminutes20 = 0;

        for (let j = 0; j < timesheet.length; j++) {
          normalemployercharges += timesheet[j].normalemployercharges;
          normalworkminutes += moment.duration(timesheet[j].normalworkhour).asMinutes();

          if (timesheet[j].salarymultiplier == 2) {
            otemployercharges20 += timesheet[j].otemployercharges;
            otworkminutes20 += moment.duration(timesheet[j].otworkhour).asMinutes();
          } else {
            otemployercharges15 += timesheet[j].otemployercharges;
            otworkminutes15 += moment.duration(timesheet[j].otworkhour).asMinutes()
          }
        }

        let chargesandhours = {
          contractid,
          jobseekerusername,
          jobseekeremail,
          normaljobchargerate,
          normalemployercharges: Math.round(normalemployercharges * 100) / 100,
          normalworkminutes,
          otjobchargerate15,
          otemployercharges15: Math.round(otemployercharges15 * 100) / 100,
          otworkminutes15,
          otjobchargerate20,
          otemployercharges20: Math.round(otemployercharges20 * 100) / 100,
          otworkminutes20
        }

        invoiceChargesArray.push(chargesandhours)

      }

      return invoiceChargesArray
    }

    let invoicecharges = [];
    invoicecharges = invoiceGeneration();

    let invoicechargeslength = invoicecharges.length;

    if (invoicechargeslength <= 0) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'invoicegenerationimpossible'
      })
    }

    function invoiceTotalCalculation() {
      let total = 0;

      for (let i = 0; i < invoicecharges.length; i++) {
        total += invoicecharges[i].normalemployercharges;
        total += invoicecharges[i].otemployercharges15;
        total += invoicecharges[i].otemployercharges20;
      }

      total = Math.round(total * 100) / 100
      return total;
    }

    let invoicetotal = 0;
    invoicetotal = invoiceTotalCalculation();

    let acno = '033-955234-3';
    let acname = 'Ooget Pte Ltd';
    let bankname = 'Development Bank of Singapore';
    let swiftcode = 'DBSSSGSG';
    let cheque = 'All cheque should be crossed and made payable to "Ooget Pte Ltd"';
    let paymentterms = 'COD';
    let latepayment = '2% per month';

    const invoice = {
      fromaddress,
      toaddress,
      companycode,
      invoicedate,
      contractdetails: invoicecharges,
      invoicetotal,
      fromdate,
      todate,
      acno,
      acname,
      bankname,
      swiftcode,
      cheque,
      paymentterms,
      latepayment,
      createdAt
    }

    const newinvoice = await new Invoice(invoice).save()
    const invoiceid = newinvoice._id;



    const invoicedetails = await Invoice.findOne({ _id: invoiceid }, {})

    for (let i = 0; i < contracts.length; i++) {

      let contractid = contracts[i]._id;
      let timesheet = contracts[i].timesheet

      for (let j = 0; j < timesheet.length; j++) {
        await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheet[j]._id }, {
          $set: {
            'timesheet.$.invoiceid': invoiceid,
            'timesheet.$.invoicegenerated': true,
            'timesheet.$.invoicegeneratedat': createdAt
          }
        })
      }


    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      invoicedetails
    })

  } catch (error) {
    return next(error)
  }
}

exports.fetchcalendartestdata = async (req, res, next) => {
  try {
    const message = { "page": 1, "total_results": 447, "total_pages": 23, "results": [{ "vote_count": 28, "id": 399579, "video": false, "vote_average": 7.4, "title": "Alita: Battle Angel", "popularity": 71.214, "poster_path": "\/xRWht48C2V8XNfzvPehyClOvDni.jpg", "original_language": "en", "original_title": "Alita: Battle Angel", "genre_ids": [28, 878, 53, 10749], "backdrop_path": "\/8RKBHHRqOMOLh5qW3sS6TSFTd8h.jpg", "adult": false, "overview": "When Alita awakens with no memory of who she is in a future world she does not recognize, she is taken in by Ido, a compassionate doctor who realizes that somewhere in this abandoned cyborg shell is the heart and soul of a young woman with an extraordinary past.", "release_date": "2019-02-05" }, { "vote_count": 279, "id": 463684, "video": false, "vote_average": 5.8, "title": "Velvet Buzzsaw", "popularity": 70.608, "poster_path": "\/3rViQPcrWthMNecp5XnkKev6BzW.jpg", "original_language": "en", "original_title": "Velvet Buzzsaw", "genre_ids": [53, 9648, 27, 35], "backdrop_path": "\/ckNp6LPhp1roR8dVI16q5u3LUMg.jpg", "adult": false, "overview": "Big money artists and mega-collectors pay a high price when art collides with commerce. After a series of paintings by an unknown artist are discovered, a supernatural force enacts revenge on those who have allowed their greed to get in the way of art.", "release_date": "2019-02-01" }, { "vote_count": 0, "id": 487297, "video": false, "vote_average": 0, "title": "What Men Want", "popularity": 50.401, "poster_path": "\/cD02qmrDtPXnGtiMcKRlEXNR2Uv.jpg", "original_language": "en", "original_title": "What Men Want", "genre_ids": [35, 14, 10749], "backdrop_path": "\/umecegsPpKr2ZXA62Da9CQBVoIO.jpg", "adult": false, "overview": "Magically able to hear what men are thinking, a sports agent uses her newfound ability to turn the tables on her overbearing male colleagues.", "release_date": "2019-02-08" }, { "vote_count": 1, "id": 438650, "video": false, "vote_average": 8, "title": "Cold Pursuit", "popularity": 48.728, "poster_path": "\/hXgmWPd1SuujRZ4QnKLzrj79PAw.jpg", "original_language": "en", "original_title": "Cold Pursuit", "genre_ids": [53, 28, 18], "backdrop_path": "\/aiM3XxYE2JvW1vJ4AC6cI1RjAoT.jpg", "adult": false, "overview": "Nels Coxman's quiet life comes crashing down when his beloved son dies under mysterious circumstances. His search for the truth soon becomes a quest for revenge as he seeks coldblooded justice against a drug lord and his inner circle.", "release_date": "2019-02-07" }, { "vote_count": 3, "id": 530081, "video": false, "vote_average": 0, "title": "The Man Who Killed Hitler and Then the Bigfoot", "popularity": 42.077, "poster_path": "\/2SjYLE1kOiw7A1NioP24ER0aXov.jpg", "original_language": "en", "original_title": "The Man Who Killed Hitler and Then the Bigfoot", "genre_ids": [18, 12], "backdrop_path": null, "adult": false, "overview": "A legendary American war veteran is recruited to hunt a mythical creature.", "release_date": "2019-02-08" }, { "vote_count": 1, "id": 532671, "video": false, "vote_average": 6, "title": "The Prodigy", "popularity": 38.277, "poster_path": "\/fejQlxUb377Cq5UckEmpS6owdUh.jpg", "original_language": "en", "original_title": "The Prodigy", "genre_ids": [27], "backdrop_path": "\/g5fUxWupgKTSqV3cHSx0QdGT2tB.jpg", "adult": false, "overview": "A mother concerned about her young son's disturbing behavior thinks something supernatural may be affecting him.", "release_date": "2019-02-07" }, { "vote_count": 2, "id": 426249, "video": false, "vote_average": 0, "title": "Lords of Chaos", "popularity": 37.797, "poster_path": "\/y2eOIfQw2lLZov6aJZ3xpPjnRHH.jpg", "original_language": "en", "original_title": "Lords of Chaos", "genre_ids": [18, 27, 53], "backdrop_path": "\/g4ddmIA9ARzJvKhNlHU12TLH5wr.jpg", "adult": false, "overview": "A teenager's quest to launch Norwegian Black Metal in Oslo in the 1990s results in a very violent outcome.", "release_date": "2019-02-08" }, { "vote_count": 5, "id": 560066, "video": false, "vote_average": 7.7, "title": "Scooby-Doo! and the Curse of the 13th Ghost", "popularity": 36.358, "poster_path": "\/lGFtGPBKS4npO9wEUhdiKCWVbKe.jpg", "original_language": "en", "original_title": "Scooby-Doo! and the Curse of the 13th Ghost", "genre_ids": [35, 10751, 16, 12, 9648], "backdrop_path": "\/42LlduRyePcYQ5qo2kMr1qW1bv4.jpg", "adult": false, "overview": "Mystery Inc. withdraws from solving crimes after botching a case. When Vincent Van Ghoul contacts the gang about an unfinished investigation from Daphne, Shaggy and Scooby's past, the gang springs into action to finish the job that involves catching the 13th Ghost that escaped from the Chest of Demons and is still at large.", "release_date": "2019-02-05" }, { "vote_count": 1, "id": 424651, "video": false, "vote_average": 0, "title": "Untogether", "popularity": 36.124, "poster_path": "\/kfypuQSaXQTSXQk837qPwRW3H8K.jpg", "original_language": "en", "original_title": "Untogether", "genre_ids": [35, 18], "backdrop_path": "\/8fngsigNtPnU2NVyuFtitWjLlSg.jpg", "adult": false, "overview": "Once considered a teen prodigy, a recovering addict sobers up and tries to get her writing career back on track. She begins a relationship with a rising author known for his wartime memoirs.", "release_date": "2019-02-08" }, { "vote_count": 2, "id": 401686, "video": false, "vote_average": 0, "title": "Berlin, I Love You", "popularity": 32.021, "poster_path": "\/i9LdjJWgYIaOkvG7NtTcq5Ox4nO.jpg", "original_language": "en", "original_title": "Berlin, I Love You", "genre_ids": [18], "backdrop_path": "\/gmqGmSx8sRi7XX9f39qF7FdDPUG.jpg", "adult": false, "overview": "The anthology feature of 10 stories of romance set in the German capital.", "release_date": "2019-02-08" }, { "vote_count": 0, "id": 486269, "video": false, "vote_average": 0, "title": "Under the Eiffel Tower", "popularity": 30.212, "poster_path": "\/qmYNgtm3UPnoxdZBeIPUaje8CdH.jpg", "original_language": "en", "original_title": "Under the Eiffel Tower", "genre_ids": [10749], "backdrop_path": null, "adult": false, "overview": "Stuart is a having a mid-life crisis. Desperate for something more in life, he tags along on his best friend's family vacation to Paris - then proposes to his friend's 24-year-old daughter, Rosalind, while standing under the Eiffel Tower.", "release_date": "2019-02-08" }, { "vote_count": 1, "id": 520390, "video": false, "vote_average": 0, "title": "The Kindness of Strangers", "popularity": 30.169, "poster_path": "\/3pJfxmBQJwUnvLNZprpOOur9I7Q.jpg", "original_language": "en", "original_title": "The Kindness of Strangers", "genre_ids": [], "backdrop_path": null, "adult": false, "overview": "Clara arrives in wintry New York with her two sons on the back seat of her car. The journey, which she has disguised as an adventure for her children’s sake, is soon revealed to be an escape from an abusive husband and father. He is a cop, and Clara is desperately trying to elude his attempts to pursue her. The three have little more than their car, and when this is towed away, they are left penniless on the street. But the big cold city shows mercy: in their search for refuge, the family meets a selfless nurse named Alice who arranges beds for them at an emergency shelter. While stealing food at a Russian restaurant called ‘Winter Palace’, Clara meets an ex-con, Marc, who has been given the chance to help the old eatery regain its former glory. The ‘Winter Palace’ soon becomes a place of unexpected encounters between people who are all undergoing some sort of crisis and whom fate has now brought together.", "release_date": "2019-02-07" }, { "vote_count": 0, "id": 575351, "video": false, "vote_average": 0, "title": "Kumbalangi Nights", "popularity": 29.193, "poster_path": "\/lJ3RvIirE2C7gdBKvPRaoQ3iCo2.jpg", "original_language": "ml", "original_title": "കുമ്പളങ്ങി നൈറ്റ്‌സ്", "genre_ids": [10751], "backdrop_path": "\/8i8ml0LRdFT6LSaTMUG3gLzJfEq.jpg", "adult": false, "overview": "", "release_date": "2019-02-07" }, { "vote_count": 1, "id": 513349, "video": false, "vote_average": 7, "title": "The Factory", "popularity": 26.853, "poster_path": "\/dS33k6UvEV8Dt0Yr06I5gDRKPmb.jpg", "original_language": "ru", "original_title": "Завод", "genre_ids": [53, 18, 80], "backdrop_path": "\/o8wKJRBTc7HqOtWtFcgm9DnPFQ7.jpg", "adult": false, "overview": "When a factory is bound to close, a group of workers decides to take action against the owner.", "release_date": "2019-02-07" }, { "vote_count": 0, "id": 553641, "video": false, "vote_average": 0, "title": "Black Garden", "popularity": 26.333, "poster_path": "\/3i0QzLrBA9d2rLvff9Yt8gFpZIL.jpg", "original_language": "en", "original_title": "Black Garden", "genre_ids": [18], "backdrop_path": null, "adult": false, "overview": "Set on Christmas Eve, eight days after the war ends, survivor Kate discovers a mysterious radio signal and befriends the voice. As she embarks on a journey to find its origins, Kate encounters the isolation and horror of a nuclear war and the failed hope of those who survived.", "release_date": "2019-02-07" }, { "vote_count": 13, "id": 469274, "video": false, "vote_average": 7.7, "title": "Nicky Larson et le Parfum de Cupidon", "popularity": 26.258, "poster_path": "\/I6Ns3vAGgWOhInv1EjD6BaZP2Q.jpg", "original_language": "fr", "original_title": "Nicky Larson et le Parfum de Cupidon", "genre_ids": [12, 35], "backdrop_path": "\/pKDVywMKjM7TeU739z7cR9wu9Sf.jpg", "adult": false, "overview": "", "release_date": "2019-02-06" }, { "vote_count": 0, "id": 497089, "video": false, "vote_average": 0, "title": "Glück ist was für Weicheier", "popularity": 26.112, "poster_path": "\/jjYQloNFakBdk39YoULuwN7hetM.jpg", "original_language": "de", "original_title": "Glück ist was für Weicheier", "genre_ids": [35], "backdrop_path": null, "adult": false, "overview": "", "release_date": "2019-02-07" }, { "vote_count": 1, "id": 568165, "video": false, "vote_average": 5, "title": "Copperman", "popularity": 26.004, "poster_path": "\/zK2uXetobAY9FJvtXJTWlP23Wuj.jpg", "original_language": "it", "original_title": "Copperman", "genre_ids": [], "backdrop_path": "\/waCMW6MjmbofvFnbgyqjGpZ4mTf.jpg", "adult": false, "overview": "", "release_date": "2019-02-07" }, { "vote_count": 0, "id": 571466, "video": false, "vote_average": 0, "title": "Mødregruppen", "popularity": 25.671, "poster_path": "\/1eCXLj6GJfBPEVuvqdFP7vzbyMz.jpg", "original_language": "da", "original_title": "Mødregruppen", "genre_ids": [], "backdrop_path": null, "adult": false, "overview": "New mother Line is living the high life in Hong Kong with husband Bjørn when she discovers that he has been unfaithful to her with their Filipino nanny, so Line takes her baby son and heads back to her old hometown in southern Funen.", "release_date": "2019-02-07" }, { "vote_count": 0, "id": 570736, "video": false, "vote_average": 0, "title": "The Day After I'm Gone", "popularity": 25.449, "poster_path": "\/rg8lh2xL0GiwkqSzD0BShYQLFgg.jpg", "original_language": "he", "original_title": "היום שאחרי לאחת", "genre_ids": [18], "backdrop_path": null, "adult": false, "overview": "A middle aged single father copes with his teenage daughter's wish to end her life.", "release_date": "2019-02-07" }] };

    return res.json({
      success: true,
      message
    })
  } catch (error) {
    return next(error)
  }
}
