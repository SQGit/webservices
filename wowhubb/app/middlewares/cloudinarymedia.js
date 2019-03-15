const multer = require('multer');
const mime = require('mime');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'www-wowhubb-com',
  api_key: '152737288799346',
  api_secret: 'f7GkAABQhb405Uzr1VdsiR3wBLw',
});

function generateFilename(req, file, cb) {
  const datetimestamp = Date.now();
  cb(null, `${file.fieldname}-${datetimestamp}.${mime.extension(file.mimetype)}`);
}

/**
 * 'C:/NodeTrial/3028wowhubb/public/eventmedia';
 * ./public/eventmedia
 */

// Event

// const eventmediaStorage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, './public/eventmedia');
//   },
//   filename: generateFilename,
// });

// const eventmediaUpload = multer({
//   storage: eventmediaStorage,
// });


function generateEventParams(req, file, cb) {
  const type = mime.extension(file.mimetype);
  // console.log(type)
  if (type === 'mp4') {
    cb(null, params = {
      folder: 'eventmedia',
      format: 'mp4',
      resource_type: 'video',
    });
  } else if (type === 'jpg' || 'jpeg') {
    cb(null, params = {
      folder: 'eventmedia',
      format: 'jpg',
    });
  } else if (type === 'png') {
    cb(null, params = {
      folder: 'eventmedia',
      format: 'png',
    });
  }
}


// const eventmediaStorage = cloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'foo',
//     format: 'mp4',
//     resource_type: 'video'
//   },
//   folder: 'eventmedia',
//   allowedFormats: ['jpg', 'png', 'mp4'],
//   filename: generateFilename
// });

const eventmediaStorage = cloudinaryStorage({
  cloudinary,
  params: generateEventParams,
});

const eventmediaUpload = multer({ storage: eventmediaStorage });

exports.eventdetails = eventmediaUpload.array('coverpage', 1);

// app.post('/upload', parser.array('images', 10), function (req, res) {
//   console.log(req.files);
// });

// android eventdetails 

exports.androideventdetails = eventmediaUpload.fields([
  { name: 'coverpage', maxCount: 1 },
  { name: 'wowtagvideo', maxCount: 1 },
]);


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
]);

// Professional Event

exports.couponimage = eventmediaUpload.array('couponimage', 1);

// Sales Event

exports.saleseventofferings = eventmediaUpload.fields([
  { name: 'eventsalescoupon1', maxCount: 1 },
  { name: 'eventsalescoupon2', maxCount: 1 },
]);

/* thoughtsfile */

exports.thoughtsfile = eventmediaUpload.fields([
  { name: 'thoughtsimage', maxCount: 1 },
  { name: 'thoughtsvideo', maxCount: 1 },
]);


// // Profile

// const profilemediaStorage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, './public/personalmedia');
//   },
//   filename: generateFilename,
// });


// const profileMediaUpload = multer({
//   storage: profilemediaStorage,
// });

// exports.personalimage = profileMediaUpload.array('personalimage', 1);
// exports.personalcover = profileMediaUpload.array('personalcover', 1);
// exports.personalself = profileMediaUpload.array('personalself', 1);


// Profile

function generateProfileParams(req, file, cb) {
  const type = mime.extension(file.mimetype);
  // console.log(type)
  if (type === 'mp4') {
    cb(null, params = {
      folder: 'personalmedia',
      format: 'mp4',
      resource_type: 'video',
    });
  } else if (type === 'jpg' || 'jpeg') {
    cb(null, params = {
      folder: 'personalmedia',
      format: 'jpg',
    });
  } else if (type === 'png') {
    cb(null, params = {
      folder: 'personalmedia',
      format: 'png',
    });
  }
}



const profilemediaStorage = cloudinaryStorage({
  cloudinary,
  params: generateProfileParams,
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


// // Business

// const businessmediaStorage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, './public/businessmedia');
//   },
//   filename: generateFilename,
// });

// const businessMediaUpload = multer({
//   storage: businessmediaStorage,
// });

// exports.businessdetails = businessMediaUpload.fields([
//   { name: 'coverpage', maxCount: 1 },
//   { name: 'businesslogo', maxCount: 1 },
// ]);

// exports.businessgallery = businessMediaUpload.fields([
//   { name: 'productfile1', maxCount: 1 },
//   { name: 'productfile2', maxCount: 1 },
// ]);

// Business


function generateBusinessParams(req, file, cb) {
  const type = mime.extension(file.mimetype);
  // console.log(type)
  if (type === 'mp4') {
    cb(null, params = {
      folder: 'businessmedia',
      format: 'mp4',
      resource_type: 'video',
    });
  } else if (type === 'jpg' || 'jpeg') {
    cb(null, params = {
      folder: 'businessmedia',
      format: 'jpg',
    });
  } else if (type === 'png') {
    cb(null, params = {
      folder: 'businessmedia',
      format: 'png',
    });
  }
}

const businessmediaStorage = cloudinaryStorage({
  cloudinary,
  params: generateBusinessParams,
});

const businessMediaUpload = multer({
  storage: businessmediaStorage,
});

exports.businessdetails = businessMediaUpload.fields([
  { name: 'coverpage', maxCount: 1 },
  { name: 'businesslogo', maxCount: 1 },
]);

exports.businessgallery = businessMediaUpload.fields([
  { name: 'productfile1', maxCount: 1 },
  { name: 'productfile2', maxCount: 1 },
]);


// EventService


function generateEventServiceParams(req, file, cb) {
  const type = mime.extension(file.mimetype);
  // console.log(type)
  if (type === 'mp4') {
    cb(null, params = {
      folder: 'eventservicemedia',
      format: 'mp4',
      resource_type: 'video',
    });
  } else if (type === 'jpg' || 'jpeg') {
    cb(null, params = {
      folder: 'eventservicemedia',
      format: 'jpg',
    });
  } else if (type === 'png') {
    cb(null, params = {
      folder: 'eventservicemedia',
      format: 'png',
    });
  }
}


const eventservicemediaStorage = cloudinaryStorage({
  cloudinary,
  params: generateEventServiceParams,
});

const eventserviceMediaUpload = multer({
  storage: eventservicemediaStorage,
});

exports.eventservicedetails = eventserviceMediaUpload.fields([
  { name: 'coverpage', maxCount: 1 },
  { name: 'businesslogo', maxCount: 1 },
]);

exports.eventservicegallery = eventserviceMediaUpload.fields([
  { name: 'productfile1', maxCount: 5 },
  { name: 'productfile2', maxCount: 5 },
]);


// EventVenue


function generateEventVenueParams(req, file, cb) {
  const type = mime.extension(file.mimetype);
  // console.log(type)
  if (type === 'mp4') {
    cb(null, params = {
      folder: 'eventvenuemedia',
      format: 'mp4',
      resource_type: 'video',
    });
  } else if (type === 'jpg' || 'jpeg') {
    cb(null, params = {
      folder: 'eventvenuemedia',
      format: 'jpg',
    });
  } else if (type === 'png') {
    cb(null, params = {
      folder: 'eventvenuemedia',
      format: 'png',
    });
  }
}

const eventvenuemediaStorage = cloudinaryStorage({
  cloudinary,
  params: generateEventVenueParams,
});

const eventvenueMediaUpload = multer({
  storage: eventmediaStorage,
});

exports.eventvenuedetails = eventvenueMediaUpload.fields([
  { name: 'coverpage', maxCount: 1 },
  { name: 'businesslogo', maxCount: 1 },
]);

exports.eventvenuehallimage = eventvenueMediaUpload.array('eventvenuehallimage', 1);

