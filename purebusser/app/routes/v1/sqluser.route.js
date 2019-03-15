const express = require('express');
const controller = require('../../controllers/sqluser.controller');
const { authorize } = require('../../middlewares/auth')

const router = express.Router();

router.route('/blockticket')
  .post(authorize(), controller.blockticket);

router.route('/checkblockedticket')
  .post(authorize(), controller.checkblockedticket);

router.route('/confirmticket')
  .post(authorize(), controller.confirmticket);

// router.route('/updatebooking')
//   .post(authorize(), controller.updatebooking);  

router.route('/cancelticet')
  .post(authorize(), controller.cancelticet);

router.route('/parsepassenger')
  .post(authorize(), controller.parsepassenger);

router.route('/mybookings')
  .post(authorize(), controller.mybookings);

router.route('/mycompletedbookings')
  .post(authorize(), controller.mycompletedbookings);

router.route('/mycancelledbookings')
  .post(authorize(), controller.mycancelledbookings);

router.route('/myupcomingbookings')
  .post(authorize(), controller.myupcomingbookings);

router.route('/initializewallet')
  .post(authorize(), controller.initializewallet);

router.route('/walletticketpayment')
  .post(authorize(), controller.walletticketpayment);

router.route('/checkwalletpayment')
  .post(authorize(), controller.checkwalletpayment);

router.route('/fetchwallet')
  .post(authorize(), controller.fetchwallet);

router.route('/fetchwallettransactions')
  .post(authorize(), controller.fetchwallettransactions);

router.route('/handlewebhook')
  .post(controller.handlewebhook);

router.route('/checkticketpayment')
  .post(authorize(), controller.checkticketpayment);

router.route('/contactsupport')
  .post(authorize(), controller.contactsupport);

router.route('/createorder')
  .post(authorize(), controller.createorder);

router.route('/createwalletorder')
  .post(authorize(), controller.createwalletorder);

router.route('/updatewalletorderpayment')
  .post(authorize(), controller.updatewalletorderpayment);

router.route('/createticketorder')
  .post(authorize(), controller.createticketorder);

router.route('/updateticketorderpayment')
  .post(authorize(), controller.updateticketorderpayment);

router.route('/testemail')
  .post(authorize(), controller.testemail);

router.route('/testorder')
  .post(authorize(), controller.testorder);

module.exports = router;