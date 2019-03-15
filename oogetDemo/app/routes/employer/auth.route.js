const express = require('express');
const controller = require('../../controllers/employer/auth.controller');
const { employerauthorize } = require('../../middlewares/employer.auth');
const { companylogo } = require('../../middlewares/media');

const router = express.Router();

router.route('/unqiuecompany')
  .post(controller.unqiuecompany);

router.route('/unqiueemployer')
  .post(controller.unqiueemployer);

router.route('/register')
  .post(controller.register);

router.route('/login')
  .post(controller.login);

router.route('/updatecompanylogo')
  .post(employerauthorize(), companylogo, controller.updatecompanylogo);

router.route('/fetchtermsstatus')
  .post(employerauthorize(), controller.fetchtermsstatus);

router.route('/updatetermsstatus')
  .post(employerauthorize(), controller.updatetermsstatus);

router.route('/fetchownprofile')
  .post(employerauthorize(), controller.fetchownprofile);

router.route('/updateownprofile')
  .post(employerauthorize(), controller.updateownprofile);

router.route('/createsupervisor')
  .post(employerauthorize(), controller.createsupervisor);

router.route('/updatesupervisor')
  .post(employerauthorize(), controller.updatesupervisor);

router.route('/fetchsupervisor')
  .post(employerauthorize(), controller.fetchsupervisor);

router.route('/deletesupervisor')
  .post(employerauthorize(), controller.deletesupervisor);

router.route('/listsupervisors')
  .post(employerauthorize(), controller.listsupervisors);

router.route('/fetchcompany')
  .post(employerauthorize(), controller.fetchcompany);

router.route('/fetchownroles')
  .post(employerauthorize(), controller.fetchownroles);

module.exports = router;
