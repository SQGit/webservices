const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/user.controller');
const { authorize } = require('../../middlewares/auth');

const router = express.Router();

router.route('/blockticket')
  .post(authorize(), controller.blockticket);

module.exports = router;
