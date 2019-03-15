const express = require('express');
const controller = require('../../controllers/admin/employer.controller');
const { adminauthorize } = require('../../middlewares/admin.auth');
const { termsandconditions } = require('../../middlewares/media');

const router = express.Router();

router.route('/unqiuecompany')
  .post(adminauthorize(), controller.unqiuecompany);

router.route('/unqiueemployer')
  .post(adminauthorize(), controller.unqiueemployer);

router.route('/createemployer')
  .post(adminauthorize(), controller.createemployer);

router.route('/updatecompanydetails')
  .post(adminauthorize(), controller.updatecompanydetails);

router.route('/updatecompanycode')
  .post(adminauthorize(), controller.updatecompanycode);

router.route('/updatetermsandconditions')
  .post(adminauthorize(), termsandconditions, controller.updatetermsandconditions);

router.route('/updateactivestatus')
  .post(adminauthorize(), controller.updateactivestatus);

router.route('/employerslist')
  .post(adminauthorize(), controller.employerslist);

router.route('/viewparticularemployer')
  .post(adminauthorize(), controller.viewparticularemployer);

router.route('/createsupervisor')
  .post(adminauthorize(), controller.createsupervisor);

router.route('/updatesupervisor')
  .post(adminauthorize(), controller.updatesupervisor);

router.route('/fetchsupervisor')
  .post(adminauthorize(), controller.fetchsupervisor);

router.route('/deletesupervisor')
  .post(adminauthorize(), controller.deletesupervisor);

router.route('/listsupervisors')
  .post(adminauthorize(), controller.listsupervisors);

module.exports = router;
