const express = require('express');
const controller = require('../../controllers/admin.controller');

const router = express.Router();

router.route('/emptyfriends')
  .post(controller.emptyfriends);


router.route('/addkeyword')
  .post(controller.addkeyword);


module.exports = router;
