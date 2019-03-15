const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/event.controller');
const { authorize } = require('../../middlewares/auth');

const { eventdetails, androideventdetails, eventwowtag, eventhighlights, couponimage, proeventdetails, saleseventdetails, saleseventofferings, nearbyevent, thoughtsfile } = require('../../middlewares/cloudinarymedia');

const router = express.Router();

// COPY

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

router.route('/androideventdetails')
  .post(authorize(), androideventdetails, controller.androideventdetails);

router.route('/editeventdetails')
  .post(authorize(), eventdetails, controller.editeventdetails);

router.route('/proeventdetails')
  .post(authorize(), proeventdetails, controller.proeventdetails);

router.route('/editproeventdetails')
  .post(authorize(), eventdetails, controller.editproeventdetails);

router.route('/saleseventdetails')
  .post(authorize(), saleseventdetails, controller.saleseventdetails);

router.route('/editsaleseventdetails')
  .post(authorize(), eventdetails, controller.editsaleseventdetails);

router.route('/eventwowtag')
  .post(authorize(), eventwowtag, controller.eventwowtag);

router.route('/program')
  .post(authorize(), controller.program);

router.route('/highlights')
  .post(authorize(), eventhighlights, controller.eventhighlights);

router.route('/venue')
  .post(authorize(), controller.eventvenue);

router.route('/androideventvenue')
  .post(authorize(), controller.androideventvenue);

router.route('/androidonlineevent')
  .post(authorize(), controller.androidonlineevent);

router.route('/tour')
  .post(authorize(), controller.eventtour);

router.route('/saleseventonlinelinks')
  .post(authorize(), controller.saleseventonlinelinks);

router.route('/saleseventphysicallinks')
  .post(authorize(), controller.saleseventphysicallinks);

router.route('/saleseventofferings')
  .post(authorize(), saleseventofferings, controller.saleseventofferings);

router.route('/saleseventpromote')
  .post(authorize(), controller.saleseventpromote);


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

router.route('/fetchparticularevent')
  .post(authorize(), controller.fetchparticularevent);

/* no auth */

router.route('/fetchparticulareventnoauth')
  .post(controller.fetchparticularevent);

router.route('/todaysfeed')
  .post(authorize(), controller.todaysfeed);

router.route('/myfeeds')
  .post(authorize(), controller.myfeeds);

router.route('/hubbfeeds')
  .post(authorize(), controller.hubbfeeds);

router.route('/futurehubbfeeds')
  .post(authorize(), controller.futurehubbfeeds);

router.route('/pasthubbfeeds')
  .post(authorize(), controller.pasthubbfeeds);

router.route('/wowsome')
  .post(authorize(), controller.wowsome);

router.route('/postrsvp')
  .post(authorize(), controller.postrsvp);

router.route('/audienceengagementsubmission')
  .post(authorize(), controller.audienceengagementsubmission);

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

router.route('/deleteevent')
  .post(authorize(), controller.deleteevent);

router.route('/editwowtagvideo')
  .post(authorize(), eventwowtag, controller.editwowtagvideo);

router.route('/deletewowtagvideo')
  .post(authorize(), controller.deletewowtagvideo);

router.route('/androidfeed')
  .post(authorize(), couponimage, controller.androidfeed);

router.route('/keywordsuggestion')
  .post(authorize(), controller.keywordsuggestion);

// router.route('/thoughtstext')
//   .post(authorize(), controller.thoughtstext);

router.route('/thoughts')
  .post(authorize(), thoughtsfile, controller.thoughts);

router.route('/thoughtswowsome')
  .post(authorize(), controller.thoughtswowsome);

router.route('/postthoughtscomment')
  .post(authorize(), controller.postthoughtscomment);

router.route('/getthoughtscomment')
  .post(authorize(), controller.getthoughtscomment);

router.route('/deletethought')
  .post(authorize(), controller.deletethought);


// router.route('/testupload')
//   .post(createevent, controller.testupload);


/* nearby envent for android */

router.route('/addnearbyevent')
  .post(authorize(), nearbyevent, controller.addnearbyevent);

router.route('/adddumpevent')
  .post(authorize(), nearbyevent, controller.adddumpevent);

router.route('/getnearbyeventslist')
  .post(authorize(), controller.getnearbyeventslist);

router.route('/getnearbyevents')
  .post(authorize(), controller.getnearbyevents);

router.route('/geteventtitles')
  .post(authorize(), controller.geteventtitles);

router.route('/myeventtitles')
  .post(authorize(), controller.myeventtitles);

router.route('/getparticulareventtitle')
  .post(authorize(), controller.getparticulareventtitle);

router.route('/emailinvite')
  .post(authorize(), controller.emailinvite);

router.route('/groupemailinvite')
  .post(authorize(), controller.groupemailinvite);

// router.route('/smsinvite')
// .post(authorize(), controller.smsinvite);

// router.route('/groupsmsinvite')
// .post(authorize(), controller.groupsmsinvite);


router.route('/emailrender')
  .get(controller.emailrender);

router.route('/sendtest')
  .post(controller.sendtest);

module.exports = router;
