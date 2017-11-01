const express = require('express');
const controller = require('../../controllers/media.controller');

const router = express.Router();

router.route('/event/:name')
  .get(controller.event);

router.route('/personal/:name')
  .get(controller.personal);


module.exports = router;
