const express = require('express');
const controller = require('../../controllers/admin/jobseeker.controller');
const { adminauthorize } = require('../../middlewares/admin.auth');

const router = express.Router();

router.route('/fetchalljobseekers')
  .post(adminauthorize(), controller.fetchalljobseekers);

router.route('/fetchalljobseekersnew')
  .post(adminauthorize(), controller.fetchalljobseekersnew);

router.route('/updateactivestatus')
  .post(adminauthorize(), controller.updateactivestatus);

router.route('/fetchpendingjobseekers')
  .post(adminauthorize(), controller.fetchpendingjobseekers);

router.route('/updatenriceditable')
  .post(adminauthorize(), controller.updatenriceditable);

router.route('/updateidproofeditable')
  .post(adminauthorize(), controller.updateidproofeditable);

router.route('/checkaccess')
  .get(controller.checkaccess);

module.exports = router;
