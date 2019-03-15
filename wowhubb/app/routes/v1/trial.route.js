const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/trial.controller');

const { compress } = require('../../middlewares/media');

const router = express.Router();

router.route('/time')
  .post(controller.time);

router.route('/compress')
  .post(compress, controller.compress);

router.route('/sources')
  .post(compress, controller.sources);

router.route('/trips')
  .post(compress, controller.trips);

router.route('/tripdetails')
  .post(compress, controller.tripdetails);

module.exports = router;
