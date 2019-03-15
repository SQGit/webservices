const express = require('express');
const controller = require('../../controllers/business.controller');
const { authorize } = require('../../middlewares/auth');
const { businessdetails, businessgallery } = require('../../middlewares/cloudinarymedia');

const router = express.Router();

router.route('/businessdetails')
  .post(authorize(), businessdetails, controller.businessdetails);

router.route('/businessgallery')
  .post(authorize(), businessgallery, controller.businessgallery);

router.route('/businesskeyword')
  .post(authorize(), controller.businesskeyword);

router.route('/mybusiness')
  .post(authorize(), controller.mybusiness);

router.route('/showparticularbusiness')
  .post(authorize(), controller.showparticularbusiness);


module.exports = router;
