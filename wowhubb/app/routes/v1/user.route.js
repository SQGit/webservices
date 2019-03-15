const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/user.controller');
const { authorize } = require('../../middlewares/auth');
// const {
//   createUser,
// } = require('../../validations/user.validation');
// const { personalimage, personalcover, personalself } = require('../../middlewares/media');
const { personalimage, personalcover, personalself } = require('../../middlewares/cloudinarymedia');

const router = express.Router();


// router.param('userId', controller.load);


router
  .route('/')

  // .get(authorize(), validate(listUsers), controller.list)

  .post(authorize(), controller.create);


router.route('/updateemailvisible')
  .post(authorize(), controller.updateemailvisible);

router.route('/updatephonevisible')
  .post(authorize(), controller.updatephonevisible);

router.route('/updatepersonalprofile')
  .post(authorize(), controller.updatepersonalprofile);

router.route('/getpersonalprofile')
  .post(authorize(), controller.getpersonalprofile);

router.route('/personalimage')
  .post(authorize(), personalimage, controller.personalimage);

router.route('/personalgallery')
  .post(authorize(), controller.personalgallery);

router.route('/personalcover')
  .post(authorize(), personalcover, controller.personalcover);

router.route('/personalself')
  .post(authorize(), personalself, controller.personalself);

router.route('/updateprofessionalprofile')
  .post(authorize(), controller.updateprofessionalprofile);

router.route('/updatecollegedetails')
  .post(authorize(), controller.updatecollegedetails);

router.route('/updateworkexperience')
  .post(authorize(), controller.updateworkexperience);

router.route('/getprofessionalprofile')
  .post(authorize(), controller.getprofessionalprofile);

router.route('/getthirdpartyprofile')
  .post(authorize(), controller.getthirdpartyprofile);

router.route('/profileoverview')
  .post(authorize(), controller.profileoverview);

router.route('/profileaboutme')
  .post(authorize(), controller.profileaboutme);

router.route('/profilecontact')
  .post(authorize(), controller.profilecontact);

router.route('/profileinfo')
  .post(authorize(), controller.profileinfo);

router.route('/updateprofessionalskills')
  .post(authorize(), controller.updateprofessionalskills);


router.route('/updaterelationship')
  .post(authorize(), controller.updaterelationship);

router.route('/updaterelationshipstatus')
  .post(authorize(), controller.updaterelationshipstatus);



// router
//   .route('/profile')

//   .get(authorize(), controller.loggedIn);


// router
//   .route('/:userId')

//   .get(authorize(), controller.get)

//   .put(authorize(), validate(replaceUser), controller.replace)

//   .patch(authorize(), validate(updateUser), controller.update)

//   .delete(authorize(), controller.remove);


module.exports = router;
