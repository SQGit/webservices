const express = require('express');
const controller = require('../../controllers/admin/contract.controller');
const { adminauthorize } = require('../../middlewares/admin.auth');

const router = express.Router();

router.route('/contractslist')
  .post(adminauthorize(), controller.contractslist);

router.route('/fetchparticularcontract')
  .post(adminauthorize(), controller.fetchparticularcontract);

router.route('/verifypunch')
  .post(adminauthorize(), controller.verifypunch);

router.route('/verifypunchin')
  .post(adminauthorize(), controller.verifypunchin);

router.route('/verifypunchout')
  .post(adminauthorize(), controller.verifypunchout);

router.route('/verifytimesheet')
  .post(adminauthorize(), controller.verifytimesheet);

router.route('/fetchtimesheetdetails')
  .post(adminauthorize(), controller.fetchtimesheetdetails);

router.route('/fetchoffdays')
  .post(adminauthorize(), controller.fetchoffdays);

router.route('/addoffday')
  .post(adminauthorize(), controller.addoffday);

router.route('/removeoffday')
  .post(adminauthorize(), controller.removeoffday);

router.route('/updatenotes')
  .post(adminauthorize(), controller.updatenotes);

router.route('/inserttimesheet')
  .post(adminauthorize(), controller.inserttimesheet);

router.route('/insertnewtimesheet')
  .post(adminauthorize(), controller.insertnewtimesheet);

router.route('/generatepayroll')
  .post(adminauthorize(), controller.generatepayroll);

router.route('/fetchpayrollforparticularcontract')
  .post(adminauthorize(), controller.fetchpayrollforparticularcontract);

router.route('/fetchcontractforpayroll')
  .post(adminauthorize(), controller.fetchcontractforpayroll);

router.route('/generatereportforparticularcontract')
  .post(adminauthorize(), controller.generatereportforparticularcontract);

router.route('/generatereportforparticularjob')
  .post(adminauthorize(), controller.generatereportforparticularjob);

router.route('/generatereportforparticularemployer')
  .post(adminauthorize(), controller.generatereportforparticularemployer);

router.route('/fetchoffdayssheetforparticularjob')
  .post(adminauthorize(), controller.fetchoffdayssheetforparticularjob);

router.route('/generatetimesheetreportforparticularjobseeker')
  .post(adminauthorize(), controller.generatetimesheetreportforparticularjobseeker);

router.route('/generateinvoice')
  .post(adminauthorize(), controller.generateinvoice)

router.route('/fetchcalendartestdata')
  .post(adminauthorize(), controller.fetchcalendartestdata);


module.exports = router;
