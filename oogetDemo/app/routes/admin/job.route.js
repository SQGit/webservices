const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/admin/job.controller');
const { adminauthorize } = require('../../middlewares/admin.auth');

const router = express.Router();

router.route('/createjob')
  .post(adminauthorize(), controller.createjob);

router.route('/updatejob')
  .post(adminauthorize(), controller.updatejob);

router.route('/jobslistbyemployer')
  .post(adminauthorize(), controller.jobslistbyemployer);

router.route('/fetchparticularjob')
  .post(adminauthorize(), controller.fetchparticularjob);

router.route('/fetchparticularjobappliedjobseekers')
  .post(adminauthorize(), controller.fetchparticularjobappliedjobseekers);

router.route('/fetchparticularjobacceptedjobseekers')
  .post(adminauthorize(), controller.fetchparticularjobacceptedjobseekers);

router.route('/fetchpendingjobs')
  .post(adminauthorize(), controller.fetchpendingjobs);

router.route('/fetchlivejobs')
  .post(adminauthorize(), controller.fetchlivejobs);

router.route('/changejobstatus')
  .post(adminauthorize(), controller.changejobstatus);

router.route('/changehiringstatus')
  .post(adminauthorize(), controller.changehiringstatus);

router.route('/fetchparticularjobseeker')
  .post(adminauthorize(), controller.fetchparticularjobseeker);

router.route('/offerjob')
  .post(adminauthorize(), controller.offerjob);

router.route('/updatejobstatuswithpayinfo')
  .post(adminauthorize(), controller.updatejobstatuswithpayinfo);

module.exports = router;
