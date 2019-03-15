const httpStatus = require('http-status');
const Company = require('../../models/employer/company.model');
const Jobseeker = require('../../models/jobseeker/jobseeker.model');
const Job = require('../../models/jobs/job.model');
const Contract = require('../../models/jobs/contract.model');
const moment = require('moment');
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;


exports.contractslist = async (req, res, next) => {
  try {
    const id = req.user._id;

    const { jobid } = req.body;

    const contracts = await Contract.find({ jobid }, {})
      .populate({
        path: 'jobid',
        select: '-candidatesapplied -candidatesseleceted -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      });

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
        select: '-candidatesapplied -candidatesseleceted -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      });

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

    let systempunchintime = null; 


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

    starttime = moment(starttime, 'HH:mm').format('YYYY/MM/DD HH:mm');

    const workend = moment(endtime, 'YYYY/MM/DD HH:mm');
    const workstart = moment(starttime, 'YYYY/MM/DD HH:mm');

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
    const checkoffday = await Contract.findOne({ 'offdays.date': offday });

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

