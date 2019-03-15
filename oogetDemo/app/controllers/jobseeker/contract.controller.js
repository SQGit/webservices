const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Jobseeker = require('../../models/jobseeker/jobseeker.model');
const Job = require('../../models/jobs/job.model');
const Contract = require('../../models/jobs/contract.model');
const moment = require('moment');

const ObjectId = mongoose.Types.ObjectId;

function pad(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return `${number}`;
}

exports.contractslist = async (req, res, next) => {
  try {
    const id = req.user._id;

    const contracts = await Contract.find({ jobseekerid: id }, {
      contractstatus: 1, jobid: 1, jobseekerid: 1, createdAt: 1, offdays: 1,
    })
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


exports.updatelatereason = async (req, res, next) => {
  try {
    const { contractid, timesheetid, latereason } = req.body;

    const timesheet = await Contract.findOne({ _id: contractid, timesheet: { $elemMatch: { _id: timesheetid } } }, { 'timesheet.$._id': 1 });

    if (!timesheet) {
      return res.json({
        success: false,
        code: httpStatus.NO_CONTENT,
        message: 'timesheetnotfound',
      });
    }

    let punchedin = false;

    if (timesheet) {
      punchedin = timesheet.timesheet[0].punchedin;
    }

    if (punchedin) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'punchedinalready',
      });
    }

    const lateintimatedat = moment().format('YYYY/MM/DD HH:mm');

    await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
      $set: {
        'timesheet.$.lateintimation': true, 'timesheet.$.lateintimatedat': lateintimatedat, 'timesheet.$.latereason': latereason,
      },
    });

    return res.json({
      success: true,
      code: httpStatus.OK,
      latereason,
    });
  } catch (error) {
    return next(error);
  }
};


exports.punchin = async (req, res, next) => {
  try {
    const { contractid, timesheetid } = req.body;

    const contract = await Contract.findOne({ _id: contractid }, {})
      .populate({
        path: 'jobid',
        select: '-candidatesapplied -candidatesseleceted -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      });

    const timesheet = await Contract.findOne({ _id: contractid, 'timesheet._id': timesheetid }, { 'timesheet.$._id': 1 });

    if (!timesheet) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'notimesheet',
      });
    }

    const currentdate = moment().format('YYYY/MM/DD');
    const currenttime = moment().format('HH:mm');
    const jobperiodfrom = contract.jobid.jobperiodfrom;
    const jobperiodto = contract.jobid.jobperiodto;
    const starttime = contract.jobid.starttime;

    const currentdaytime = moment().format('YYYY/MM/DD HH:mm');
    const initialstarttime = moment(currentdate + starttime, 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm');


    const graceperiod = contract.jobid.graceperiod;

    let punchintime = null;
    let systempunchintime = null; 

    const isFrom = jobperiodfrom <= currentdate;
    const isTo = currentdate <= jobperiodto;


    if (!(isFrom && isTo)) {
      if (!isFrom) {
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          jobperiodfrom,
          message: 'cannotpunch',
        });
      } else if (!isTo) {
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          jobperiodto,
          message: 'cannotpunch',
        });
      }
    }

    let punchedin = false;
    let timesheetdate = null;
    let verifiedpunchinedited = false;

    if (timesheet) {
      punchedin = timesheet.timesheet[0].punchedin;
      timesheetdate = timesheet.timesheet[0].date;
      verifiedpunchinedited = timesheet.timesheet[0].verifiedpunchinedited;
    }

    if (punchedin) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'punchedalready',
      });
    }

    const startdaytime = moment(timesheetdate + starttime, 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm');

    if (startdaytime > currentdaytime) {
      punchintime = currentdaytime;
      systempunchintime = initialstarttime; 

      if (verifiedpunchinedited) {
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          message: 'verifiedalready',
        });
      }

      await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
        $set: {
          'timesheet.$.punchintime': punchintime,
          'timesheet.$.systempunchintime': systempunchintime, 
          'timesheet.$.punchedin': true,
        },
      });
    } else if (startdaytime < currentdaytime) {
      if (graceperiod > 0) {
        const gracestarttime = moment(timesheetdate + starttime, 'YYYY/MM/DD HH:mm').add(graceperiod, 'minutes').format('YYYY/MM/DD HH:mm');
        if (gracestarttime >= currentdaytime) {
          punchintime = currentdaytime;
          systempunchintime = initialstarttime; 

          if (verifiedpunchinedited) {
            return res.json({
              success: false,
              code: httpStatus.NOT_ACCEPTABLE,
              message: 'verifiedalready',
            });
          }

          await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
            $set: {
              'timesheet.$.punchintime': punchintime,
              'timesheet.$.systempunchintime': systempunchintime, 
              'timesheet.$.punchedin': true,
            },
          });
        } else if (gracestarttime < currentdaytime) {
          punchintime = currentdaytime;
          systempunchintime = currentdaytime; 

          const newcurrentdaytime = moment(currentdaytime, 'YYYY/MM/DD HH:mm');
          const newstartdaytime = moment(startdaytime, 'YYYY/MM/DD HH:mm');


          const lateduration = moment.duration(newcurrentdaytime.diff(newstartdaytime));
          const durationoflate = Math.round(lateduration.asMinutes());

          const durationoflatehour = pad(Math.floor(durationoflate / 60), 2);
          const durationoflateminutes = pad(Math.floor(durationoflate % 60), 2);

          const totaldurationoflate = `${durationoflatehour}:${durationoflateminutes}`;

          if (verifiedpunchinedited) {
            return res.json({
              success: false,
              code: httpStatus.NOT_ACCEPTABLE,
              message: 'verifiedalready',
            });
          }


          await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
            $set: {
              'timesheet.$.punchintime': punchintime,
              'timesheet.$.systempunchintime': systempunchintime, 
              'timesheet.$.punchedin': true,
              'timesheet.$.late': true,
              'timesheet.$.lateinhour': totaldurationoflate,
            },
          });
        }
      } else if (graceperiod === 0) {
        punchintime = currentdaytime;
        systempunchintime = currentdaytime; 

        const newcurrentdaytime = moment(currentdaytime, 'YYYY/MM/DD HH:mm');
        const newstartdaytime = moment(startdaytime, 'YYYY/MM/DD HH:mm');

        const lateduration = moment.duration(newcurrentdaytime.diff(newstartdaytime));
        const durationoflate = Math.round(lateduration.asMinutes());

        const durationoflatehour = pad(Math.floor(durationoflate / 60), 2);
        const durationoflateminutes = pad(Math.floor(durationoflate % 60), 2);

        const totaldurationoflate = `${durationoflatehour}:${durationoflateminutes}`;

        if (verifiedpunchinedited) {
          return res.json({
            success: false,
            code: httpStatus.NOT_ACCEPTABLE,
            message: 'verifiedalready',
          });
        }


        await Contract.findOneAndUpdate({ _id: contractid, 'timesheet._id': timesheetid }, {
          $set: {
            'timesheet.$.punchintime': punchintime,
            'timesheet.$.systempunchintime': systempunchintime, 
            'timesheet.$.punchedin': true,
            'timesheet.$.late': true,
            'timesheet.$.lateinhour': totaldurationoflate,
          },
        });
      }
    } else {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'cannotpunch',
      });
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      punchin: punchintime,
    });
  } catch (error) {
    return next(error);
  }
};

exports.punchout = async (req, res, next) => {
  try {
    const { contractid, timesheetid } = req.body;

    const contract = await Contract.findOne({ _id: contractid }, {})
      .populate({
        path: 'jobid',
        select: '-candidatesapplied -candidatesseleceted -rejectedcandidates',
        populate: { path: 'companyid', select: 'companyname companycode profile uennumber industry' },
      });

    const currentdate = moment().format('YYYY/MM/DD');
    const currenttime = moment().format('HH:mm');
    const jobperiodfrom = contract.jobid.jobperiodfrom;
    const jobperiodto = contract.jobid.jobperiodto;

    const currentdaytime = moment().format('YYYY/MM/DD HH:mm');

    const breaktime = contract.jobid.breaktime;

    const timesheet = await Contract.findOne({ _id: contractid, 'timesheet._id': timesheetid }, { 'timesheet.$._id': 1 });

    if (!timesheet) {
      return res.json({
        success: false,
        code: httpStatus.NOT_FOUND,
        message: 'notimesheet',
      });
    }

    let punchedin = false;
    let punchintime = null; 
    let systempunchintime = null; 
    let punchedout = false; 
    let verifiedpunchoutedited = false; 
    let verifiedpunchinedited = false; 

    let timesheetsalarymultiplier = null; 

    if (timesheet) {
      punchedin = timesheet.timesheet[0].punchedin;
      punchintime = timesheet.timesheet[0].punchintime; 
      systempunchintime = timesheet.timesheet[0].systempunchintime; 
      timesheetsalarymultiplier = timesheet.timesheet[0].salarymultiplier; 
      punchedout = timesheet.timesheet[0].punchedout; 
      verifiedpunchinedited = timesheet.timesheet[0].verifiedpunchinedited; 
      verifiedpunchoutedited = timesheet.timesheet[0].verifiedpunchoutedited; 
    }

    if (verifiedpunchoutedited) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'verifiedalready',
      });
    }


    if (!punchedin) { 
      if(!verifiedpunchinedited){
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          message: 'punchinfirst',
        });
      }
    }

    if (punchedout) { 
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'punchedoutalready',
      });
    }



    const punchinforbreak = moment(systempunchintime, 'YYYY/MM/DD HH:mm').format('HH:mm'); 
    const punchoutforbreak = moment(currentdaytime, 'YYYY/MM/DD HH:mm').format('HH:mm');


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

    const isFrom = jobperiodfrom <= currentdate;
    const isTo = currentdate <= jobperiodto;

    if (!(isFrom && isTo)) {
      if (!isFrom) {
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          message: 'cannotpunch',
        });
      } else if (!isTo) {
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          message: 'cannotpunch',
        });
      }
    }

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

    const workduration = moment.duration(workend.diff(workstart));

    let durationofwork = Math.round(workduration.asMinutes());

    durationofwork -= breakduration; 

    let durationofworkhour = pad(Math.floor(durationofwork / 60), 2);
    let durationofworkminutes = pad(Math.floor(durationofwork % 60), 2);

    let totaldurationofwork = `${durationofworkhour}:${durationofworkminutes}`;

    let minimumpunchouttime = null; 

    if (punchintime > starttime) { 
      minimumpunchouttime = moment(punchintime, 'YYYY/MM/DD HH:mm').add(15, 'minutes').format('YYYY/MM/DD HH:mm');
    } else if (punchintime < starttime) {
      minimumpunchouttime = moment(starttime, 'YYYY/MM/DD HH:mm').add(15, 'minutes').format('YYYY/MM/DD HH:mm');
      punchintime = starttime;
    }

    if (currentdaytime < minimumpunchouttime) {
      return res.json({
        success: false,
        code: httpStatus.NOT_ACCEPTABLE,
        message: 'wait15minutes',
        punchintime, 
      });
    }

    const workedend = moment(currenttime, 'HH:mm');
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
        'timesheet.$.punchouttime': currentdaytime,
        'timesheet.$.systempunchouttime': currentdaytime, 
        'timesheet.$.normalworkhour': normalworkhour,
        'timesheet.$.otworkhour': otworkhour,
        'timesheet.$.totalworkhour': totalworkhour,
        'timesheet.$.normalsalary': normalsalary,
        'timesheet.$.otsalary': otsalary,
        'timesheet.$.totalsalary': totalsalary,
        'timesheet.$.punchedout': true,
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
      punchout: currentdaytime,
    });
  } catch (error) {
    return next(error);
  }
};

exports.fetchpunchingtimesheet = async (req, res, next) => { 
  try {
    const { contractid } = req.body;

    const currentdate = moment().format('YYYY/MM/DD');
    const currentdaytime = moment().format('YYYY/MM/DD HH:mm');
    const previousdate = moment().subtract(1, 'day').format('YYYY/MM/DD');
    const currenttime = moment().format('HH:mm');
    const job = await Contract.findOne({ _id: contractid }, { jobid: 1 }).populate('jobid');
    const contract = await Contract.findOne({ _id: contractid }, {});

    let starttime = job.jobid.starttime;
    const jobstarttime = job.jobid.starttime;
    let endtime = job.jobid.endtime;
    const jobendtime = job.jobid.endtime;
    let jobperiodfrom = job.jobid.jobperiodfrom;
    const jobjobperiodfrom = job.jobid.jobperiodfrom;
    let jobperiodto = job.jobid.jobperiodto;
    const jobjobperiodto = job.jobid.jobperiodto;
    let contractstatus = contract.contractstatus;

    let workend = null;
    let workstart = null;
    let workduration = null;
    let span = false;

    jobperiodfrom = moment(jobjobperiodfrom + starttime, 'YYYY/MM/DD HH:mm').subtract(15, 'minutes').format('YYYY/MM/DD HH:mm');
    const isFrom = jobperiodfrom <= currentdaytime;

    jobperiodto = moment(jobjobperiodto + starttime, 'YYYY/MM/DD HH:mm').add(24, 'hours').format('YYYY/MM/DD HH:mm');
    const isTo = currentdaytime <= jobperiodto;

    const jobperiodextendedto = moment(jobjobperiodto + endtime, 'YYYY/MM/DD HH:mm').add(24, 'hours').format('YYYY/MM/DD HH:mm');
    const isExtendedTo = currentdaytime <= jobperiodextendedto;

    if (endtime > starttime) {
      span = false;
      workend = moment(endtime, 'HH:mm');
      workstart = moment(starttime, 'HH:mm');
      workduration = moment.duration(workend.diff(workstart));
    } else if (starttime > endtime) {
      span = true;
      workend = moment(currentdate + endtime, 'YYYY/MM/DD HH:mm');
      workstart = moment(previousdate + starttime, 'YYYY/MM/DD HH:mm');
      workduration = moment.duration(workend.diff(workstart));
    }

    let timesheet = null;
    let waittill = null;

    const currentcontract = await Contract.findOne({ _id: contractid, 'timesheet.date': currentdate }, { 'timesheet.$.date': 1 });
    const yesterdaycontract = await Contract.findOne({ _id: contractid, 'timesheet.date': previousdate }, { 'timesheet.$.date': 1 });

    let currenttimesheet = null;
    let currentpunchedin = false;
    let currentpunchedout = false;

    let yesterdaytimesheet = null;
    let yesterdaypunchedin = false;
    let yesterdaypunchedout = false;

    if (!(isFrom && isExtendedTo)) {
      if (!isFrom) {
        contractstatus = 'notstarted';
        starttime = jobstarttime;
        endtime = jobendtime;
        jobperiodfrom = jobjobperiodfrom;
        jobperiodto = jobjobperiodto;
        return res.json({
          success: true,
          code: httpStatus.OK,
          contractid,
          starttime,
          endtime,
          jobperiodfrom,
          jobperiodto,
          message: 'cannotpunch',
          contractstatus,
        });
      } else if (!isExtendedTo) {
        contractstatus = 'contractclosed';
        starttime = jobstarttime;
        endtime = jobendtime;
        jobperiodfrom = jobjobperiodfrom;
        jobperiodto = jobjobperiodto;
        return res.json({
          success: true,
          code: httpStatus.OK,
          contractid,
          starttime,
          endtime,
          jobperiodfrom,
          jobperiodto,
          message: 'cannotpunch',
          contractstatus,
        });
      }
    }

    if (currentcontract) {
      currenttimesheet = currentcontract.timesheet[0];
      if (currenttimesheet) {
        currentpunchedin = currenttimesheet.punchedin;
        currentpunchedout = currenttimesheet.punchedout;
      }
    }

    if (yesterdaycontract) {
      yesterdaytimesheet = yesterdaycontract.timesheet[0];
      if (yesterdaytimesheet) {
        yesterdaypunchedin = yesterdaytimesheet.punchedin;
        yesterdaypunchedout = yesterdaytimesheet.punchedout;
      }
    }

    const isJobperiodExceeded = currentdate > jobjobperiodto;

    if(isJobperiodExceeded){
      currenttimesheet = yesterdaytimesheet
    }



    if (!span) {
      starttime = moment(starttime, 'HH:mm').subtract(15, 'minutes').format('HH:mm');
      if (starttime > currenttime) {
        if (yesterdaycontract) {
          timesheet = yesterdaytimesheet;
        }
      } else {
        timesheet = currenttimesheet;
      }
    } else {
      starttime = moment(starttime, 'HH:mm').subtract(15, 'minutes').format('HH:mm');
      if (starttime > currenttime) {
        if (yesterdaycontract) {
          timesheet = yesterdaytimesheet;
        }
      } else {
        timesheet = currenttimesheet;
      }
    }

    starttime = jobstarttime;
    endtime = jobendtime;
    jobperiodfrom = jobjobperiodfrom;
    jobperiodto = jobjobperiodto;


    if (!timesheet && (isFrom && isTo)) {
      waittill = moment().format('mm');
      waittill = parseInt(waittill, 10);
      waittill = 10 - waittill % 10;

      let timesheetcount = contract.timesheet.length;

       
      if(timesheetcount == 1){

        let firsttimesheetdate = contract.timesheet[0].date;
        let excactstart = false;

        if(firsttimesheetdate == jobjobperiodfrom ){
          excactstart = true
        }

        if(!excactstart){
          let current = moment(currenttime,'HH:mm');
          let start = moment(starttime,'HH:mm');

          let duration = moment.duration(start.diff(current));
          let timedurationinminutes = duration.asMinutes();
          
          waittill = timedurationinminutes
        }

      }

      const newstarttime = moment(starttime, 'HH:mm').subtract(15, 'minutes').format('HH:mm');

      return res.json({
        success: true,
        code: httpStatus.OK,
        contractid,
        starttime,
        endtime,
        jobperiodfrom,
        jobperiodto,
        contractstatus,
        timesheet,
        waittill,
      });
    } else if (!timesheet && (isFrom && isExtendedTo)) {
      waittill = moment().format('mm');
      waittill = parseInt(waittill, 10);
      waittill = 10 - waittill % 10;

      
      let timesheetcount = contract.timesheet.length; 

      if(timesheetcount == 1){

        let firsttimesheetdate = contract.timesheet[0].date;
        let excactstart = false;

        if(firsttimesheetdate == jobjobperiodfrom ){
          excactstart = true
        }

        if(!excactstart){
          let current = moment(currenttime,'HH:mm');
          let start = moment(starttime,'HH:mm');

          let duration = moment.duration(start.diff(current));
          let timedurationinminutes = duration.asMinutes();
          
          waittill = timedurationinminutes
        }

      }

      const newstarttime = moment(starttime, 'HH:mm').subtract(15, 'minutes').format('HH:mm');

      if (currenttime < newstarttime) {
        const end = moment(newstarttime, 'HH:mm');
        const start = moment(currenttime, 'HH:mm');
        let duration = moment.duration(end.diff(start));
        duration = duration.asMinutes();
        waittill = duration;
      }
    }

    return res.json({
      success: true,
      code: httpStatus.OK,
      contractid,
      starttime,
      endtime,
      jobperiodfrom,
      jobperiodto,
      contractstatus,
      timesheet,
      waittill,
    });
  } catch (error) {
    return next(error);
  }
};


exports.calculatetime = async (req, res, next) => {
  try {
    const { contractid, punchinforbreak, punchoutforbreak } = req.body;

    const job = await Contract.findOne({ _id: contractid }, { jobid: 1 }).populate('jobid');
    const starttime = job.jobid.starttime;
    const endtime = job.jobid.endtime;
    const breaktime = job.jobid.breaktime;

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


    return res.json({
      success: true,
      code: httpStatus.OK,
      breakduration,
    });
  } catch (error) {
    return next(error);
  }
};

