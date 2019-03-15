const express = require('express');
const controller = require('../../controllers/eventservice.controller');
const { authorize } = require('../../middlewares/auth');
const { eventservicedetails, eventservicegallery } = require('../../middlewares/cloudinarymedia');

const router = express.Router();

router.route('/eventservicedetails')
  .post(authorize(), eventservicedetails, controller.eventservicedetails);

router.route('/eventservicehours')
  .post(authorize(), controller.eventservicehours);

router.route('/eventservicegallery')
  .post(authorize(), eventservicegallery, controller.eventservicegallery);

router.route('/eventservicekeyword')
  .post(authorize(), controller.eventservicekeyword);

router.route('/eventservicefaqs')
  .post(authorize(), controller.eventservicefaqs);

router.route('/myeventservice')
  .post(authorize(), controller.myeventservice);

router.route('/showparticulareventservice')
  .post(authorize(), controller.showparticulareventservice);

router.route('/fetcheventservicebytype')
  .post(authorize(), controller.fetcheventservicebytype);

router.route('/fetchparticulareventservice')
  .post(authorize(), controller.fetchparticulareventservice);

router.route('/filtereventservice')
  .post(authorize(), controller.filtereventservice);



module.exports = router;
