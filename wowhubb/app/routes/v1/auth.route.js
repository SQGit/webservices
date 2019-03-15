const express = require('express');
const validate = require('express-validation');
const { login, register } = require('../../validations/auth.validation');
const controller = require('../../controllers/auth.controller');

const router = express.Router();

router.route('/test')
  .post(controller.test);

router.route('/otp')
  .post(controller.otp);

router.route('/mailotp')
  .post(controller.mailotp);

router.route('/signup')
  .post(validate(register), controller.signup);

router.route('/login')
  .post(validate(login), controller.login);

router.route('/emaillogin')
  .post(controller.emaillogin);

router.route('/verifyotp')
  .post(controller.verifyotp);

router.route('/checktagid')
  .post(controller.checktagid);

router.route('/forgetpassword')
  .post(controller.forgetpassword);

router.route('/changepassword')
  .post(controller.changepassword);

router.route('/addversion')
  .post(controller.addversion);

router.route('/updateversion')
  .post(controller.updateversion);

router.route('/checkversion')
  .post(controller.checkversion);

module.exports = router;
