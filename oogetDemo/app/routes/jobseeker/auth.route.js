const express = require('express');
const controller = require('../../controllers/jobseeker/auth.controller');
const { jobseekerauthorize } = require('../../middlewares/jobseeker.auth');
const { jobseekerimage, jobseekeridproof, jobseekerimageproof } = require('../../middlewares/media');

const router = express.Router();

router.route('/fetchfeaturedimages')
  .post(controller.fetchfeaturedimages);

router.route('/fetchoogethome')
  .post(controller.fetchoogethome);

router.route('/fetchjobseekerterms')
  .post(controller.fetchjobseekerterms);

router.route('/fetchservertime')
  .post(controller.fetchservertime);

router.route('/fetchfaqs')
  .post(controller.fetchfaqs);

router.route('/updateidproofnoauth')
  .post(jobseekeridproof, controller.updateidproofnoauth);

router.route('/uniquejobseeker')
  .post(controller.uniquejobseeker);

router.route('/uniquemobileno')
  .post(controller.uniquemobileno);

router.route('/uniquenricfinno')
  .post(controller.uniquenricfinno);

router.route('/register')
  .post(controller.register);

router.route('/forgetpassword')
  .post(controller.forgetpassword);

router.route('/changepasswordnoauth')
  .post(controller.changepasswordnoauth);

router.route('/changepassword')
  .post(jobseekerauthorize(), controller.changepassword);

router.route('/fetchemailwithidnoauth')
  .post(controller.fetchemailwithidnoauth);

router.route('/login')
  .post(controller.login);

router.route('/fetchprofiledetails')
  .post(jobseekerauthorize(), controller.fetchprofiledetails);

router.route('/updateprofiledetails')
  .post(jobseekerauthorize(), controller.updateprofiledetails);

router.route('/updateprofileimage')
  .post(jobseekerauthorize(), jobseekerimage, controller.updateprofileimage);

router.route('/updateidproof')
  .post(jobseekerauthorize(), jobseekeridproof, controller.updateidproof);

router.route('/updateimageandproof')
  .post(jobseekerauthorize(), jobseekerimageproof, controller.updateimageandproof);

module.exports = router;
