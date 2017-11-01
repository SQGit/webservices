const express = require('express');
// const validate = require('express-validation');
const controller = require('../../controllers/user.controller');
const { authorize } = require('../../middlewares/auth');
// const {
//   createUser,
// } = require('../../validations/user.validation');
const { personalimage, personalcover, personalself } = require('../../middlewares/media');

const router = express.Router();


// router.param('userId', controller.load);


router
  .route('/')

  // .get(authorize(), validate(listUsers), controller.list)

  .post(authorize(), controller.create);


router.route('/updatepersonalprofile')
  .post(authorize(), controller.updatepersonalprofile);

router.route('/getpersonalprofile')
  .post(authorize(), controller.getpersonalprofile);

router.route('/personalimage')
  .post(authorize(), personalimage, controller.personalimage);

router.route('/personalcover')
  .post(authorize(), personalcover, controller.personalcover);

router.route('/personalself')
  .post(authorize(), personalself, controller.personalself);

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
