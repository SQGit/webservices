const httpStatus = require('http-status');
const User = require('../sqlmodels/user.model');
const Booking = require('../sqlmodels/book.model');
const Inventory = require('../sqlmodels/inventory.model');
const Wallet = require('../sqlmodels/wallet.model');
const WalletPayment = require('../sqlmodels/walletpayment.model');
const WalletTransaction = require('../sqlmodels/wallettransaction.model');

const WalletOrderPayment = require('../sqlmodels/walletorderpayment.model');

const TicketPayment = require('../sqlmodels/ticketpayment.model');

const TicketOrderPayment = require('../sqlmodels/ticketorderpayment.model');


const AgentCommission = require('../sqlmodels/agentcommissioncontrol.model');
const Help = require('../sqlmodels/help.model');

const CouponUsage = require('../sqlmodels/couponusage.model')

const { Op } = require('sequelize')

/* aws */
const AWS = require('aws-sdk');


AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIAJFLCHCLEXYH64JTQ',
  secretAccessKey: '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'
})


/* aws */



/* mailgun */

const Mailgun = require('mailgun-js')
// const api_key = 'key-ecc45276bd38cc217f29d13bbe3e03d3' //sandbox
// const domain = 'sandbox6ef22c73d1ab42fcb4013c4d5147d3ab.mailgun.org' //sandbox

const api_key = 'key-ecc45276bd38cc217f29d13bbe3e03d3';  //live
const domain = 'support.purebus.com';

/* mailgun */


const moment = require('moment');
const request = require('request');

const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const fetch = require('node-fetch');

/* Razorpay */

const razorpay = require('razorpay');


const Razorpay = new razorpay({
  //demo
  // key_id: 'rzp_test_vaFxzdumGGoXXp',
  // key_secret: 'L9IlAbDaWXxD7sA99ibrf1pp',
  //live
  key_id: 'rzp_live_iOsTXrf2X1eGQf',
  key_secret: 'qr9c08f5Wkkk7m15duEkJxyo'
})

/* Razorpay */

function hash_function_sha1(base_string, key) {
  return crypto.createHmac('sha1', key).update(base_string).digest('base64');
}




/* exports.updatebooking = async(req, res, next) => {
  try {
    const { bookingid , tin } = req.body;

    const url = `http://api.seatseller.travel/ticket?tin=${tin}`


    const oauth = OAuth({
        consumer: {
        key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
        secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
        },
        signature_method: 'HMAC-SHA1',
        hash_function: hash_function_sha1,
    });


    const request_data = {
        url,
        method: 'GET',
    };

    const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...oauth.toHeader(oauth.authorize(request_data)),
        },
        // body: JSON.stringify(),
    });

    const status = await response.status;

    const responseJson = await response.json();

    if (status === 500) {
      return res.json({
          sucess: false,
          code: httpStatus.INTERNAL_SERVER_ERROR,
          response: responseJson,
        });
    } else if (status === 200) {

      const { bookingFee,busType,cancellationCharges,cancellationPolicy,dateOfCancellation,dateOfIssue,destinationCity,destinationCityId,doj,dropLocation,dropLocationId,dropTime,hasRTCBreakup,hasSpecialTemplate,inventoryId,inventoryItems,MTicketEnabled,partialCancellationAllowed,pickUpContactNo,pickUpLocationAddress,pickupLocation,pickupLocationId,pickupLocationLandmark,pickupTime,pnr,primeDepartureTime,refundAmount,serviceCharge,sourceCity,sourceCityId,status,tin,travels } = responseJson;

      let inventoryArray = [];

    if(!inventoryItems.length){
      let fare = inventoryItems.fare;
      let ladiesSeat = inventoryItems.ladiesSeat;
      let malesSeat = inventoryItems.malesSeat;
      let operatorServiceCharge = inventoryItems.operatorServiceCharge;
      let seatName = inventoryItems.seatName;
      let serviceTax = inventoryItems.serviceTax;
      let age = inventoryItems.passenger.age;
      let email = inventoryItems.passenger.email;
      let gender = inventoryItems.passenger.gender;
      let idType = inventoryItems.passenger.idType;
      let mobile = inventoryItems.passenger.mobile;
      let name = inventoryItems.passenger.name;
      let primary = inventoryItems.passenger.primary;
      let title = inventoryItems.passenger.title;

      inventoryArray.push({
        fare,
        ladiesSeat,
        malesSeat,
        operatorServiceCharge,
        seatName,
        serviceTax,
        age,
        email,
        gender,
        idType,
        mobile,
        name,
        primary,
        title,
        bookingid
      })
    }else{

      for(let i=0;i<inventoryItems.length;i+=1){
        let fare = inventoryItems[i].fare;
        let ladiesSeat = inventoryItems[i].ladiesSeat;
        let malesSeat = inventoryItems[i].malesSeat;
        let operatorServiceCharge = inventoryItems[i].operatorServiceCharge;
        let seatName = inventoryItems[i].seatName;
        let serviceTax = inventoryItems[i].serviceTax;
        let age = inventoryItems[i].passenger.age;
        let email = inventoryItems[i].passenger.email;
        let gender = inventoryItems[i].passenger.gender;
        let idType = inventoryItems[i].passenger.idType;
        let mobile = inventoryItems[i].passenger.mobile;
        let name = inventoryItems[i].passenger.name;
        let primary = inventoryItems[i].passenger.primary;
        let title = inventoryItems[i].passenger.title;

        inventoryArray.push({
          fare,
          ladiesSeat,
          malesSeat,
          operatorServiceCharge,
          seatName,
          serviceTax,
          age,
          email,
          gender,
          idType,
          mobile,
          name,
          primary,
          title,
          bookingid
        })
      }

    }

      await Booking.update({
        bookingFee,busType,cancellationCharges,cancellationPolicy,dateOfCancellation,dateOfIssue,destinationCity,destinationCityId,doj,dropLocation,dropLocationId,dropTime,hasRTCBreakup,hasSpecialTemplate,inventoryId,inventoryItems,MTicketEnabled,partialCancellationAllowed,pickUpContactNo,pickUpLocationAddress,pickupLocation,pickupLocationId,pickupLocationLandmark,pickupTime,pnr,primeDepartureTime,refundAmount,serviceCharge,sourceCity,sourceCityId,status,tin,travels
      },{
        where: {bookingid: bookingid}
      })

      await Inventory.bulkCreate(inventoryArray)


      return res.json({
        success: true,
        response: responseJson
      })

    } else {
      console.log(status);
    }

  } catch (error) {
    return next(error);
  }
} */



exports.blockticket = async (req, res, next) => {
    try {
  
      const { availableTripId, boardingPointId, source, destination, inventoryItems } = req.body;
  
      const blockedAt = moment().format('YYYY/MM/DD H:mm:ss');

  
      const params = {
        availableTripId,
        boardingPointId,
        source,
        destination,
        inventoryItems
      };

     
      const url = 'http://api.seatseller.travel/blockTicket';
  
      const oauth = OAuth({
        consumer: {
          key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
          secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
        },
        signature_method: 'HMAC-SHA1',
        hash_function: hash_function_sha1,
      });
  
      const request_data = {
        url,
        method: 'POST',
      };
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/plain',
          ...oauth.toHeader(oauth.authorize(request_data)),
        },
        body: JSON.stringify(params),
      });
  
      
  
      const status = await response.status;
  
      const responseText = await response.text();
  
  
      if (status === 500) {
        return res.json({
            success: false,
            code: httpStatus.INTERNAL_SERVER_ERROR,
            response: responseText,
          });
      } else if (status === 200) {
        return res.json({
            success: true,
            code: httpStatus.OK,
            response: responseText,
          });
      } else {
        console.log(status);
      }

 
    } catch (error) {
      return next(error);
    }
  };


exports.confirmticket = async(req, res, next) => {
    try {
 
       const userid = req.user.userid;
       const toemail = req.user.email;
       const tonumber = req.user.phone;


       const mg = new Mailgun({apiKey:api_key,domain: domain});
       const fromemail = 'ticket@support.purebus.com'
 
       const { blockkey , route, date, travels, boardingpointlocation, boardingtime, noofpassengers,amount,razoramount, discountvalueinrupees, couponid } = req.body;

       const totalfare = parseInt(amount,10) + parseInt(razoramount,10)
 
         const oauth = OAuth({
             consumer: {
             key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
             secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
             },
             signature_method: 'HMAC-SHA1',
             hash_function: hash_function_sha1,
         });
 
 
         const confirmRequestData = {
           url: `http://api.seatseller.travel/bookticket?blockKey=${blockkey}`,
             method: 'POST',
         };
 
         const confirmResponse = await fetch(`http://api.seatseller.travel/bookticket?blockKey=${blockkey}`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               Accept: 'text/plain',
               ...oauth.toHeader(oauth.authorize(confirmRequestData)),
             }
         });
 
         const confirmStatus = await confirmResponse.status;
   
         const confirmResponseText = await confirmResponse.text();
     
         
         if (confirmStatus === 500) {
           return res.json({
               sucess: false,
               code: httpStatus.INTERNAL_SERVER_ERROR,
               response: confirmResponseText,
             });
         } else if (confirmStatus === 200) {
 
           let tin = confirmResponseText
           let status = 'BOOKED';
 
           Booking.sync().then(() => {
             return Booking.create({
                 blockkey,tin,status,userid
             }).then(async (createdBooking) => {
                 let bookingid = createdBooking.bookingid;
                   
         
           const url = `http://api.seatseller.travel/ticket?tin=${tin}`
 
           const request_data = {
               url,
               method: 'GET',
           };
         
           const response = await fetch(url, {
               method: 'GET',
               headers: {
                 'Content-Type': 'application/json',
                 Accept: 'application/json',
                 ...oauth.toHeader(oauth.authorize(request_data)),
               }
           });
           
           const status = await response.status;
       
           const responseJson = await response.json();
 
 
           if (status === 500) {
             return res.json({
                 sucess: false,
                 code: httpStatus.INTERNAL_SERVER_ERROR,
                 response: responseJson,
               });
           } else if (status === 200) {
       
             const { bookingFee,busType,cancellationCharges,cancellationPolicy,dateOfCancellation,dateOfIssue,destinationCity,destinationCityId,doj,dropLocation,dropLocationId,dropTime,hasRTCBreakup,hasSpecialTemplate,inventoryId,inventoryItems,MTicketEnabled,partialCancellationAllowed,pickUpContactNo,pickUpLocationAddress,pickupLocation,pickupLocationId,pickupLocationLandmark,pickupTime,pnr,primeDepartureTime,refundAmount,serviceCharge,sourceCity,sourceCityId,status,tin,travels } = responseJson;

             let purebusfare = parseInt(amount,10) + parseInt(razoramount,10)
             var razorpayamountused = razoramount;
             var walletamountused = amount;

             var coupondiscountinrupees = discountvalueinrupees;

            
       
             let inventoryArray = [];
             
             let seats = []
             let primarypassenger = ""
       
           if(!inventoryItems.length){
             let fare = inventoryItems.fare;
             let ladiesSeat = inventoryItems.ladiesSeat;
             let malesSeat = inventoryItems.malesSeat;
             let operatorServiceCharge = inventoryItems.operatorServiceCharge;
             let seatName = inventoryItems.seatName;
             let serviceTax = inventoryItems.serviceTax;
             let age = inventoryItems.passenger.age;
             let email = inventoryItems.passenger.email;
             let gender = inventoryItems.passenger.gender;
             let idType = inventoryItems.passenger.idType;
             let mobile = inventoryItems.passenger.mobile;
             let name = inventoryItems.passenger.name;
             let primary = inventoryItems.passenger.primary;
             let title = inventoryItems.passenger.title;
       
             inventoryArray.push({
               fare,
               ladiesSeat,
               malesSeat,
               operatorServiceCharge,
               seatName,
               serviceTax,
               age,
               email,
               gender,
               idType,
               mobile,
               name,
               primary,
               title,
               bookingid
             })

             seats.push(seatName)
             primarypassenger += name
           }else{
       
             for(let i=0;i<inventoryItems.length;i+=1){
               let fare = inventoryItems[i].fare;
               let ladiesSeat = inventoryItems[i].ladiesSeat;
               let malesSeat = inventoryItems[i].malesSeat;
               let operatorServiceCharge = inventoryItems[i].operatorServiceCharge;
               let seatName = inventoryItems[i].seatName;
               let serviceTax = inventoryItems[i].serviceTax;
               let age = inventoryItems[i].passenger.age;
               let email = inventoryItems[i].passenger.email;
               let gender = inventoryItems[i].passenger.gender;
               let idType = inventoryItems[i].passenger.idType;
               let mobile = inventoryItems[i].passenger.mobile;
               let name = inventoryItems[i].passenger.name;
               let primary = inventoryItems[i].passenger.primary;
               let title = inventoryItems[i].passenger.title;
       
               inventoryArray.push({
                 fare,
                 ladiesSeat,
                 malesSeat,
                 operatorServiceCharge,
                 seatName,
                 serviceTax,
                 age,
                 email,
                 gender,
                 idType,
                 mobile,
                 name,
                 primary,
                 title,
                 bookingid
               })

               seats.push(seatName)
               if(primary=="true"){
                primarypassenger += name
               }
             }
       
           }
       
             await Booking.update({
               bookingFee,busType,cancellationCharges,cancellationPolicy,dateOfCancellation,dateOfIssue,destinationCity,destinationCityId,doj,dropLocation,dropLocationId,dropTime,hasRTCBreakup,hasSpecialTemplate,inventoryId,inventoryItems,MTicketEnabled,partialCancellationAllowed,pickUpContactNo,pickUpLocationAddress,pickupLocation,pickupLocationId,pickupLocationLandmark,pickupTime,pnr,primeDepartureTime,refundAmount,serviceCharge,sourceCity,sourceCityId,status,tin,travels,purebusfare,walletamountused,razorpayamountused,coupondiscountinrupees
             },{
               where: {bookingid: bookingid}
             })
       
             await Inventory.bulkCreate(inventoryArray)

             if(discountvalueinrupees > 0){

              await CouponUsage.sync().then(() => {
                return CouponUsage.create({
                  discountvalueinrupees,couponid,userid
                })
              })

             }

            
            const seatnames = seats.join(",")


             const data = {
              from: fromemail,
              to: toemail,
              subject: 'Purebus Ticket Confirmation',
              html: `<html lang="en">

              <head>
                  <meta http-equiv=Content-Type content="text/html; charset=UTF-8">
                  <style type="text/css" >
                      body,
                      td,
                      div,
                      p,
                      a,
                      input {
                          font-family: arial, sans-serif;
                      }
                  </style>
                  <meta http-equiv="X-UA-Compatible" content="IE=edge">
                  <title>PureBus Ticket - ${pnr}</title>
                  <style type="text/css">
                      body,
                      td {
                          font-size: 13px
                      }
              
                      a:link,
                      a:active {
                          color: #1155CC;
                          text-decoration: none
                      }
              
                      a:hover {
                          text-decoration: underline;
                          cursor: pointer
                      }
              
                      a:visited {
                          color: #6611CC
                      }
              
                      img {
                          border: 0px
                      }
              
                      pre {
                          white-space: pre;
                          white-space: -moz-pre-wrap;
                          white-space: -o-pre-wrap;
                          white-space: pre-wrap;
                          word-wrap: break-word;
                          max-width: 800px;
                          overflow: auto;
                      }
              
                      .logo {
                          left: -7px;
                          position: relative;
                      }
                  </style>
              
                  <body>
                      <div class="bodycontainer">
                         
                          <hr>
                          <div class="maincontent">
                              <table width=100% cellpadding=0 cellspacing=0 border=0>
                                  <tr>
                                      <td>
                                          <font size=+1><b>PureBus Ticket - ${pnr}</b></font><br></td>
                                  </tr>
                              </table>
                              <hr>
                              <table width=100% cellpadding=0 cellspacing=0 border=0 class="message">
                                  <tr>
                                      <td colspan=2 style="padding-bottom: 4px;">
                                      <tr>
                                      <td colspan=2>
                                      <table width=100% cellpadding=12 cellspacing=0 border=0>
                                          <tr>
                                              <td>
                                                  <div style="overflow: hidden;">
                                                      <font size=-1>
                                                          <div>
                                                              <table>
                                                                  <tr>
                                                                      <td>
                                                                          <table style="overflow:visible;text-align:left;font-variant:normal;font-weight:normal;font-size:14px;background-color:fff;line-height:20px;font-family:Asap,sans-serif;color:#333;padding:0;font-style:normal;width:900px">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td style="margin:0 20px 0 0;padding:0 15px 0 0;">
                                                                                          <div style="display:inline-block;border-right:1px solid #ccc;margin:0 0 8px 0">
                                                                                              <img style="padding:10px" src="http://purebus.com/images/purebus-logo.png" alt="PureBusLogo">
                                                                                          </div>
                                                                                      </td>
                                                                                      <td style="font-size: 30px; text-align: right">eTICKET</td>
                                                                                      <td colspan="3">
                                                                                      </td>
                                                                                      
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td colspan="6">
                                                                                          <hr style="border-top:0px solid #2bc999">
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr style="height:60px;overflow:hidden;margin-top:20px;padding:0 0 5px;color:#2bc999">
                                                                                      <td colspan="4" style="border-bottom:1px solid #2bc999;width:50%">
                                                                                          <div style="font-size:22px">
                                                                                              <span style="display:-moz-inline-stack;display:inline-block;zoom:1;margin:0 0 7px 0;font-weight:bold;padding:0">
              <span id="m_5490388388631861846LbSource">${sourceCity}</span>
                                                                                              </span>
                                                                                              <span style="display:-moz-inline-stack;display:inline-block;zoom:1;margin-right:10px;margin-left:10px">
              To
              </span>
                                                                                              <span style="display:-moz-inline-stack;display:inline-block;zoom:1;margin:0 0 7px 0;font-weight:bold;padding:0;margin-right:19px">
              <span id="m_5490388388631861846LbDestination">${destinationCity}</span>
                                                                                              </span>
                                                                                              <span>
              <span id="m_5490388388631861846LbJourneyDate">${date}</span>
                                                                                              </span>
                                                                                          </div>
                                                                                      </td>
                                                                                      <td colspan="2" style="border-bottom:1px solid #2bc999;width:15%;text-align:right">
                                                                                          <p style="font-size:12px;font-weight:bold;margin:0;padding:0">
                                                                                              Ticket no:
                                                                                              <span id="m_5490388388631861846LbTicketNumber">${pnr}</span>
                                                                                          </p>
                                                                                      </td>
                                                                                  </tr>
                                                                              </tbody>
                                                                          </table>
                                                                          <table style="overflow:visible;text-align:left;font-variant:normal;font-weight:normal;font-size:14px;background-color:fff;line-height:20px;font-family:Asap,sans-serif;color:#333;padding:0;font-style:normal;width:900px">
                                                                              <tbody>
                                                                                  <tr style="margin:0;padding:0">
                                                                                      <td style="width:25%;font-size:14px;margin:0;padding:10px;border-bottom:1px solid #e0e0e0;vertical-align:middle">
                                                                                          <p style="font-weight:bold;margin:0 0 5px;padding:0;text-transform:capitalize">
                                                                                              <span id="m_5490388388631861846LbTravels">${travels}</span>
                                                                                          </p>
                                                                                          <span style="font-size:12px;color:#999;margin:0;padding:0">
              <span id="m_5490388388631861846LbBusType">${busType}</span>
                                                                                          </span>
                                                                                      </td>
                                                                
                                                                                      <td style="width:25%;font-size:14px;margin:0;padding:10px;border-bottom:1px solid #e0e0e0;vertical-align:middle">
                                                                                          <p style="font-weight:700;margin:0 0 5px;padding:0">
                                                                                              <span id="m_5490388388631861846LbDepTime">${boardingtime}</span>
                                                                                          </p>
                                                                                          <span style="font-size:12px;color:#999;margin:0;padding:0">Departure time</span>
                                                                                      </td>
                                                                                      <td style="width:25%;font-size:14px;margin:0;padding:10px;border-bottom:1px solid #e0e0e0;vertical-align:middle">
                                                                                          <p style="font-weight:700;margin:0 0 5px;padding:0">
                                                                                              <span id="m_5490388388631861846LBSeatNos">${seatnames}</span>
                                                                                          </p>
                                                                                          <span style="font-size:12px;color:#999;margin:0;padding:0">Seat Number</span>
                                                                                      </td>
                                                                                      <td style="font-size:14px;margin:0;padding:10px;border-bottom:1px solid #e0e0e0;vertical-align:middle">
                                                                                          <p style="font-weight:700;margin:0 0 5px;padding:0">
                                                                                              <span id="m_5490388388631861846LbBoardingAddress">${boardingpointlocation}</span>
                                                                                          </p>
                                                                                          <span style="font-size:12px;color:#999;margin:0;padding:0">Boarding Point Location</span>
                                                                                      </td>
                                                                                  </tr>
                                                              
                                                                              </tbody>
                                                                          </table>
                                                                          <table style="overflow:visible;text-align:left;font-variant:normal;font-weight:normal;font-size:14px;background-color:fff;line-height:20px;font-family:Asap,sans-serif;color:#333;padding:0;font-style:normal;width:900px">
                                                                              <tbody>
                                                                              
                                                                                  
                                                                                  <td>
                                                                      
                                                                                      
                                                                                      <tr style="margin:0 0 20px;padding:0">
                                                                                          <hr>
                                                                                          <td colspan="6" style="margin:0;padding:5px;text-align:right">
                                                                                              <p style="font-size:18px;font-weight:700;margin:0;padding:0">
                                                                                                  <span style="font-size:12px;margin:0 10px 0 0;padding:0">Total Fare :</span>
                                                                                                  <span id="m_5490388388631861846LBFare">Rs.${totalfare}</span>
                                                                                              </p>
                                                                                          </td>
                                                                                      </tr>
                                                                                  </td>
                                                                              </tbody>
                                                                          </table>
                                                                      
                                                                      </td>
                                                                  </tr>
                                                              </table>
                                                          </div>
                                                      </font>
                                                  </div>
                                              </td>
                                          </tr>
                                      </table>
                                      </td>
                                      </tr>
                                      </td>
                                      </tr>
                                      </td>
                                  </tr>
                              </table>
                          </div>
                      </div>
                  </body>
                  
                  </head>
                  
              </html>`

            } 
           
            const newtravels = travels.replace (/&/g, "and");

 
            /* const message = `Purebus mTicket: Route: ${route}, PNR NO: ${pnr}, Travels: ${newtravels}, Boarding Time: ${boardingtime}, Boarding Point: ${boardingpointlocation}, No. of Passengers: ${noofpassengers}, Departure ${date}, Total Fare: Rs.${totalfare} Thank you - Purebus` */

            const message = `Purebus mTicket: Route: ${route}, PNR NO: ${pnr}, Passenger Name: ${primarypassenger}, Travels: ${newtravels}, Boarding Time: ${boardingtime}, Boarding Point: ${boardingpointlocation}, Seat No: ${seatnames} , Departure ${date}, Total Fare: Rs.${totalfare} Thank you - Purebus`
 
               mg.messages().send(data,(async(err,body) => {
                if(err){
                  console.log(err);
                }else{
          
                    const url = `http://indiabulksms.org/httpapi/v1/sendsms?api-token=o0173u.pw2*jsxezyn5q9)ac(mlh4tk_rbdf68vi&numbers=${tonumber}&route=2&message=${message}&sender=PURBUS`;
          
                    await request.get(url);
          
                    return res.json({
                      success: true
                    })
                }
              }))
 
 
   
       
           } else {
             console.log(status);
           }
 
 
             })
             .catch((err) => {
                 console.log(err)
               })
 
             })
     
         
 
         } else {
           console.log(confirmStatus);
         }
     
 
    } catch (error) {
      return next(error);
    }   
}


/*   exports.confirmticket = async(req, res, next) => {
   try {

      const userid = req.user.userid;
      const toemail = req.user.email;
      const tonumber = req.user.phone;

      const { blockkey , route, date, travels, boardingpointlocation, boardingtime, noofpassengers,totalfare } = req.body;

        const oauth = OAuth({
            consumer: {
            key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
            secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
            },
            signature_method: 'HMAC-SHA1',
            hash_function: hash_function_sha1,
        });


        const confirmRequestData = {
          url: `http://api.seatseller.travel/bookticket?blockKey=${blockkey}`,
            method: 'POST',
        };

        const confirmResponse = await fetch(`http://api.seatseller.travel/bookticket?blockKey=${blockkey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'text/plain',
              ...oauth.toHeader(oauth.authorize(confirmRequestData)),
            }
        });

        const confirmStatus = await confirmResponse.status;
  
        const confirmResponseText = await confirmResponse.text();
    
        
        if (confirmStatus === 500) {
          return res.json({
              sucess: false,
              code: httpStatus.INTERNAL_SERVER_ERROR,
              response: confirmResponseText,
            });
        } else if (confirmStatus === 200) {

          let tin = confirmResponseText
          let status = 'BOOKED';

          Booking.sync().then(() => {
            return Booking.create({
                blockkey,tin,status,userid
            }).then(async (createdBooking) => {
                let bookingid = createdBooking.bookingid;
                  
        
          const url = `http://api.seatseller.travel/ticket?tin=${tin}`

          const request_data = {
              url,
              method: 'GET',
          };
        
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...oauth.toHeader(oauth.authorize(request_data)),
              }
          });
          
          const status = await response.status;
      
          const responseJson = await response.json();


          if (status === 500) {
            return res.json({
                sucess: false,
                code: httpStatus.INTERNAL_SERVER_ERROR,
                response: responseJson,
              });
          } else if (status === 200) {
      
            const { bookingFee,busType,cancellationCharges,cancellationPolicy,dateOfCancellation,dateOfIssue,destinationCity,destinationCityId,doj,dropLocation,dropLocationId,dropTime,hasRTCBreakup,hasSpecialTemplate,inventoryId,inventoryItems,MTicketEnabled,partialCancellationAllowed,pickUpContactNo,pickUpLocationAddress,pickupLocation,pickupLocationId,pickupLocationLandmark,pickupTime,pnr,primeDepartureTime,refundAmount,serviceCharge,sourceCity,sourceCityId,status,tin,travels } = responseJson;
      
            let inventoryArray = [];
      
          if(!inventoryItems.length){
            let fare = inventoryItems.fare;
            let ladiesSeat = inventoryItems.ladiesSeat;
            let malesSeat = inventoryItems.malesSeat;
            let operatorServiceCharge = inventoryItems.operatorServiceCharge;
            let seatName = inventoryItems.seatName;
            let serviceTax = inventoryItems.serviceTax;
            let age = inventoryItems.passenger.age;
            let email = inventoryItems.passenger.email;
            let gender = inventoryItems.passenger.gender;
            let idType = inventoryItems.passenger.idType;
            let mobile = inventoryItems.passenger.mobile;
            let name = inventoryItems.passenger.name;
            let primary = inventoryItems.passenger.primary;
            let title = inventoryItems.passenger.title;
      
            inventoryArray.push({
              fare,
              ladiesSeat,
              malesSeat,
              operatorServiceCharge,
              seatName,
              serviceTax,
              age,
              email,
              gender,
              idType,
              mobile,
              name,
              primary,
              title,
              bookingid
            })
          }else{
      
            for(let i=0;i<inventoryItems.length;i+=1){
              let fare = inventoryItems[i].fare;
              let ladiesSeat = inventoryItems[i].ladiesSeat;
              let malesSeat = inventoryItems[i].malesSeat;
              let operatorServiceCharge = inventoryItems[i].operatorServiceCharge;
              let seatName = inventoryItems[i].seatName;
              let serviceTax = inventoryItems[i].serviceTax;
              let age = inventoryItems[i].passenger.age;
              let email = inventoryItems[i].passenger.email;
              let gender = inventoryItems[i].passenger.gender;
              let idType = inventoryItems[i].passenger.idType;
              let mobile = inventoryItems[i].passenger.mobile;
              let name = inventoryItems[i].passenger.name;
              let primary = inventoryItems[i].passenger.primary;
              let title = inventoryItems[i].passenger.title;
      
              inventoryArray.push({
                fare,
                ladiesSeat,
                malesSeat,
                operatorServiceCharge,
                seatName,
                serviceTax,
                age,
                email,
                gender,
                idType,
                mobile,
                name,
                primary,
                title,
                bookingid
              })
            }
      
          }
      
            await Booking.update({
              bookingFee,busType,cancellationCharges,cancellationPolicy,dateOfCancellation,dateOfIssue,destinationCity,destinationCityId,doj,dropLocation,dropLocationId,dropTime,hasRTCBreakup,hasSpecialTemplate,inventoryId,inventoryItems,MTicketEnabled,partialCancellationAllowed,pickUpContactNo,pickUpLocationAddress,pickupLocation,pickupLocationId,pickupLocationLandmark,pickupTime,pnr,primeDepartureTime,refundAmount,serviceCharge,sourceCity,sourceCityId,status,tin,travels
            },{
              where: {bookingid: bookingid}
            })
      
            await Inventory.bulkCreate(inventoryArray)


            var params = {
              Destination: { 
                ToAddresses: [
                  toemail,
                ]
              },
              Message: { 
                Body: { 
                  Html: {
                   Charset: "UTF-8",
                   Data: `<html>
                   <body>
                   <p><span style="font-weight:bold;">${route}</span><br /> 
                   <span style="font-weight:bold;">${date}</span><br />
                   <span style="font-weight:bold;">${travels}</span><br /></p>
        
                   <p>
                   <span style="font-weight:bold;">PNR NO:</span>  ${pnr}<br />
                   <span style="font-weight:bold;">Boarding Time:</span>  ${boardingtime}<br />
                   <span style="font-weight:bold;">Boarding Point:</span>  ${boardingpointlocation}<br />
                   <span style="font-weight:bold;">No. of Passengers:</span>  ${noofpassengers}<br />
                   </p>
                   </body></html>`
                  }
                 },
                 Subject: {
                  Charset: 'UTF-8',
                  Data: 'Purebus Ticket Confirmation'
                 }
                },
              Source: 'connectarvindh@gmail.com',
            }; 
          

            const message = `PNR NO: ${pnr} Boarding Time: ${boardingtime} Boarding Point: ${boardingpointlocation} No. of Passengers: ${noofpassengers} ${route} ${date} ${travels} Total Fare: RS.${totalfare} Thank you - Purebus
              `

              var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

                sendPromise.then(async(data) => {


                    const url = `http://indiabulksms.org/httpapi/v1/sendsms?api-token=946rktp01wnoqxlazb.e!37hgmsyud*58i_fcjv2&numbers=${tonumber}&route=2&message=${message}&sender=PURBUS`;

                    await request.get(url);

                    return res.json({
                      success: true
                    })

                  }).catch(err => {
                    console.log(err)
                  });


  
      
          } else {
            console.log(status);
          }


            })
            .catch((err) => {
                console.log(err)
              })

            })
    
        

        } else {
          console.log(confirmStatus);
        }
    

   } catch (error) {
     return next(error);
   }   
  } */

  
  exports.cancellationrequest = async(req,res, next) => {
    try {

      const userid = req.user.userid;

      const { tin } = req.body;
  
      const oauth = OAuth({
        consumer: {
          key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
          secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
        },
        signature_method: 'HMAC-SHA1',
        hash_function: hash_function_sha1,
      });

      const cancellationRequestData = {
        url: `http://api.seatseller.travel/cancellationdata?tin=${tin}`,
        method: 'GET',
      };
  
      const cancellationResponse = await fetch(`http://api.seatseller.travel/cancellationdata?tin=${tin}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...oauth.toHeader(oauth.authorize(cancellationRequestData)),
        },
      });

  
      const cancellationStatus = await cancellationResponse.status;
  
      const cancellationResponseJson = await cancellationResponse.json();
  
  
      if (cancellationStatus === 500) {
        console.log('500');
      } else if (cancellationStatus === 200) {
        
        return res.json({
          cancellationResponseJson
        })
        
      } else {
        console.log(cancellationStatus);
      }
      
    } catch (error) {
      return next(error);
    }
  }


  exports.cancelticet = async (req, res, next) => {
    try {
      const userid = req.user.userid;

      const { tin, seatsToCancel } = req.body;
  
      const oauth = OAuth({
        consumer: {
          key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
          secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
        },
        signature_method: 'HMAC-SHA1',
        hash_function: hash_function_sha1,
      });
  
    
      
  
      /* Add cancel ticket */
  
      // const url2 = `http://api.seatseller.travel/cancelticket`;
  

      const params = {
        tin,
        seatsToCancel
      }

      const cancelRequestData = {
        url: 'http://api.seatseller.travel/cancelticket',
        method: 'POST',
      };
  
      const cancelResponse = await fetch('http://api.seatseller.travel/cancelticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...oauth.toHeader(oauth.authorize(cancelRequestData)),
        },
        body: JSON.stringify(params),
      });
  
      // console.log(response)
  
      const cancelStatus = await cancelResponse.status;
  
      const cancelResponseJson = await cancelResponse.json();

      // console.log(cancelResponseJson)
  
  
      if (cancelStatus === 500) {
        console.log('500');
      } else if (cancelStatus === 200) {
      

        const url = `http://api.seatseller.travel/ticket?tin=${tin}`

        const request_data = {
          url,
          method: 'GET',
        };

        const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              ...oauth.toHeader(oauth.authorize(request_data)),
            },
            // body: JSON.stringify(),
        });


      const status = await response.status;

      const responseJson = await response.json();

      if (status === 500) {
        return res.json({
            sucess: false,
            code: httpStatus.INTERNAL_SERVER_ERROR,
            response: responseJson,
          });
      } else if (status === 200) {

        const { bookingFee,busType,cancellationCharges,cancellationPolicy,dateOfCancellation,dateOfIssue,destinationCity,destinationCityId,doj,dropLocation,dropLocationId,dropTime,hasRTCBreakup,hasSpecialTemplate,inventoryId,inventoryItems,MTicketEnabled,partialCancellationAllowed,pickUpContactNo,pickUpLocationAddress,pickupLocation,pickupLocationId,pickupLocationLandmark,pickupTime,pnr,primeDepartureTime,refundAmount,serviceCharge,sourceCity,sourceCityId,status,tin,travels } = responseJson;

    

        await Booking.update({
          bookingFee,busType,cancellationCharges,cancellationPolicy,dateOfCancellation,dateOfIssue,destinationCity,destinationCityId,doj,dropLocation,dropLocationId,dropTime,hasRTCBreakup,hasSpecialTemplate,inventoryId,MTicketEnabled,partialCancellationAllowed,pickUpContactNo,pickUpLocationAddress,pickupLocation,pickupLocationId,pickupLocationLandmark,pickupTime,pnr,primeDepartureTime,refundAmount,serviceCharge,sourceCity,sourceCityId,status,tin,travels
        },{
          where: {tin: tin}
        })

        let newbooking = await Booking.findOne({where: {
          tin: tin
        }})

        let walletamountused = newbooking.walletamountused;
        walletamountused = parseInt(walletamountused,10)

        let description = 'refund'
        let transactiontype = 'refund'


        if(walletamountused > 0){

          await Wallet.findOne({where: {userid},}).then(async( wallet) => {
            let walletid = wallet.walletid;
            let currentbalance = parseInt(wallet.balance,10);

            console.log(currentbalance)
            let newbalance = currentbalance + walletamountused

            await WalletTransaction.sync().then(() => {
              return WalletTransaction.create({
                walletid,transactiontype,balancechange: walletamountused,description
              })
            })

            await Wallet.update({
              balance: newbalance,
            },{
              where: {walletid: walletid}
            });

            return res.json({
              success: true,
              response: responseJson
            })



          })

        }else{
          return res.json({
            success: true,
            response: responseJson
          })
        }


        
  
      } else {
        console.log(status);
      }








      


      } else {
        console.log(cancelStatus);
      }
  
      /* finish */
  

    } catch (error) {
      return next(error);
    }
  };
  
  




  exports.checkblockedticket = async(req,res,next) => {
    try {
        const userid = req.user.userid;

        // const { blockkey } = req.body;

        // const url = `http://api.seatseller.travel/checkBookedTicket?blockKey=${blockkey}`

        // const oauth = OAuth({
        //     consumer: {
        //     key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
        //     secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
        //     },
        //     signature_method: 'HMAC-SHA1',
        //     hash_function: hash_function_sha1,
        // });


        // const request_data = {
        //     url,
        //     method: 'GET',
        // };

        // const response = await fetch(url, {
        //     method: 'GET',
        //     headers: {
        //     'Content-Type': 'application/json',
        //     Accept: 'application/json',
        //     ...oauth.toHeader(oauth.authorize(request_data)),
        //     },
        //     // body: JSON.stringify(),
        // });

        // const status = await response.status;
  
        // const responseText = await response.text();
    
    
        // if (status === 500) {
        //   return res.json({
        //       sucess: false,
        //       code: httpStatus.INTERNAL_SERVER_ERROR,
        //       response: responseText,
        //     });
        // } else if (status === 200) {
        //   return res.json({
        //       sucess: true,
        //       code: httpStatus.OK,
        //       response: responseText,
        //     });
        // } else {
        //   console.log(status);
        // }


        const { bookingFee,busType,cancellationPolicy,dateOfIssue,destinationCity,destinationCityId,doj,dropLocation,dropLocationId,dropTime,hasRTCBreakup,hasSpecialTemplate,inventoryId,MTicketEnabled,partialCancellationAllowed,pickUpContactNo,pickUpLocationAddress,pickupLocation,pickupLocationId,pickupLocationLandmark,pickupTime,pnr,primeDepartureTime,serviceCharge,sourceCity,sourceCityId,status,tin,travels } = req.body;

        Booking.sync().then(() => {
            return Booking.create({
                bookingFee,busType,cancellationPolicy,dateOfIssue,destinationCity,destinationCityId,doj,dropLocation,dropLocationId,dropTime,hasRTCBreakup,hasSpecialTemplate,inventoryId,MTicketEnabled,partialCancellationAllowed,pickUpContactNo,pickUpLocationAddress,pickupLocation,pickupLocationId,pickupLocationLandmark,pickupTime,pnr,primeDepartureTime,serviceCharge,sourceCity,sourceCityId,status,tin,travels,userid
            }).then(async (createdBooking) => {
                let id = createdBooking.bookingid;
                
                let booking = await Booking.findById(id,{})
    
                return res.json({
                    success: true,
                    code: httpStatus.OK,
                    booking
                })
            })
            .catch((err) => {
              console.log(err)
            })


          });


    } catch (error) {
        return next(error);
    }
  }


  exports.parsepassenger = async(req, res, next) => {
    try {
      const { inventoryItems,bookingid } = req.body;

      let inventoryArray = [];

      if(!inventoryItems.length){
        let fare = inventoryItems.fare;
        let ladiesSeat = inventoryItems.ladiesSeat;
        let malesSeat = inventoryItems.malesSeat;
        let operatorServiceCharge = inventoryItems.operatorServiceCharge;
        let seatName = inventoryItems.seatName;
        let serviceTax = inventoryItems.serviceTax;
        let age = inventoryItems.passenger.age;
        let email = inventoryItems.passenger.email;
        let gender = inventoryItems.passenger.gender;
        let idType = inventoryItems.passenger.idType;
        let mobile = inventoryItems.passenger.mobile;
        let name = inventoryItems.passenger.name;
        let primary = inventoryItems.passenger.primary;
        let title = inventoryItems.passenger.title;

        inventoryArray.push({
          fare,
          ladiesSeat,
          malesSeat,
          operatorServiceCharge,
          seatName,
          serviceTax,
          age,
          email,
          gender,
          idType,
          mobile,
          name,
          primary,
          title,
          bookingid
        })
      }else{

        for(let i=0;i<inventoryItems.length;i+=1){
          let fare = inventoryItems[i].fare;
          let ladiesSeat = inventoryItems[i].ladiesSeat;
          let malesSeat = inventoryItems[i].malesSeat;
          let operatorServiceCharge = inventoryItems[i].operatorServiceCharge;
          let seatName = inventoryItems[i].seatName;
          let serviceTax = inventoryItems[i].serviceTax;
          let age = inventoryItems[i].passenger.age;
          let email = inventoryItems[i].passenger.email;
          let gender = inventoryItems[i].passenger.gender;
          let idType = inventoryItems[i].passenger.idType;
          let mobile = inventoryItems[i].passenger.mobile;
          let name = inventoryItems[i].passenger.name;
          let primary = inventoryItems[i].passenger.primary;
          let title = inventoryItems[i].passenger.title;

          inventoryArray.push({
            fare,
            ladiesSeat,
            malesSeat,
            operatorServiceCharge,
            seatName,
            serviceTax,
            age,
            email,
            gender,
            idType,
            mobile,
            name,
            primary,
            title,
            bookingid
          })
        }

      }


      await Inventory.bulkCreate(inventoryArray)
        .then(() => {
          return Inventory.findAll({where: {bookingid: bookingid}})
        })
        .then(inventory => {
          return res.json({
            success: true,
            inventory
          })
        })


      // return res.json({
      //   success: true,
      //   inventoryArray
      // })

    } catch (error) {
      return next(error);
    }
}

exports.mybookings = async(req, res, next) => {
  try {
    const userid = req.user.userid;

    // await Booking.findAll({include: [{
    //   model: User,
    //   attributes: ['userid','usertype','name','phone','email']
    // }]}).then(book => {
    //   return res.json({
    //     success: true,
    //     book
    //   })
    // })

    // await Booking.findAll({include: [{
    //   model: Inventory
    // }]}).then(book => {
    //   return res.json({
    //     success: true,
    //     book
    //   })
    // })

    await Booking.findAll({where: {userid: userid},include: [{
      model: Inventory
    }]}).then(book => {
      return res.json({
        success: true,
        book
      })
    })


  } catch (error) {
    return next(error);
  }

}

exports.mycompletedbookings = async(req, res, next) => {
  try {
    const userid = req.user.userid;
    let status = 'BOOKED'

    const currentdate = moment().format('YYYY-MM-DD');

    await Booking.findAll({where: {userid: userid,status,
    doj: {
      [Op.lte]: currentdate
    }
    }}).then(book => {
      return res.json({
        success: true,
        book
      })
    })


  } catch (error) {
    return next(error);
  }

}

exports.mycancelledbookings = async(req, res, next) => {
  try {
    const userid = req.user.userid;
    let status = 'CANCELLED'

    const currentdate = moment().format('YYYY-MM-DD');

    await Booking.findAll({where: {userid: userid,status
    },order: [
      ['bookingid','DESC']
    ]}).then(book => {
      return res.json({
        success: true,
        book
      })
    })


  } catch (error) {
    return next(error);
  }

}

exports.myupcomingbookings = async(req, res, next) => {
  try {
    const userid = req.user.userid;
    let status = 'BOOKED'

    const currentdate = moment().format('YYYY-MM-DD');

    await Booking.findAll({where: {userid: userid,status,
    doj: {
      [Op.gt]: currentdate
    }
    },
    include: [{model: Inventory}]
  }).then(book => {
      return res.json({
        success: true,
        book
      })
    })


  } catch (error) {
    return next(error);
  }

}


/* WALLET */

exports.initializewallet = async(req, res, next) => {
  try {
    const userid = req.user.userid;
    // const userid = 36;

    const balance = 0;

    Wallet.find({
      where: {userid: userid}
    }).then(wallet => {
      if(!wallet){
        Wallet.sync().then(() => {
          return Wallet.create({
              userid,balance
          }).then(async (createdWallet) => {
              let walletid = createdWallet.walletid;
                
              let wallet = await Wallet.findById(walletid,{});
    
              return res.json({
                success: true,
                code: httpStatus.OK,
                wallet
              })
          })
          .catch((err) => {
              console.log(err)
            })
    
          })
      }else{
        return res.json({
          success: false,
          code: httpStatus.NOT_ACCEPTABLE,
          message: 'Wallet is inintialized already'
        })
      }
    })

  } catch (error) {
    return next(error);
  }
}

exports.walletticketpayment = async(req, res, next) => {
  try {
    const userid = req.user.userid;
    const usertype = req.user.usertype;

    const { amount , description } = req.body;
    let transactiontype = 'Ticket Payment'

    let finalfare = 0;
    let totalcommission = 0;

    await AgentCommission.findOne({where: {agentcommissioncontrolid: 1}})
      .then(agentcommission => {
        commission = agentcommission.agentcommission

        if(commission === null){
          finalfare = amount
        }else if(usertype === 'normal'){
          finalfare = amount
        }else{
          finalfare = amount - (Math.round(amount * (commission / 100)))
          totalcommission = amount - finalfare
        }

      })
      .catch(error => {
        console.log(error);
      })
  

    await Wallet.findOne({where: {userid},
      }).then(async (wallet) => {

        if(wallet === null){
          return res.json({
            success: false
          })
        }else{
          
          let walletid = wallet.walletid;
          let currentbalance = wallet.balance;

          if(currentbalance < finalfare){
            return res.json({
              success: false,
              message: 'Add money in your wallet to continue booking'
            })

          }else{


            let balancechange = finalfare

            let newbalance = currentbalance - balancechange


            await WalletTransaction.sync().then(() => {
              return WalletTransaction.create({
                walletid,transactiontype,balancechange: finalfare,description,commission:totalcommission
              })
            })

            await Wallet.update({
              balance: newbalance,
            },{
              where: {walletid: walletid}
            });


            return res.json({
              success: true,
              message: 'Your booking is successfull'
            })


          }  


        }

      })
      .catch((err) => {
        console.log(err);
      })

    // return res.json({
    //   success: true,
    //   finalfare
    // })
    
  } catch (error) {
    return next(error);
  }
}

exports.checkwalletpayment = async(req, res, next) => {
  try {
    // const email = req.user.email;
    const { paymentid } = req.body;

    await WalletPayment.findOne({where: {id:paymentid}})
      .then(walletpayment => {


        if(walletpayment === null){
          return res.json({
            success: false
          })
        }else{
          return res.json({
            success: true,
            code: httpStatus.OK,
            walletpayment
          })
        }

        
      })

  } catch (error) {
    return next(error);
  }
}

exports.fetchwallet = async(req, res ,next ) => {
  try {
    const userid = req.user.userid;

    await Wallet.findOne({where: {userid},
      // include: [{model: User}]
    }).then(wallet => {
      return res.json({
        success: true,
        code: httpStatus.OK,
        wallet
      })
    })
    .catch((err) => {
      console.log(err);
    })

    // await User.findOne({where: {userid},include: [{model: Wallet}]}).then(user => {
    //   return res.json({
    //     success: true,
    //     code: httpStatus.OK,
    //     user
    //   })
    // })
    
  } catch (error) {
    return next(error);
  }
}

exports.fetchwallettransactions = async(req, res, next) => {
  try {
    const userid = req.user.userid;

    await Wallet.findOne({where: {userid},
      // include: [{model: User}]
    }).then( async (wallet) => {
      
      if(wallet === null){
        return res.json({
          success: false
        })
      }else{

        let walletid = wallet.walletid

        await WalletTransaction.findAll({where: {walletid},
        order: [
          ['wallettransactionid','DESC']
        ]
        })
          .then(wallettransaction => {

            return res.json({
              success: true,
              code: httpStatus.OK,
              wallettransaction
            })

          })

        
      }

    })
    .catch((err) => {
      console.log(err);
    })
    
  } catch (error) {
    return next(error);
  }
}




/* wallet end */


/* razorpay payment */

exports.handlewebhook = async(req, res, next) => {
  try {

    let body = req.body;
    let signature = req.headers["x-razorpay-signature"];
    let secret = 'purerazor'


    // console.log(body);
    // console.log(signature);
    // console.log(secret)

    // let validate = await razorpay.validateWebhookSignature(body,signature,secret)
    
    // console.log("validateWebhookSignature " +validate)

    

    let { 
      id,
      entity,
      amount,
      currency,
      status,
      order_id,
      invoice_id,
      international,
      method,
      amount_refunded,
      refund_status,
      captured,
      description,
      card_id,
      card,
      bank,
      wallet,
      vpa,
      email,
      contact,
      notes,
      fee,
      tax,
      error_code,
      error_description,
      created_at
    } = body.payload.payment.entity;

    let user = await User.findOne({where: {email},include: [{model: Wallet}]});

    if(user === null){
      return res.json({
        success: false
      })
    }

    let userid = user.userid;
    let walletid = user.wallet.walletid;
    let currentbalance = user.wallet.balance;

    let balancechange = amount/100;

    let newbalance = parseInt(currentbalance,10) + balancechange;

    // console.log("userid " + userid);

    let card_entity = '';
    let card_name = '';
    let card_last4 = '';
    let card_network = '';
    let card_type = '';
    let card_issuer = '';
    let card_international = '';
    let card_emi = '';


    if(method === "card"){
      card_entity = card.entity;
      card_name = card.name;
      card_last4 = card.last4;
      card_network = card.network;
      card_type = card.type;
      card_issuer = card.issuer;
      card_emi = card.emi;
    }

    let note = body.payload.payment.entity.notes.type
    let wallet1 = wallet;



    if(note === "Wallet"){

      await WalletPayment.sync().then(() => {
        return WalletPayment.create({
          id,
          entity,
          amount,
          currency,
          status,
          order_id,
          invoice_id,
          international,
          method,
          amount_refunded,
          refund_status,
          captured,
          description,
          card_id,
          card_entity,
          card_name,
          card_last4,
          card_network,
          card_type,
          card_issuer,
          card_international,
          card_emi,
          bank,
          wallet1,
          vpa,
          email,
          contact,
          note,
          fee,
          tax,
          error_code,
          error_description,
          created_at,
          walletid
        })
        .then(async (createdWalletPayment) => {
          let walletpaymentid = createdWalletPayment.walletpaymentid;

          let transactiontype = 'Added money';

          if(status === "authorized"){

            await WalletTransaction.sync().then(() => {
              return WalletTransaction.create({
                walletid,transactiontype,balancechange
              })
            })

            await Wallet.update({
              balance: newbalance,
            },{
              where: {walletid: walletid}
            });


          }

          

          let walletPayment = await WalletPayment.findById(walletpaymentid,{})
    
          return res.json({
              success: true,
              // code: httpStatus.OK,
              // walletPayment
          })


        })
      })
      .catch((err) => {
        console.log(err)
      })


    }else if(note === "Ticket"){

      await TicketPayment.sync().then(() => {
        return TicketPayment.create({
          id,
          entity,
          amount,
          currency,
          status,
          order_id,
          invoice_id,
          international,
          method,
          amount_refunded,
          refund_status,
          captured,
          description,
          card_id,
          card_entity,
          card_name,
          card_last4,
          card_network,
          card_type,
          card_issuer,
          card_international,
          card_emi,
          bank,
          wallet1,
          vpa,
          email,
          contact,
          note,
          fee,
          tax,
          error_code,
          error_description,
          created_at,
          userid
        })
        .then(async (createdTicketPayment) => {
          
          return res.json({
              success: true,
              // code: httpStatus.OK,
              // walletPayment
          })


        })
      })
      .catch((err) => {
        console.log(err)
      })


    }


    // return res.json({
    //   success: true,
    // })
    
  } catch (error) {
    return next(error)
  }
}


/* razorpay payment end*/


exports.checkticketpayment = async(req, res, next) => {
  try {

    const { paymentid } = req.body;

    await TicketPayment.findOne({where: {id:paymentid}})
      .then(ticketpayment => {

        if(ticketpayment === null){
          return res.json({
            success: false
          })
        }else{
          return res.json({
            success: true,
            code: httpStatus.OK,
            ticketpayment
          })
        }

      })
    
  } catch (error) {
    return next(error)
  }
}


exports.contactsupport = async(req, res, next) => {
  try {
    const userid = req.user.userid;
    const { comments } = req.body;
    
    Help.sync().then(() => {
      return Help.create({
        userid,comments
      }).then(async (createdHelp) => {
        let helpid = createdHelp.helpid
        
        let help = await Help.findById(helpid,{});

        return res.json({
          success: true,
          code: httpStatus.OK,
          help
        })
      })
    })


  } catch (error) {
    return next(error);
  }
}

exports.createorder = async(req, res, next) => {
  try {
    const { amount, notes} = req.body;
    
    Razorpay.orders.create({amount,currency: 'INR',receipt: 1,payment_capture: true,notes}).then((data) => {
      return res.json({
        success: true,
        data
      })
    }).catch((err) => {
      console.log(err)
      return res.json({
        success: false
      })
    })

  } catch (error) {
    return next(error);
  }
}

exports.createwalletorder = async(req, res, next) => {
  try {
    const userid = req.user.userid;
    const { amount, notes, email, phone} = req.body;

    let user = await User.findOne({where: {userid},include: [{model: Wallet}]});

    if(user === null){
      return res.json({
        success: false
      })
    }

    let walletid = user.wallet.walletid;


    Razorpay.orders.create({amount,currency: 'INR',receipt: 1,payment_capture: true,notes}).then(async(data) => {

      let orderid = data.id;
      let entity = data.entity;
      let amount = data.amount;
      let amountpaid = data.amount_paid;
      let amountdue = data.amount_due;
      let currency = data.currency;
      let receipt = data.receipt;
      let offerid = data.offer_id;
      let status = data.status;
      let attempts = data.attempts;
      let contact = phone
      let notes = data.notes
      let created_at = data.created_at;

      let notestype = notes.type

      
      await WalletOrderPayment.sync().then(() => {
        return WalletOrderPayment.create({
          orderid,
          entity,
          amount,
          amountpaid,
          amountdue,
          currency,
          receipt, 
          offerid, 
          status,
          attempts,
          email,
          contact, 
          notes: notestype,
          walletid,
          created_at
        })
        .then(() => {
          return res.json({
            success: true,
            orderid
          })
        })
      })
      .catch((err) => {
        console.log(err)
      })

      

    }).catch((err) => {
      console.log(err)
      return res.json({
        success: false
      })
    })
    

  } catch (error) {
    return next(error);
  }
}

exports.updatewalletorderpayment = async(req, res, next) => {
  try {
    const userid = req.user.userid;
    const { orderid, paymentid, amount } = req.body;

    let user = await User.findOne({where: {userid},include: [{model: Wallet}]});

    if(user === null){
      return res.json({
        success: false
      })
    }

    const walletid = user.wallet.walletid;
    const currentbalance = user.wallet.balance;
    
    await WalletOrderPayment.update({
      paymentid
    },{
      where: {orderid: orderid}
    })
    .then(async() => {
      let balancechange = amount/100;
      let newbalance = parseInt(currentbalance,10) + balancechange;

      let transactiontype = 'Added money';

      await WalletTransaction.sync().then(() => {
        return WalletTransaction.create({
          walletid,transactiontype,balancechange
        })
      })

      await Wallet.update({
        balance: newbalance,
      },{
        where: {walletid: walletid}
      });

      return res.json({
        success: true
      })


    })
    .catch((error) => {
      console.log(error)
    })

  } catch (error) {
    return next(error);
  }
}


exports.createticketorder = async(req, res, next) => {
  try {
    const userid = req.user.userid;
    const { amount, notes, email, phone} = req.body;

    Razorpay.orders.create({amount,currency: 'INR',receipt: 1,payment_capture: true,notes}).then(async(data) => {

      let orderid = data.id;
      let entity = data.entity;
      let amount = data.amount;
      let amountpaid = data.amount_paid;
      let amountdue = data.amount_due;
      let currency = data.currency;
      let receipt = data.receipt;
      let offerid = data.offer_id;
      let status = data.status;
      let attempts = data.attempts;
      let contact = phone
      let notes = data.notes
      let created_at = data.created_at;

      let notestype = notes.type

      
      await TicketOrderPayment.sync().then(() => {
        return TicketOrderPayment.create({
          orderid,
          entity,
          amount,
          amountpaid,
          amountdue,
          currency,
          receipt, 
          offerid, 
          status,
          attempts,
          email,
          contact, 
          notes: notestype,
          userid,
          created_at
        })
        .then(() => {
          return res.json({
            success: true,
            orderid
          })
        })
      })
      .catch((err) => {
        console.log(err)
      })

      

    }).catch((err) => {
      console.log(err)
      return res.json({
        success: false
      })
    })
    

  } catch (error) {
    return next(error);
  }
}

exports.updateticketorderpayment = async(req, res, next) => {
  try {
    // const userid = req.user.userid;
    const { orderid, paymentid } = req.body;
    
    await TicketOrderPayment.update({
      paymentid
    },{
      where: {orderid: orderid}
    })
    .then(async() => {

      return res.json({
        success: true
      })


    })
    .catch((error) => {
      console.log(error)
    })

  } catch (error) {
    return next(error);
  }
}



/* finish */


exports.testemail = async(req, res, next) => {
  try {
    
    const toemail = 'hari@sqindia.net'
    const tonumber = '8870463339'

    let mg = new Mailgun({apiKey:api_key,domain: domain});
    const fromemail = 'ticket@support.purebus.com'

    let data = {
      from: fromemail,
      to: toemail,
      subject: 'Test Mail',
      html: `<html>
      <body>
      <p><span style="font-weight:bold;">Chennai to Tirupur</span><br /> 
      <span style="font-weight:bold;">Wednesday, October 26, 2018</span><br />
      <span style="font-weight:bold;">Maaruthi Travels</span><br /></p>

      <p>
      <span style="font-weight:bold;">PNR NO:</span>  a4324aaff<br />
      <span style="font-weight:bold;">Boarding Time:</span>  8:45pm<br />
      <span style="font-weight:bold;">Boarding Point:</span>  Perungalathur<br />
      <span style="font-weight:bold;">No. of Passengers:</span>  1<br />
      <span style="font-weight:bold;">Total Fare:</span>  Rs.800<br />
      </p>
      </body></html>`
    }

    const travels = "Das & Das Travels"

    const newtravels = travels.replace (/&/g, "and");

    const message = `Chennai to Tirupur Wednesday, October 26 2018, Maaruthi Travels, PNR NO: a4324aaff, Boarding Time : 8:45pm, Boarding Point: Perungalathur No. of Passengers: 1 ${newtravels} Total Fare: Rs.800 Thank you - Purebus`

    mg.messages().send(data,(async(err,body) => {
      if(err){
        console.log(err);
      }else{

          const url = `http://indiabulksms.org/httpapi/v1/sendsms?api-token=o0173u.pw2*jsxezyn5q9)ac(mlh4tk_rbdf68vinumbers=${tonumber}&route=2&message=${message}&sender=PURBUS`;

          await request.get(url);

          return res.json({
            success: true
          })
      }
    }))


  } catch (error) {
    return next(error)
  }
}


/* exports.testemail = async(req, res, next) => {
  try {
    
    const toemail = 'hari@sqindia.net'
    const tonumber = '8870463339'

    let mg = new Mailgun({apiKey:api_key,domain: domain});
    const fromemail = 'ticket@support.purebus.com'

    let data = {
      from: fromemail,
      to: toemail,
      subject: 'Test Mail',
      html: `<html>
      <body>
      <p><span style="font-weight:bold;">Chennai to Tirupur</span><br /> 
      <span style="font-weight:bold;">Wednesday, October 26, 2018</span><br />
      <span style="font-weight:bold;">Maaruthi Travels</span><br /></p>

      <p>
      <span style="font-weight:bold;">PNR NO:</span>  a4324aaff<br />
      <span style="font-weight:bold;">Boarding Time:</span>  8:45pm<br />
      <span style="font-weight:bold;">Boarding Point:</span>  Perungalathur<br />
      <span style="font-weight:bold;">No. of Passengers:</span>  1<br />
      <span style="font-weight:bold;">Total Fare:</span>  Rs.800<br />
      </p>
      </body></html>`
    }

    const travels = "Das & Das Travels"

    const newtravels = travels.replace (/&/g, "and");

    const message = `Chennai to Tirupur
     Wednesday, October 26, 2018 
     Maaruthi Travels 
     PNR NO: a4324aaff
     Boarding Time: 8:45pm 
     Boarding Point: Perungalathur 
     No. of Passengers: 1 
     ${newtravels}
    Total Fare: Rs.800
    Thank you - Purebus
    `

    mg.messages().send(data,(async(err,body) => {
      if(err){
        console.log(err);
      }else{

          const url = `http://indiabulksms.org/httpapi/v1/sendsms?api-token=o0173u.pw2*jsxezyn5q9)ac(mlh4tk_rbdf68vinumbers=${tonumber}&route=2&message=${message}&sender=PURBUS`;

          await request.get(url);

          return res.json({
            success: true
          })
      }
    }))



    // var params = {
    //   Destination: { 
    //     ToAddresses: [
    //       'hari@sqindia.net',
    //     ]
    //   },
    //   Message: { 
    //     Body: { 
    //       Html: {
    //        Charset: "UTF-8",
    //        Data: `<html>
    //        <body>
    //        <p><span style="font-weight:bold;">Chennai to Tirupur</span><br /> 
    //        <span style="font-weight:bold;">Wednesday, October 26, 2018</span><br />
    //        <span style="font-weight:bold;">Maaruthi Travels</span><br /></p>

    //        <p>
    //        <span style="font-weight:bold;">PNR NO:</span>  a4324aaff<br />
    //        <span style="font-weight:bold;">Boarding Time:</span>  8:45pm<br />
    //        <span style="font-weight:bold;">Boarding Point:</span>  Perungalathur<br />
    //        <span style="font-weight:bold;">No. of Passengers:</span>  1<br />
    //        <span style="font-weight:bold;">Total Fare:</span>  Rs.800<br />
    //        </p>
    //        </body></html>`
    //       }
    //      },
    //      Subject: {
    //       Charset: 'UTF-8',
    //       Data: 'Purebus Ticket Confirmation'
    //      }
    //     },
    //   Source: 'hari@sqindia.net',
    // }; 

    // const message = `
    // Chennai to Tirupur
    // Wednesday, October 26, 2018
    // Maaruthi Travels
    // PNR NO: a4324aaff
    // Boarding Time: 8:45pm
    // Boarding Point: Perungalathur
    // No. of Passengers: 1
    // Total Fare: Rs.800
    // Thank you - Purebus
    // `

    // var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

    //   sendPromise.then(async(data) => {
       

    //       const url = `http://indiabulksms.org/httpapi/v1/sendsms?api-token=o0173u.pw2*jsxezyn5q9)ac(mlh4tk_rbdf68vi&numbers=${tonumber}&route=2&message=${message}&sender=PURBUS`;

    //       await request.get(url);

    //       return res.json({
    //         success: true
    //       })

    //     }).catch(err => {
    //       console.log(err)
    //     });

  } catch (error) {
    return next(error)
  }
} */



/* exports.testemail = async(req, res, next) => {
  try {
    
    const toemail = 'hari@sqindia.net'
    const tonumber = '8870463339'

    var params = {
      Destination: { 
        ToAddresses: [
          'hari@sqindia.net',
        ]
      },
      Message: { 
        Body: { 
          Html: {
           Charset: "UTF-8",
           Data: `<html>
           <body>
           <p><span style="font-weight:bold;">Chennai to Tirupur</span><br /> 
           <span style="font-weight:bold;">Wednesday, October 26, 2018</span><br />
           <span style="font-weight:bold;">Maaruthi Travels</span><br /></p>

           <p>
           <span style="font-weight:bold;">PNR NO:</span>  a4324aaff<br />
           <span style="font-weight:bold;">Boarding Time:</span>  8:45pm<br />
           <span style="font-weight:bold;">Boarding Point:</span>  Perungalathur<br />
           <span style="font-weight:bold;">No. of Passengers:</span>  1<br />
           <span style="font-weight:bold;">Total Fare:</span>  Rs.800<br />
           </p>
           </body></html>`
          }
         },
         Subject: {
          Charset: 'UTF-8',
          Data: 'Purebus Ticket Confirmation'
         }
        },
      Source: 'hari@sqindia.net',
    }; 

    const message = `
    Chennai to Tirupur
    Wednesday, October 26, 2018
    Maaruthi Travels
    PNR NO: a4324aaff
    Boarding Time: 8:45pm
    Boarding Point: Perungalathur
    No. of Passengers: 1
    Total Fare: Rs.800
    Thank you - Purebus
    `

    var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

      sendPromise.then(async(data) => {
       

          const url = `http://indiabulksms.org/httpapi/v1/sendsms?api-token=o0173u.pw2*jsxezyn5q9)ac(mlh4tk_rbdf68vi&numbers=${tonumber}&route=2&message=${message}&sender=PURBUS`;

          await request.get(url);

          return res.json({
            success: true
          })

        }).catch(err => {
          console.log(err)
        });

  } catch (error) {
    return next(error)
  }
} */

exports.testorder = async(req, res, next) => {
  try {
    
    Razorpay.orders.create({amount: 1000,currency: 'INR',receipt: 1,payment_capture: true,notes: {note1: 'ordertest'}}).then((data) => {
      console.log(data)
      return res.json({
        success: true
      })
    }).catch((err) => {
      console.log(err)
      return res.json({
        success: false
      })
    })

  } catch (error) {
    return next(error);
  }
}
  