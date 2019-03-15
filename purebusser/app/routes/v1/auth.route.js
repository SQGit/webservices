const express = require('express');
const validate = require('express-validation');
const { login, register } = require('../../validations/auth.validation');
const controller = require('../../controllers/auth.controller');

const router = express.Router();

router.route('/signup')
  .post(validate(register), controller.signup);

router.route('/signin')
  .post(validate(login), controller.signin);

router.route('/otp')
  .post(controller.otp);

module.exports = router;
