const express = require('express');
const controller = require('../../controllers/network.controller');
const { authorize } = require('../../middlewares/auth');
const validate = require('express-validation');

const {
  sendRequest, declineRequest, acceptRequest,
} = require('../../validations/network.validation');

const router = express.Router();

router.route('/friendsuggestion')
  .post(authorize(), controller.friendsuggestion);

router.route('/sendrequest')
  .post(authorize(), validate(sendRequest), controller.sendrequest);

router.route('/declinerequest')
  .post(authorize(), validate(declineRequest), controller.declinerequest);

router.route('/acceptrequest')
  .post(authorize(), validate(acceptRequest), controller.acceptrequest);

router.route('/mutual')
  .post(authorize(), controller.mutual);

module.exports = router;
