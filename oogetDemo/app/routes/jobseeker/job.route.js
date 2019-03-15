const express = require('express');
const controller = require('../../controllers/jobseeker/job.controller');
const { jobseekerauthorize } = require('../../middlewares/jobseeker.auth');

const router = express.Router();

router.route('/jobslist')
  .post(jobseekerauthorize(), controller.jobslist);

router.route('/fetchparticularjob')
  .post(jobseekerauthorize(), controller.fetchparticularjob);

router.route('/applytojob')
  .post(jobseekerauthorize(), controller.applytojob);

router.route('/rejectjob')
  .post(jobseekerauthorize(), controller.rejectjob);

router.route('/myjobs')
  .post(jobseekerauthorize(), controller.myjobs);

router.route('/fetchappliedjobs')
  .post(jobseekerauthorize(), controller.fetchappliedjobs);

router.route('/fetchofferedjobs')
  .post(jobseekerauthorize(), controller.fetchofferedjobs);

router.route('/joboffers')
  .post(jobseekerauthorize(), controller.joboffers);

router.route('/confirmjob')
  .post(jobseekerauthorize(), controller.confirmjob);

router.route('/newapplytojob')
  .post(jobseekerauthorize(), controller.newapplytojob);

router.route('/savejob')
  .post(jobseekerauthorize(), controller.savejob);

router.route('/unsavejob')
  .post(jobseekerauthorize(), controller.unsavejob);

router.route('/fetchsavedjobs')
  .post(jobseekerauthorize(), controller.fetchsavedjobs);

module.exports = router;
