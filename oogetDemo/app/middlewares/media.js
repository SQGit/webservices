const multer = require('multer');
const mime = require('mime');

function generateFilename(req, file, cb) {
  const datetimestamp = Date.now();
  cb(null, `${file.fieldname}-${datetimestamp}.${mime.getExtension(file.mimetype)}`);
}


/* Jobseeker */

const jobSeekerMediaStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/jobseekermedia');
  },
  filename: generateFilename,
});

const jobSeekerMediaUpload = multer({
  storage: jobSeekerMediaStorage,
});


exports.jobseekerimage = jobSeekerMediaUpload.array('jobseekerimage', 1);
exports.jobseekeridproof = jobSeekerMediaUpload.fields([
  { name: 'jobseekeridprooffront', maxCount: 1 },
  { name: 'jobseekeridproofback', maxCount: 1 },
]);


exports.jobseekerimageproof = jobSeekerMediaUpload.fields([
  { name: 'jobseekerimage', maxCount: 1 },
  { name: 'jobseekeridprooffront', maxCount: 1 },
  { name: 'jobseekeridproofback', maxCount: 1 },
]);

/* Company */

const companyMediaStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/companymedia');
  },
  filename: generateFilename,
});

const companyMediaUpload = multer({
  storage: companyMediaStorage,
});

exports.companylogo = companyMediaUpload.array('companylogo', 1);
exports.termsandconditions = companyMediaUpload.array('termsandconditions', 1);


/* Admin */

const adminMediaStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/adminmedia');
  },
  filename: generateFilename,
});

const adminMediaUpload = multer({
  storage: adminMediaStorage,
});

exports.adminimage = adminMediaUpload.array('adminimage', 1);

/* Featured */

const featuredMediaStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/featuredmedia');
  },
  filename: generateFilename,
});

const featuredMediaUpload = multer({
  storage: featuredMediaStorage,
});

exports.featuredimage = featuredMediaUpload.array('featuredimage', 1);

