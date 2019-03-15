const express = require('express');
const controller = require('../../controllers/admin/auth.controller');
const { adminauthorize } = require('../../middlewares/admin.auth');
const { adminimage, featuredimage } = require('../../middlewares/media');

const router = express.Router();

router.route('/login')
  .post(controller.login);

router.route('/createadmin')
  .post(controller.createadmin);

router.route('/fetchprofiledetails')
  .post(adminauthorize(), controller.fetchprofiledetails);

router.route('/uniqueadminemail')
  .post(adminauthorize(), controller.uniqueadminemail);

router.route('/updateprofiledetails')
  .post(adminauthorize(), controller.updateprofiledetails);

router.route('/updateprofileimage')
  .post(adminauthorize(), adminimage, controller.updateprofileimage);

router.route('/fetchoogethome')
  .post(adminauthorize(), controller.fetchoogethome);

router.route('/updateoogethome')
  .post(adminauthorize(), controller.updateoogethome);

router.route('/fetchfeaturedimages')
  .post(adminauthorize(), controller.fetchfeaturedimages);

router.route('/addfeaturedimage')
  .post(adminauthorize(), featuredimage, controller.addfeaturedimage);

router.route('/deletefeaturedimage')
  .post(adminauthorize(), controller.deletefeaturedimage);

router.route('/addholiday')
  .post(adminauthorize(), controller.addholiday);

router.route('/editholiday')
  .post(adminauthorize(), controller.editholiday);

router.route('/deleteholiday')
  .post(adminauthorize(), controller.deleteholiday);

router.route('/fetchholidaylist')
  .post(adminauthorize(), controller.fetchholidaylist);

router.route('/addfaq')
  .post(adminauthorize(), controller.addfaq);

router.route('/updatefaq')
  .post(adminauthorize(), controller.updatefaq);

router.route('/deletefaq')
  .post(adminauthorize(), controller.deletefaq);

router.route('/fetchfaqs')
  .post(adminauthorize(), controller.fetchfaqs);

router.route('/createrole')
  .post(adminauthorize(), controller.createrole);

router.route('/updatejobseekerterms')
  .post(adminauthorize(), controller.updatejobseekerterms);

router.route('/fetchjobseekerterms')
  .post(adminauthorize(), controller.fetchjobseekerterms);

module.exports = router;
