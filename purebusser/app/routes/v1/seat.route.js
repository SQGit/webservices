const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/seat.controller');
const { authorize } = require('../../middlewares/auth');

const router = express.Router();

router.route('/fetchcoupons')
  .post(controller.fetchcoupons);

router.route('/checkcoupon')
  .post(authorize(),controller.checkcoupon);

router.route('/usecoupon')
  .post(authorize(),controller.usecoupon);

router.route('/fetchextrafare')
  .post(controller.fetchextrafare);

router.route('/fetchbasefare')
  .post(controller.fetchbasefare);

router.route('/fetchtopcities')
  .post(controller.fetchtopcities);

router.route('/sources')
  .post(controller.sources);

router.route('/trips')
  .post(controller.trips);

router.route('/tripdetails')
  .post(controller.tripdetails);

module.exports = router;
