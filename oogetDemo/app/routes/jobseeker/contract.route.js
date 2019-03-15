const express = require('express');
const controller = require('../../controllers/jobseeker/contract.controller');
const { jobseekerauthorize } = require('../../middlewares/jobseeker.auth');

const router = express.Router();

router.route('/contractslist')
  .post(jobseekerauthorize(), controller.contractslist);

router.route('/fetchparticularcontract')
  .post(jobseekerauthorize(), controller.fetchparticularcontract);

router.route('/updatelatereason')
  .post(jobseekerauthorize(), controller.updatelatereason);

router.route('/punchin')
  .post(jobseekerauthorize(), controller.punchin);

router.route('/punchout')
  .post(jobseekerauthorize(), controller.punchout);

router.route('/fetchpunchingtimesheet')
  .post(jobseekerauthorize(), controller.fetchpunchingtimesheet);

router.route('/calculatetime')
  .post(jobseekerauthorize(), controller.calculatetime);


module.exports = router;
