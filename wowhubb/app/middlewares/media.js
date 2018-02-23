const multer = require('multer');
const mime = require('mime');

function generateFilename(req, file, cb) {
  const datetimestamp = Date.now();
  cb(null, `${file.fieldname}-${datetimestamp}.${mime.extension(file.mimetype)}`);
}

/**
 * 'C:/NodeTrial/3028wowhubb/public/eventmedia';
 * ./public/eventmedia
 */

// Event

const eventmediaStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/eventmedia');
  },
  filename: generateFilename,
});

const eventmediaUpload = multer({
  storage: eventmediaStorage,
});

/* exports.createevent = eventmediaUpload.fields([
  { name: 'wowtagvideo', maxCount: 1 },
  { name: 'coverpage', maxCount: 1 },
  { name: 'eventhighlights1', maxCount: 1 },
  { name: 'eventhighlights2', maxCount: 1 },
  { name: 'eventhighlightsvideo1', maxCount: 1 },
  { name: 'eventhighlightsvideo2', maxCount: 1 },
  { name: 'eventspeaker1', maxCount: 1 },
  { name: 'eventspeaker', maxCount: 1 },
]); */

exports.eventdetails = eventmediaUpload.array('coverpage', 1);

exports.proeventdetails = eventmediaUpload.fields([
  { name: 'coverpage', maxCount: 1 },
  { name: 'organisationlogo', maxCount: 1 },
]);

exports.saleseventdetails = eventmediaUpload.fields([
  { name: 'coverpage', maxCount: 1 },
  { name: 'sponsorslogo', maxCount: 1 },
]);

exports.eventwowtag = eventmediaUpload.array('wowtagvideo', 1);

exports.eventhighlights = eventmediaUpload.fields([
  { name: 'eventhighlights1', maxCount: 1 },
  { name: 'eventhighlights2', maxCount: 1 },
  { name: 'eventhighlightsvideo1', maxCount: 1 },
  { name: 'eventhighlightsvideo2', maxCount: 1 },
]);

// Professional Event

exports.couponimage = eventmediaUpload.array('couponimage', 1);

// Sales Event

exports.saleseventofferings = eventmediaUpload.fields([
  { name: 'eventsalescoupon1', maxCount: 1 },
  { name: 'eventsalescoupon2', maxCount: 1 },
]);

// Profile

const profilemediaStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/personalmedia');
  },
  filename: generateFilename,
});


const profileMediaUpload = multer({
  storage: profilemediaStorage,
});

exports.personalimage = profileMediaUpload.array('personalimage', 1);
exports.personalcover = profileMediaUpload.array('personalcover', 1);
exports.personalself = profileMediaUpload.array('personalself', 1);


// Provider Logo

const providerLogoStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/providerlogo');
  },
  filename: generateFilename,
});

const providerLogoUpload = multer({
  storage: providerLogoStorage,
});

exports.providerlogo = providerLogoUpload.array('providerlogo', 1);


// Thoughts 

// const thoughtsmediaStorage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, './public/thoughtsmedia');
//   },
//   filename: generateFilename,
// });

// const thoughtsmediaUpload = multer({
//   storage: thoughtsmediaStorage,
// });

exports.thoughtsfile = eventmediaUpload.fields([
  { name: 'thoughtsimage', maxCount: 1 },
  { name: 'thoughtsvideo', maxCount: 1 },
]);


/* =========================================================== */


// Compress

const compressStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/compress');
  },
  filename: generateFilename,
});

const compressUpload = multer({
  storage: compressStorage,
});

exports.compress = compressUpload.array('video', 1);

/* Nearby Images for Android */


const nearbyEventStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/nearbyevent');
  },
  filename: generateFilename,
});

const nearbyEventUpload = multer({
  storage: nearbyEventStorage,
});

exports.nearbyevent = nearbyEventUpload.array('eventlogo', 1);
