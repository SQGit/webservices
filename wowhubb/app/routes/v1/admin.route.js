const express = require('express');
const controller = require('../../controllers/admin.controller');

const router = express.Router();

router.route('/emptyfriends')
  .post(controller.emptyfriends);

router.route('/addkeyword')
  .post(controller.addkeyword);

router.route('/fetchevents')
  .post(controller.fetchevents);

router.route('/fetchusers')
  .post(controller.fetchusers);

router.route('/fetchparticularuser')
  .post(controller.fetchparticularuser);

module.exports = router;
