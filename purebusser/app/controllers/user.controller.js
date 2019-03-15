const httpStatus = require('http-status');
// const User = require('../models/user.model');
const Block = require('../models/blockkey.model');
const Booking = require('../models/booking.model');
// const { handler: errorHandler } = require('../middlewares/error');
const moment = require('moment');
const request = require('request');

const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const fetch = require('node-fetch');

function hash_function_sha1(base_string, key) {
  return crypto.createHmac('sha1', key).update(base_string).digest('base64');
}


exports.blockticket = async (req, res, next) => {
  try {
    const id = req.user._id;
    const usertype = req.user.usertype;

    const { availableTripId, boardingPointId, source, destination, inventoryItems } = req.body;

    const blockedAt = moment().format('YYYY/MM/DD H:mm:ss');

    /* const postData = {
        availableTripId,
        boardingPointId,
        source,
        destination,
        inventoryItems
    } */

    // console.log(JSON.stringify(postData))

    // let oauth = {
    //   consumer_key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
    //   consumer_secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
    // };

    // let params =
    //   { availableTripId: 2001600226750005800,
    //     boardingPointId: 41530,
    //     source: 501,
    //     destination: 2566,
    //     inventoryItems:
    //      [ { seatName: '3',
    //          fare: 300,
    //          ladiesSeat: 'false',
    //          passenger:
    //           [ { primary: 'true',
    //               name: 'Hari',
    //               mobile: 8870463339,
    //               title: 'Mr.',
    //               email: 'hari@sqindia.net',
    //               age: 23,
    //               gender: 'male' } ] } ] }


    const params = {
      availableTripId,
      boardingPointId,
      destination,
      inventoryItems,
      source,
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

    // console.log(response)

    const status = await response.status;

    const responseText = await response.text();


    if (status === 500) {
      console.log('500');
    } else if (status === 200) {
      new Block({
        userid: id,
        blockkey: responseText,
        blockedAt,
      }).save();
    } else {
      console.log(status);
    }


    return res.json({
      sucess: true,
      code: httpStatus.OK,
      response: responseText,
    });


    /* var options = {
  method: 'POST',
  url: 'http://api.seatseller.travel/blockTicket',
  oauth: oauth,
  // headers:
  // {
  //   //  'Cache-Control': 'no-cache',
  //   //  Authorization: 'OAuth oauth_consumer_key=\\"mQxMddhQknIoLctWGcbqfpfwzNmsoS\\",
  oauth_signature_method=\\"HMAC-SHA1\\",oauth_timestamp=\\"1523097037\\",oauth_nonce=\\"ND4pXxObuD6\\",
  oauth_version=\\"1.0\\",oauth_signature=\\"4phmMYnnpYmAG7KZu7dzWFHVnT4%3D\\"',
  //    'content-type': 'application/json'
  // },
  body: params,
  json: true
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  if(response){
    return res.json({
      response
    })
  }
  console.log(body);
});
 */


    // const url = 'http://api.seatseller.travel/blockTicket';

    /*  let options = {
        uri: 'http://api.seatseller.travel/blockTicket',
        method: 'POST',
        json: true,
        headers: {
          "Accept": "text/plain",
          "content-type": "application/json"
        },
        oauth: oauth,
        body: params

    } */

    // console.log(JSON.stringify(params))

    /* console.log(params)

    request(
        options
      ,
      (err, response, body) => {
        if (err) {
          console.log(`err ${err}`);
        } else if (response) {
          // const res = String(response);
          // console.log(JSON.stringify(response))
          // console.log(response)
          // new Block({
          //   userid: id,
          //   blockkey: res,
          //   createdAt,
          // }).save();
          return res.json({
              success: true,
              code: httpStatus.OK,
              response
            });
        } else {
          console.log(`body ${body}`);
        }
      }); */

    // await request.post({url, oauth, body: JSON.stringify(postData)}, (err, response, body) => {
    //   if (err) {
    //     console.log(`err ${err}`);
    //   } else if (response) {
    //     const res = String(response);
    //     console.log(JSON.stringify(response))
    //     // console.log(response)
    //     new Block({
    //       userid: id,
    //       blockkey: res,
    //       createdAt,
    //     }).save();
    //   } else {
    //     console.log(`body ${body}`);
    //   }
    // });

    // return res.json({
    //   success: true,
    //   code: httpStatus.OK
    // });
  } catch (error) {
    return next(error);
  }
};


exports.bookticket = async (req, res, next) => {
  try {
    const id = req.user._id;
    const usertype = req.user.usertype;

    const { blockkey, walletamount, paymentgatewayamount,
      couponamount, totalfare, couponcode,
    } = req.body;

    const bookedAt = moment().format('YYYY/MM/DD H:mm:ss');

    const url = `http://api.seatseller.travel/bookticket?blockKey=${blockkey}`;

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
    });

    // console.log(response)

    const status = await response.status;

    const responseText = await response.text();


    if (status === 500) {
      console.log('500');
    } else if (status === 200) {
      // new Block({
      //   userid: id,
      //   blockkey: responseText,
      //   blockedAt,
      // }).save();
      const tinkey = responseText;
    } else {
      console.log(status);
    }


    return res.json({
      sucess: true,
      code: httpStatus.OK,
      response: responseText,
    });
  } catch (error) {
    return next(error);
  }
};


exports.cancelticet = async (req, res, next) => {
  try {
    const id = req.user._id;
    const usertype = req.user.usertype;

    const { tinkey, seatsToCancel } = req.body;

    const oauth = OAuth({
      consumer: {
        key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
        secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
      },
      signature_method: 'HMAC-SHA1',
      hash_function: hash_function_sha1,
    });

    const url1 = `http://api.seatseller.travel/cancellationdata?tin=${tinkey}`;

  
    const request_data1 = {
      url1,
      method: 'GET',
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
        ...oauth.toHeader(oauth.authorize(request_data1)),
      },
    });

    // console.log(response)

    const status = await response.status;

    const responseJson = await response.json();


    if (status === 500) {
      console.log('500');
    } else if (status === 200) {
      // new Block({
      //   userid: id,
      //   blockkey: responseText,
      //   blockedAt,
      // }).save();
      console.log(responseJson)
    } else {
      console.log(status);
    }


    /* Add cancel ticket */

    const url2 = `http://api.seatseller.travel/cancelticket`;

    const request_data2 = {
      url2,
      method: 'POST',
    };

    const response2 = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
        ...oauth.toHeader(oauth.authorize(request_data2)),
      },
    });

    // console.log(response)

    const status2 = await response2.status;

    const responseJson2 = await response2.json();


    if (status2 === 500) {
      console.log('500');
    } else if (status2 === 200) {
      // new Block({
      //   userid: id,
      //   blockkey: responseText,
      //   blockedAt,
      // }).save();
    console.log(responseJson2)
    } else {
      console.log(status2);
    }

    /* finish */

    return res.json({
      sucess: true,
      code: httpStatus.OK,
      response: responseText,
    });
  } catch (error) {
    return next(error);
  }
};

