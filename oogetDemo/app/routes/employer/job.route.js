const express = require('express');
const controller = require('../../controllers/employer/job.controller');
const { employerauthorize } = require('../../middlewares/employer.auth');

const router = express.Router();

router.route('/createjob')
  .post(employerauthorize(), controller.createjob);

router.route('/updatejob')
  .post(employerauthorize(), controller.updatejob);

router.route('/jobslist')
  .post(employerauthorize(), controller.jobslist);

router.route('/fetchparticularjob')
  .post(employerauthorize(), controller.fetchparticularjob);

router.route('/fetchparticularjobappliedjobseekers')
  .post(employerauthorize(), controller.fetchparticularjobappliedjobseekers);

router.route('/fetchalljobappliedjobseekers')
  .post(employerauthorize(), controller.fetchalljobappliedjobseekers);

router.route('/fetchparticularjobacceptedjobseekers')
  .post(employerauthorize(), controller.fetchparticularjobacceptedjobseekers);

router.route('/fetchparticularjobsignedcandidates')
  .post(employerauthorize(), controller.fetchparticularjobsignedcandidates);

router.route('/fetchpendingjobs')
  .post(employerauthorize(), controller.fetchpendingjobs);

router.route('/changejobstatus')
  .post(employerauthorize(), controller.changejobstatus);

router.route('/fetchparticularjobseeker')
  .post(employerauthorize(), controller.fetchparticularjobseeker);


router.route('/offerjob')
  .post(employerauthorize(), controller.offerjob);

module.exports = router;
