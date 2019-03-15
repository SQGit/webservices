const express = require('express');
const controller = require('../../controllers/group.controller');
const { authorize } = require('../../middlewares/auth');

const router = express.Router();

router.route('/creategroup')
  .post(authorize(), controller.creategroup);

router.route('/addusers')
  .post(authorize(), controller.addusers);

router.route('/fetchgroups')
  .post(authorize(), controller.fetchgroups);

router.route('/fetchemailwithwowtag')
  .post(authorize(), controller.fetchemailwithwowtag);

router.route('/fetchphonewithwowtag')
  .post(authorize(), controller.fetchphonewithwowtag);

router.route('/fetchphonewithwowtagnoauth')
  .post(controller.fetchphonewithwowtag);

router.route('/fetchparticulargroup')
  .post(authorize(), controller.fetchparticulargroup);

router.route('/editgroup')
  .post(authorize(), controller.editgroup);

router.route('/deletegroup')
  .post(authorize(), controller.deletegroup);


module.exports = router;
