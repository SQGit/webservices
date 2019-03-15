const express = require('express');
const validate = require('express-validation');
const { login, register } = require('../../validations/auth.validation');
const controller = require('../../controllers/sqlauth.controller');

const router = express.Router();

// router.route('/signup')
//   .post(validate(register), controller.signup);

// router.route('/signin')
//   .post(validate(login), controller.signin);

router.route('/otp')
  .post(controller.otp);

router.route('/otpsignin')
  .post(controller.otpsignin);

router.route('/signup')
    .post(controller.signup);

router.route('/signin')
    .post(controller.signin);

// router.route('/create')
//     .post(controller.create);

router.route('/getuser')
    .post(controller.getuser);

router.route('/getuserbyid')
    .post(controller.getuserbyid);

module.exports = router;