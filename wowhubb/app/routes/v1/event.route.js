const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/event.controller');
const { authorize } = require('../../middlewares/auth');
const { eventmedia } = require('../../middlewares/media');

const router = express.Router();

router.route('/updateinterests')
  .post(authorize(), controller.interests);

router.route('/getinterests')
  .post(authorize(), controller.getinterests);

router.route('/create')
  .post(authorize(), eventmedia, controller.create);

router.route('/getwowtag')
  .post(authorize(), controller.getwowtag);

router.route('/program')
  .post(authorize(), controller.program);

router.route('/info')
  .post(authorize(), controller.info);

router.route('/feed')
  .post(authorize(), controller.feed);

router.route('/testupload')
  .post(eventmedia, controller.testupload);


module.exports = router;
