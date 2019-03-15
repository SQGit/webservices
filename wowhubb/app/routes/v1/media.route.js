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

router.route('/business/:name')
  .get(controller.business);

router.route('/static/:name')
  .get(controller.static);

router.route('/eventservice/:name')
  .get(controller.eventservice);

module.exports = router;
