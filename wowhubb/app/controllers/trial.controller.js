const httpStatus = require('http-status');
const moment = require('moment');
const request = require('request');


/* const imagemin = require('imagemin');
// const imageminJpegtran = require('imagemin-jpegtran');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant'); */

// const ffmpeg = require('fluent-ffmpeg');

exports.time = async (req, res, next) => {
  // const { time } = req.body;

  const time = moment().format('YYYY/MM/DD H:mm:ss');

  return res.json({
    success: true,
    code: httpStatus.OK,
    message: time,
  });
};

// exports.compress = async (req, res, next) => {
//   let video = '';

//   if (req.files !== undefined) {
//     const files = req.files;
//     const fields = Object.keys(files);
//     video = fields.includes('0') ?
//       req.files[0].filename : 'null';
//     // console.log(req.files[0])
//     await imagemin([req.files[0].path], './public/compress', {
//       plugins: [
//         imageminJpegRecompress({ quality: '65-80' }),
//         imageminPngquant({ quality: '65-80' }),
//       ],
//     })
//   }

//   return res.json({
//     success: true,
//     message: video,
//   });
// };


exports.compress = async (req, res, next) => {
  let videos = '';

  if (req.files !== undefined) {
    const files = req.files;
    const fields = Object.keys(files);
    videos = fields.includes('0') ?
      req.files[0].filename : 'null';
    // console.log(req.files[0])

    // const command = ffmpeg()
    //   .videoBitrate(100)

    /* await ffmpeg(req.files[0].path)
      // .videoBitrate('1024k')
    // .videoCodec('libx264')
    // .audioCodec('libmp3lame')
      .on('error', (err) => {
        console.log(`An error occurred: ${err.message}`);
      })
      .on('end', () => {
        console.log('Processing finished !');
      })
      .save(req.files[0].path); */
  }


  return res.json({
    success: true,
    message: videos,
  });
};


exports.sources = async (req, res, next) => {
  const oauth = {
    consumer_key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
    consumer_secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
  };

  const url = 'http://api.seatseller.travel/sources';

  request.get({ url, oauth }, (err, response, body) => {
    if (err) {
      console.log(`err ${err}`);
    } else if (response) {
      return res.json({
        response,
      });
    } else {
      console.log(`body ${body}`);
    }
  });
};


exports.trips = async (req, res, next) => {
  const oauth = {
    consumer_key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
    consumer_secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
  };

  // const {frompickervalue,topickervalue,dateofjourney} = req.body;

  const { from, to, doj } = req.body;
  // const from = 501;
  // const to = 2566;
  // const doj = '2018-04-21';

  // const url = 'http://api.seatseller.travel/availabletrips?source=3&destination=6&doj=2013-01-9 ';
  const url = `http://api.seatseller.travel/availabletrips?source=${from}&destination=${to}&doj=${doj}`;

  request.get({ url, oauth }, (err, response, body) => {
    if (err) {
      console.log(`err ${err}`);
    } else if (response) {
      // console.log(response);
      return res.json({
        response,
      });
    } else {
      console.log(`body ${body}`);
    }
  });
};

exports.tripdetails = async (req, res, next) => {
  const oauth = {
    consumer_key: 'mQxMddhQknIoLctWGcbqfpfwzNmsoS',
    consumer_secret: 'xWSPPj6jNuVJcd6NoruGzwFRznMZud',
  };

  const { tripid } = req.body;

  // const url = 'http://api.seatseller.travel/availabletrips?source=3&destination=6&doj=2013-01-9 ';
  const url = `http://api.seatseller.travel/tripdetails?id=${tripid}`;

  request.get({ url, oauth }, (err, response, body) => {
    if (err) {
      console.log(`err ${err}`);
    } else if (response) {
      // console.log(response);
      return res.json({
        response,
      });
    } else {
      console.log(`body ${body}`);
      // return alert('No network')
    }
  });
};

