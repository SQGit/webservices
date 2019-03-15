const express = require('express');
const controller = require('../../controllers/admin/contract.controller');
const { employerauthorize } = require('../../middlewares/employer.auth');

const router = express.Router();

router.route('/contractslist')
  .post(employerauthorize(), controller.contractslist);

router.route('/fetchparticularcontract')
  .post(employerauthorize(), controller.fetchparticularcontract);

router.route('/verifypunch')
  .post(employerauthorize(), controller.verifypunch);

router.route('/verifypunchin')
  .post(employerauthorize(), controller.verifypunchin);

router.route('/verifypunchout')
  .post(employerauthorize(), controller.verifypunchout);

router.route('/verifytimesheet')
  .post(employerauthorize(), controller.verifytimesheet);

router.route('/fetchtimesheetdetails')
  .post(employerauthorize(), controller.fetchtimesheetdetails);

router.route('/fetchoffdays')
  .post(employerauthorize(), controller.fetchoffdays);

router.route('/addoffday')
  .post(employerauthorize(), controller.addoffday);

router.route('/removeoffday')
  .post(employerauthorize(), controller.removeoffday);

router.route('/updatenotes')
  .post(employerauthorize(), controller.updatenotes);


module.exports = router;
