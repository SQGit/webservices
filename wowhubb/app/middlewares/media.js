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

exports.eventmedia = eventmediaUpload.fields([
  { name: 'wowtagvideo1', maxCount: 1 },
  { name: 'wowtagvideo2', maxCount: 1 },
  { name: 'coverpage1', maxCount: 1 },
  { name: 'eventhighlights1', maxCount: 1 },
  { name: 'eventhighlights2', maxCount: 1 },
  { name: 'eventhighlightsvideo1', maxCount: 1 },
  { name: 'eventhighlightsvideo2', maxCount: 1 },
  { name: 'eventspeaker1', maxCount: 1 },
  { name: 'eventspeaker', maxCount: 1 },
]);


const profilemediaStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/personalmedia');
  },
  filename: generateFilename,
});


// Profile

const profileMediaUpload = multer({
  storage: profilemediaStorage,
});

exports.personalimage = profileMediaUpload.array('personalimage', 1);
exports.personalcover = profileMediaUpload.array('personalcover', 1);
exports.personalself = profileMediaUpload.array('personalself', 1);

