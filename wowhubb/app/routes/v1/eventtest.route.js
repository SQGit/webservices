const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/eventtest.controller');
const { authorize } = require('../../middlewares/auth');
const { eventdetails, eventwowtag, eventhighlights, couponimage, proeventdetails } = require('../../middlewares/media');

const router = express.Router();

router.route('/updateinterests')
  .post(authorize(), controller.interests);

router.route('/getinterests')
  .post(authorize(), controller.getinterests);

// router.route('/create')
//   .post(authorize(), createevent, controller.create);

router.route('/getwowtag')
  .post(authorize(), controller.getwowtag);

router.route('/details')
  .post(authorize(), eventdetails, controller.eventdetails);

router.route('/proeventdetails')
  .post(authorize(), proeventdetails, controller.proeventdetails);

router.route('/eventwowtag')
  .post(authorize(), eventwowtag, controller.eventwowtag);

router.route('/program')
  .post(authorize(), controller.program);

router.route('/highlights')
  .post(authorize(), eventhighlights, controller.eventhighlights);

router.route('/venue')
  .post(authorize(), controller.eventvenue);


/* Highlights */

router.route('/contact')
  .post(authorize(), controller.eventcontact);

router.route('/proeventcontact')
  .post(authorize(), controller.proeventcontact);

/* router.route('/info')
  .post(authorize(), controller.info); */

router.route('/feed')
  .post(authorize(), controller.feed);

router.route('/newfeed')
  .post(authorize(), controller.newfeed);

router.route('/wowsome')
  .post(authorize(), controller.wowsome);

router.route('/postrsvp')
  .post(authorize(), controller.postrsvp);

router.route('/getrsvp')
  .post(authorize(), controller.getrsvp);

router.route('/getcomment')
  .post(authorize(), controller.getcomment);

router.route('/postcomment')
  .post(authorize(), controller.postcomment);

router.route('/proengagementform')
  .post(authorize(), controller.proengagementform);

router.route('/proengagementurl')
  .post(authorize(), controller.proengagementurl);

router.route('/proengagementcoupon')
  .post(authorize(), couponimage, controller.proengagementcoupon);

// router.route('/testupload')
//   .post(createevent, controller.testupload);


module.exports = router;
