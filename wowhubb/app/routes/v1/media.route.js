const express = require('express');
const controller = require('../../controllers/media.controller');

const router = express.Router();

router.route('/event/:name')
  .get(controller.event);

router.route('/personal/:name')
  .get(controller.personal);

router.route('/provider/:name')
  .get(controller.provider);

router.route('/nearby/:name')
  .get(controller.nearby);

module.exports = router;
