const express = require('express');
const controller = require('../../controllers/eventvenue.controller');
const { authorize } = require('../../middlewares/auth');
const { eventvenuedetails,eventvenuehallimage } = require('../../middlewares/cloudinarymedia');

const router = express.Router();

router.route('/eventvenueedetails')
  .post(authorize(), eventvenuedetails, controller.eventvenueedetails);

router.route('/eventvenueamenities')
  .post(authorize(), controller.eventvenueamenities);

router.route('/eventvenuehalls')
  .post(authorize(), eventvenuehallimage ,controller.eventvenuehalls);

router.route('/eventvenueavailability')
  .post(authorize(), controller.eventvenueavailability);

router.route('/eventvenuefaqs')
  .post(authorize(), controller.eventvenuefaqs);

router.route('/myeventvenue')
  .post(authorize(), controller.myeventvenue);

router.route('/showparticulareventvenue')
  .post(authorize(), controller.showparticulareventvenue);

router.route('/fetcheventvenuebytype')
  .post(authorize(), controller.fetcheventvenuebytype);

router.route('/fetchparticulareventvenue')
  .post(authorize(), controller.fetchparticulareventvenue);

router.route('/filtereventvenue')
  .post(authorize(), controller.filtereventvenue);



module.exports = router;
