const express = require('express');
const controller = require('../controllers/media.controller');

const router = express.Router();

router.route('/jobseeker/:name')
  .get(controller.jobseeker);

router.route('/company/:name')
  .get(controller.company);

router.route('/admin/:name')
  .get(controller.admin);

router.route('/featured/:name')
  .get(controller.featured);

module.exports = router;
