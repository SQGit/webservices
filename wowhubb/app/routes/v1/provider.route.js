const express = require('express');
const controller = require('../../controllers/provider.controller');
const { authorize } = require('../../middlewares/auth');

const router = express.Router();
const { providerlogo } = require('../../middlewares/media');

router.route('/addserviceprovider')
  .post(providerlogo, controller.addserviceprovider);

router.route('/addcategoryforprovider')
  .post(controller.addcategoryforprovider);

router.route('/getserviceproviders')
  .post(authorize(), controller.getserviceproviders);

router.route('/getcategory')
  .post(authorize(), controller.getcategory);

router.route('/getservices')
  .post(authorize(), controller.getservices);

router.route('/filterservice')
  .post(authorize(), controller.filterservice);

module.exports = router;
